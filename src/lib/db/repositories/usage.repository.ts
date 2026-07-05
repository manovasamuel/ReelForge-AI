import { db } from "@/lib/db";
import { usage } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { sql } from "drizzle-orm";

export interface IUsageRecord {
  id: number;
  userId: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  scraperCallsCount: number;
  aiPromptTokens: number;
  aiCompletionTokens: number;
  totalCostUsd: string | number;
  updatedAt: Date;
}

/**
 * Usage Repository — ReelForge AI v2.0 Phase 6.
 *
 * Tracks monthly consumption cycles for live Instagram scraper calls,
 * AI prompt/completion tokens, and total estimated USD costs.
 *
 * Designed with fallback resilience: in offline dev or CI environments where
 * PostgreSQL is unreachable, returns safe baseline zero-records without breaking workflows.
 */
export class UsageRepository {
  /**
   * Calculates current calendar month billing period start and end dates.
   */
  private getCurrentBillingPeriod(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
    return { start, end };
  }

  /**
   * Retrieves current monthly usage record for a user.
   * If none exists for the current cycle, initializes and returns a fresh zero-record.
   */
  public async getCurrentUsage(userId: string): Promise<IUsageRecord> {
    const { start, end } = this.getCurrentBillingPeriod();

    if (!db) {
      return {
        id: -1,
        userId,
        billingPeriodStart: start,
        billingPeriodEnd: end,
        scraperCallsCount: 0,
        aiPromptTokens: 0,
        aiCompletionTokens: 0,
        totalCostUsd: "0.0000",
        updatedAt: new Date(),
      };
    }

    try {
      const records = await db
        .select()
        .from(usage)
        .where(
          and(
            eq(usage.userId, userId),
            gte(usage.billingPeriodStart, start),
            lte(usage.billingPeriodStart, end)
          )
        )
        .limit(1);

      if (records && records.length > 0) {
        return records[0] as IUsageRecord;
      }

      // Initialize new cycle record with conflict handling (DB-002)
      const inserted = await db
        .insert(usage)
        .values({
          userId,
          billingPeriodStart: start,
          billingPeriodEnd: end,
          scraperCallsCount: 0,
          aiPromptTokens: 0,
          aiCompletionTokens: 0,
          totalCostUsd: "0.0000",
        })
        .onConflictDoNothing({ target: [usage.userId, usage.billingPeriodStart] })
        .returning();

      if (inserted && inserted.length > 0) {
        return inserted[0] as IUsageRecord;
      }

      // Re-query if concurrent insert occurred during race window
      const retry = await db
        .select()
        .from(usage)
        .where(
          and(
            eq(usage.userId, userId),
            gte(usage.billingPeriodStart, start),
            lte(usage.billingPeriodStart, end)
          )
        )
        .limit(1);

      if (retry && retry.length > 0) {
        return retry[0] as IUsageRecord;
      }
    } catch (error) {
      console.warn(`[UsageRepository] Failed to get/init usage for user ${userId}, using in-memory zero-record:`, error);
    }

    // In-memory zero-record fallback for offline / CI / dev mode
    return {
      id: -1,
      userId,
      billingPeriodStart: start,
      billingPeriodEnd: end,
      scraperCallsCount: 0,
      aiPromptTokens: 0,
      aiCompletionTokens: 0,
      totalCostUsd: "0.0000",
      updatedAt: new Date(),
    };
  }

  /**
   * Atomically checks and reserves 1 scraper call against the monthly limit (DB-001).
   * Prevents check-then-act race conditions under concurrent requests.
   */
  public async tryReserveScraperCall(userId: string, maxLimit: number): Promise<boolean> {
    if (maxLimit === -1) {
      await this.incrementScraperCalls(userId);
      return true;
    }
    if (!db) return true; // Offline/CI mode allows fallback execution

    const current = await this.getCurrentUsage(userId);
    if (current.id === -1) {
      return current.scraperCallsCount < maxLimit;
    }

    try {
      const updated = await db
        .update(usage)
        .set({
          scraperCallsCount: sql`${usage.scraperCallsCount} + 1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(usage.id, current.id),
            sql`${usage.scraperCallsCount} < ${maxLimit}`
          )
        )
        .returning({ id: usage.id });

      return updated.length > 0;
    } catch (error) {
      console.warn(`[UsageRepository] Failed atomic tryReserveScraperCall for user ${userId}:`, error);
      return true; // Fallback to allowing execution if DB mutation errors in offline/dev
    }
  }

  /**
   * Refunds 1 scraper call if live execution fails after atomic reservation.
   */
  public async refundScraperCall(userId: string): Promise<void> {
    if (!db) return;
    const current = await this.getCurrentUsage(userId);
    if (current.id === -1) return;

    try {
      await db
        .update(usage)
        .set({
          scraperCallsCount: sql`GREATEST(0, ${usage.scraperCallsCount} - 1)`,
          updatedAt: new Date(),
        })
        .where(eq(usage.id, current.id));
    } catch (error) {
      console.warn(`[UsageRepository] Failed to refund scraper call for user ${userId}:`, error);
    }
  }

  /**
   * Increments monthly scraper calls count by 1.
   */
  public async incrementScraperCalls(userId: string): Promise<void> {
    if (!db) return;
    const current = await this.getCurrentUsage(userId);
    if (current.id === -1) return; // Skip DB mutation in offline fallback mode

    try {
      await db
        .update(usage)
        .set({
          scraperCallsCount: sql`${usage.scraperCallsCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(usage.id, current.id));
    } catch (error) {
      console.warn(`[UsageRepository] Failed to increment scraper calls for user ${userId}:`, error);
    }
  }

  /**
   * Records consumed AI prompt tokens, completion tokens, and estimated cost in USD.
   */
  public async recordAiUsage(
    userId: string,
    promptTokens: number,
    completionTokens: number,
    costUsd: number
  ): Promise<void> {
    if (!db) return;
    const current = await this.getCurrentUsage(userId);
    if (current.id === -1) return; // Skip DB mutation in offline fallback mode

    try {
      await db
        .update(usage)
        .set({
          aiPromptTokens: sql`${usage.aiPromptTokens} + ${promptTokens}`,
          aiCompletionTokens: sql`${usage.aiCompletionTokens} + ${completionTokens}`,
          totalCostUsd: sql`${usage.totalCostUsd} + ${costUsd.toFixed(4)}`,
          updatedAt: new Date(),
        })
        .where(eq(usage.id, current.id));
    } catch (error) {
      console.warn(`[UsageRepository] Failed to record AI usage for user ${userId}:`, error);
    }
  }
}
