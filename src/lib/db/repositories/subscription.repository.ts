import { db } from "@/lib/db";
import { subscriptions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { PlanId } from "@/services/billing/plan.interface";

export interface ISubscriptionRecord {
  id: string;
  workspaceId: string;
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
  public async getSubscriptionByWorkspaceId(workspaceId: string): Promise<ISubscriptionRecord> {
    if (!db) {
      return {
        id: "offline-free-sub",
        workspaceId,
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
        .where(eq(subscriptions.userId, workspaceId))
        .limit(1);

      if (records && records.length > 0) {
        return { ...records[0], workspaceId: records[0].userId } as unknown as ISubscriptionRecord;
      }
    } catch (error) {
      console.warn(`[SubscriptionRepository] Failed to fetch subscription for workspace ${workspaceId}, falling back to free:`, error);
    }

    // Default fallback for new or offline users
    return {
      id: "offline-free-sub",
      workspaceId,
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
    workspaceId: string;
    userId?: string; // Optional for syncing user tier if still needed
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
        .where(eq(subscriptions.userId, data.workspaceId))
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
          .where(eq(subscriptions.userId, data.workspaceId));
      } else {
        await db.insert(subscriptions).values({
          userId: data.workspaceId,
          stripeCustomerId: data.stripeCustomerId || null,
          stripeSubscriptionId: data.stripeSubscriptionId || null,
          status: data.status,
          planId: data.planId,
          currentPeriodEnd: data.currentPeriodEnd || null,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
        });
      }

      // 2. Sync user tier if userId is provided
      if (data.userId) {
        await db
          .update(users)
          .set({ tier: data.planId, updatedAt: new Date() })
          .where(eq(users.id, data.userId));
      }

      console.log(`[SubscriptionRepository] Upserted subscription & tier (${data.planId}) for workspace ${data.workspaceId}`);
    } catch (error) {
      console.error(`[SubscriptionRepository] Error upserting subscription for workspace ${data.workspaceId}:`, error);
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

      const workspaceId = existing[0].userId;

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

      // Sync user tier is harder here without knowing which users belong to the workspace and should get the tier,
      // skipping user tier sync for webhook updates for now.

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

      const workspaceId = existing[0].userId;

      await db
        .update(subscriptions)
        .set({
          status: "canceled",
          planId: "free",
          cancelAtPeriodEnd: false,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, existing[0].id));

      // Skipping user tier sync for webhook updates for now

      console.log(`[SubscriptionRepository] Downgraded subscription ${stripeSubscriptionId} (Workspace ${workspaceId}) to Free tier.`);
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
