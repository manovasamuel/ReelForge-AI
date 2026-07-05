import { db } from "@/lib/db";
import { subscriptions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { PlanId } from "@/services/billing/plan.interface";

export interface ISubscriptionRecord {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: string; // 'active' | 'past_due' | 'canceled' | 'free'
  planId: string; // 'free' | 'pro' | 'enterprise'
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Subscription Repository — ReelForge AI v2.0 Phase 6.
 *
 * Manages user subscription lifecycle in Supabase PostgreSQL via Drizzle ORM.
 * Automatically synchronizes subscription tier changes with the `users.tier` column
 * to ensure fast RBAC and UI feature gating.
 */
export class SubscriptionRepository {
  /**
   * Retrieves subscription record for a user.
   * If none exists (or database is unreachable in dev/offline), returns a default Free tier object.
   */
  public async getSubscriptionByUserId(userId: string): Promise<ISubscriptionRecord> {
    if (!db) {
      return {
        id: "offline-free-sub",
        userId,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        status: "active",
        planId: "free",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    try {
      const records = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1);

      if (records && records.length > 0) {
        return records[0] as ISubscriptionRecord;
      }
    } catch (error) {
      console.warn(`[SubscriptionRepository] Failed to fetch subscription for user ${userId}, falling back to free:`, error);
    }

    // Default fallback for new or offline users
    return {
      id: "offline-free-sub",
      userId,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      status: "active",
      planId: "free",
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Upserts subscription record (e.g., on checkout.session.completed).
   * Also synchronizes `users.tier`.
   */
  public async upsertSubscription(data: {
    userId: string;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    status: string;
    planId: PlanId;
    currentPeriodEnd?: Date | null;
    cancelAtPeriodEnd?: boolean;
  }): Promise<void> {
    if (!db) {
      console.warn("[SubscriptionRepository] DB offline or unconfigured. Skipping subscription upsert.");
      return;
    }

    try {
      // 1. Check if record exists
      const existing = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, data.userId))
        .limit(1);

      if (existing && existing.length > 0) {
        await db
          .update(subscriptions)
          .set({
            stripeCustomerId: data.stripeCustomerId !== undefined ? data.stripeCustomerId : existing[0].stripeCustomerId,
            stripeSubscriptionId: data.stripeSubscriptionId !== undefined ? data.stripeSubscriptionId : existing[0].stripeSubscriptionId,
            status: data.status,
            planId: data.planId,
            currentPeriodEnd: data.currentPeriodEnd !== undefined ? data.currentPeriodEnd : existing[0].currentPeriodEnd,
            cancelAtPeriodEnd: data.cancelAtPeriodEnd !== undefined ? data.cancelAtPeriodEnd : existing[0].cancelAtPeriodEnd,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.userId, data.userId));
      } else {
        await db.insert(subscriptions).values({
          userId: data.userId,
          stripeCustomerId: data.stripeCustomerId || null,
          stripeSubscriptionId: data.stripeSubscriptionId || null,
          status: data.status,
          planId: data.planId,
          currentPeriodEnd: data.currentPeriodEnd || null,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
        });
      }

      // 2. Sync user tier
      await db
        .update(users)
        .set({ tier: data.planId, updatedAt: new Date() })
        .where(eq(users.id, data.userId));

      console.log(`[SubscriptionRepository] Upserted subscription & tier (${data.planId}) for user ${data.userId}`);
    } catch (error) {
      console.error(`[SubscriptionRepository] Error upserting subscription for user ${data.userId}:`, error);
      throw error;
    }
  }

  /**
   * Updates subscription status by Stripe Subscription ID (e.g., customer.subscription.updated).
   */
  public async updateByStripeSubscriptionId(
    stripeSubscriptionId: string,
    data: {
      status: string;
      planId: PlanId;
      currentPeriodEnd: Date | null;
      cancelAtPeriodEnd: boolean;
    }
  ): Promise<void> {
    if (!db) return;

    try {
      const existing = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
        .limit(1);

      if (!existing || existing.length === 0) {
        console.warn(`[SubscriptionRepository] Subscription ID ${stripeSubscriptionId} not found for update.`);
        return;
      }

      const userId = existing[0].userId;

      await db
        .update(subscriptions)
        .set({
          status: data.status,
          planId: data.planId,
          currentPeriodEnd: data.currentPeriodEnd,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, existing[0].id));

      // Sync user tier
      await db
        .update(users)
        .set({ tier: data.planId, updatedAt: new Date() })
        .where(eq(users.id, userId));

      console.log(`[SubscriptionRepository] Updated subscription ${stripeSubscriptionId} to status ${data.status} (${data.planId})`);
    } catch (error) {
      console.error(`[SubscriptionRepository] Error updating subscription ${stripeSubscriptionId}:`, error);
      throw error;
    }
  }

  /**
   * Downgrades subscription to Free tier (e.g., on customer.subscription.deleted).
   */
  public async downgradeToFreeByStripeId(stripeSubscriptionId: string): Promise<void> {
    if (!db) return;

    try {
      const existing = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
        .limit(1);

      if (!existing || existing.length === 0) return;

      const userId = existing[0].userId;

      await db
        .update(subscriptions)
        .set({
          status: "canceled",
          planId: "free",
          cancelAtPeriodEnd: false,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, existing[0].id));

      await db
        .update(users)
        .set({ tier: "free", updatedAt: new Date() })
        .where(eq(users.id, userId));

      console.log(`[SubscriptionRepository] Downgraded subscription ${stripeSubscriptionId} (User ${userId}) to Free tier.`);
    } catch (error) {
      console.error(`[SubscriptionRepository] Error downgrading subscription ${stripeSubscriptionId}:`, error);
      throw error;
    }
  }

  /**
   * Marks subscription as past_due (e.g., on invoice.payment_failed).
   */
  public async markPastDueByStripeId(stripeSubscriptionId: string): Promise<void> {
    if (!db) return;

    try {
      await db
        .update(subscriptions)
        .set({ status: "past_due", updatedAt: new Date() })
        .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));

      console.log(`[SubscriptionRepository] Marked subscription ${stripeSubscriptionId} as past_due.`);
    } catch (error) {
      console.error(`[SubscriptionRepository] Error marking subscription ${stripeSubscriptionId} past_due:`, error);
    }
  }
}
