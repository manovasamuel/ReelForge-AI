import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { SubscriptionRepository } from "@/lib/db/repositories/subscription.repository";
import type { PlanId } from "@/services/billing/plan.interface";
import { db } from "@/lib/db";
import { stripeWebhookEvents } from "@/lib/db/schema";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" as any })
  : null;

const subRepo = new SubscriptionRepository();

// In-memory set of processed webhook event IDs for idempotency in serverless/long-running workers
const processedEvents = new Set<string>();

/**
 * POST /api/webhooks/stripe
 *
 * Cryptographically verifies Stripe webhooks and processes subscription lifecycle events idempotently.
 * Supports all 6 required events:
 *   1. checkout.session.completed
 *   2. customer.subscription.created
 *   3. customer.subscription.updated
 *   4. customer.subscription.deleted
 *   5. invoice.payment_succeeded
 *   6. invoice.payment_failed
 */
export async function POST(req: NextRequest) {
  if (!stripe) {
    console.warn("[Stripe Webhook] STRIPE_SECRET_KEY missing. Ignoring webhook in dev mode.");
    return NextResponse.json({ received: true, simulated: true });
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing stripe-signature or STRIPE_WEBHOOK_SECRET" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("[Stripe Webhook] Signature verification failed:", error);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  // L1 In-memory idempotency check
  if (processedEvents.has(event.id)) {
    console.log(`[Stripe Webhook] Event ${event.id} already processed in L1 cache. Skipping.`);
    return NextResponse.json({ received: true, idempotent: true });
  }

  // L2 Database atomic idempotency check (BILL-001)
  if (db) {
    try {
      const inserted = await db
        .insert(stripeWebhookEvents)
        .values({
          eventId: event.id,
          eventType: event.type,
          processedAt: new Date(),
        })
        .onConflictDoNothing({ target: [stripeWebhookEvents.eventId] })
        .returning({ id: stripeWebhookEvents.id });

      if (inserted.length === 0) {
        console.log(`[Stripe Webhook] Event ${event.id} already processed in DB. Skipping.`);
        processedEvents.add(event.id);
        return NextResponse.json({ received: true, idempotent: true });
      }
    } catch (err) {
      console.warn(`[Stripe Webhook] DB idempotency check failed for ${event.id}, relying on L1 cache:`, err);
    }
  }

  processedEvents.add(event.id);

  // Keep in-memory set from growing unboundedly
  if (processedEvents.size > 5000) {
    const first = processedEvents.values().next().value;
    if (first) processedEvents.delete(first);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        if (session.mode === "subscription") {
          const userId = session.client_reference_id || (session.metadata?.userId as string);
          const planId = (session.metadata?.planId || "pro") as PlanId;
          const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

          if (userId && subscriptionId) {
            await subRepo.upsertSubscription({
              userId,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              status: "active",
              planId,
            });
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as any;
        const subscriptionId = sub.id;
        const status = sub.status;
        const cancelAtPeriodEnd = sub.cancel_at_period_end;
        const currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;

        // Determine planId from price metadata or amount
        let planId: PlanId = "pro";
        if (sub.items && sub.items.data?.length > 0) {
          const priceId = sub.items.data[0].price?.id;
          if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
            planId = "enterprise";
          } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
            planId = "pro";
          }
        }

        await subRepo.updateByStripeSubscriptionId(subscriptionId, {
          status,
          planId,
          currentPeriodEnd,
          cancelAtPeriodEnd,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        await subRepo.downgradeToFreeByStripeId(sub.id);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
        if (subscriptionId) {
          await subRepo.updateByStripeSubscriptionId(subscriptionId, {
            status: "active",
            planId: "pro", // Will be verified/updated by subscription.updated
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
        if (subscriptionId) {
          await subRepo.markPastDueByStripeId(subscriptionId);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`[Stripe Webhook] Error processing event ${event.type}:`, error);
    return NextResponse.json({ error: "Failed to process webhook event" }, { status: 500 });
  }
}
