import Stripe from "stripe";
import { SubscriptionRepository } from "@/lib/db/repositories/subscription.repository";
import { PlanRepository } from "@/lib/db/repositories/plan.repository";
import { UsageRepository } from "@/lib/db/repositories/usage.repository";
import type { IBillingSummary, PlanId } from "./plan.interface";

/**
 * Billing Service — ReelForge AI v2.0 Phase 6.
 *
 * Domain service managing Stripe Checkout session creation, Customer Portal sessions,
 * and user billing/usage summary aggregation.
 *
 * Includes fallback resilience for zero-key dev / Playwright CI environments
 * where STRIPE_SECRET_KEY is unconfigured.
 */
export class BillingService {
  private static stripe: Stripe | null = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" as any })
    : null;

  private static subRepo = new SubscriptionRepository();
  private static planRepo = new PlanRepository();
  private static usageRepo = new UsageRepository();

  /**
   * Retrieves complete billing summary for a user (tier, subscription status, usage counters).
   */
  public static async getBillingSummary(userId: string): Promise<IBillingSummary> {
    const sub = await this.subRepo.getSubscriptionByUserId(userId);
    const plan = await this.planRepo.getPlan(sub.planId);
    const usage = await this.usageRepo.getCurrentUsage(userId);

    const totalTokens = usage.aiPromptTokens + usage.aiCompletionTokens;
    const totalCostUsd = typeof usage.totalCostUsd === "string" ? parseFloat(usage.totalCostUsd) : usage.totalCostUsd;

    return {
      plan,
      subscription: {
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        stripeCustomerId: sub.stripeCustomerId,
      },
      usage: {
        scraperCallsCount: usage.scraperCallsCount,
        aiPromptTokens: usage.aiPromptTokens,
        aiCompletionTokens: usage.aiCompletionTokens,
        totalTokens,
        totalCostUsd: isNaN(totalCostUsd) ? 0 : totalCostUsd,
        billingPeriodStart: usage.billingPeriodStart.toISOString(),
        billingPeriodEnd: usage.billingPeriodEnd.toISOString(),
      },
    };
  }

  /**
   * Creates a Stripe Checkout Session for subscription upgrades.
   * If in zero-key dev mode, returns a mock success redirection URL.
   */
  public static async createCheckoutSession(
    userId: string,
    email: string,
    planId: PlanId,
    returnUrl: string
  ): Promise<{ url: string }> {
    if (!this.stripe) {
      console.warn("[BillingService] STRIPE_SECRET_KEY missing. Returning simulated checkout URL for dev mode.");
      return { url: `${returnUrl}?billing=mock_success&plan=${planId}` };
    }

    const priceId = planId === "enterprise" ? process.env.STRIPE_ENTERPRISE_PRICE_ID : process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId) {
      throw new Error(`Stripe Price ID not configured for plan ${planId}`);
    }

    const sub = await this.subRepo.getSubscriptionByUserId(userId);

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${returnUrl}?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?billing=cancelled`,
      client_reference_id: userId,
      metadata: { userId, planId },
    };

    if (sub.stripeCustomerId) {
      sessionConfig.customer = sub.stripeCustomerId;
    } else {
      sessionConfig.customer_email = email;
    }

    const session = await this.stripe.checkout.sessions.create(sessionConfig);
    if (!session.url) {
      throw new Error("Failed to generate Stripe Checkout URL");
    }

    return { url: session.url };
  }

  /**
   * Creates a Stripe Customer Portal Session for self-service management.
   * If in zero-key dev mode, returns a simulated portal redirection URL.
   */
  public static async createPortalSession(userId: string, returnUrl: string): Promise<{ url: string }> {
    if (!this.stripe) {
      console.warn("[BillingService] STRIPE_SECRET_KEY missing. Returning simulated portal URL for dev mode.");
      return { url: `${returnUrl}?portal=mock_opened` };
    }

    const sub = await this.subRepo.getSubscriptionByUserId(userId);
    if (!sub.stripeCustomerId) {
      throw new Error("No Stripe customer associated with this user account.");
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }
}
