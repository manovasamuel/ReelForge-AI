import { SubscriptionRepository } from "@/lib/db/repositories/subscription.repository";
import { PlanRepository } from "@/lib/db/repositories/plan.repository";
import { UsageRepository } from "@/lib/db/repositories/usage.repository";
import type { IUsageGuardResult } from "./plan.interface";

/**
 * Usage Guard Layer — ReelForge AI v2.0 Phase 6.
 *
 * Central gatekeeper that sits between API routes and execution engines (AI / Scraper).
 * Decides:
 *   1. Can this request execute?
 *   2. Which provider should run?
 *   3. Should deterministic/mock fallback be used?
 *   4. Should usage be recorded?
 *   5. Should the user receive an upgrade notification?
 *
 * Enforces Requirement 2 (Single gatekeeper) & Requirement 3 (Non-blocking fallback):
 * When quotas are exhausted, NEVER returns HTTP 403 or breaks workflows.
 * Instead, redirects execution to fallback engines and attaches metadata.
 */
export class UsageGuard {
  private static subRepo = new SubscriptionRepository();
  private static planRepo = new PlanRepository();
  private static usageRepo = new UsageRepository();

  /**
   * Guards Instagram Scraper Execution.
   *
   * @param userId User attempting scraping
   * @param requestedProvider Provider requested (e.g., 'apify', 'rapidapi', 'brightdata', 'mock')
   * @param executeLive Callback to execute live scraping
   * @param executeMock Callback to execute mock fallback scraping
   */
  public static async guardScraperExecution<T>(
    userId: string,
    requestedProvider: string,
    executeLive: () => Promise<T>,
    executeMock: () => Promise<T>
  ): Promise<IUsageGuardResult<T>> {
    // If requesting mock explicitly, execute mock without metering
    if (requestedProvider === "mock") {
      const data = await executeMock();
      return {
        authorized: true,
        provider: "mock",
        reason: "ok",
        upgradeAvailable: false,
        data,
      };
    }

    try {
      const sub = await this.subRepo.getSubscriptionByUserId(userId);
      const plan = await this.planRepo.getPlan(sub.planId);
      // Atomically check and reserve scraper quota (DB-001)
      const isReserved = await this.usageRepo.tryReserveScraperCall(userId, plan.monthlyScraperLimit);

      if (!isReserved) {
        console.warn(`[UsageGuard] Scraper quota exceeded for user ${userId}. Redirecting to mock.`);
        const data = await executeMock();
        return {
          authorized: true,
          provider: "mock",
          reason: "quota_exceeded",
          upgradeAvailable: sub.planId !== "enterprise",
          data,
        };
      }

      // Execute Live (quota was already atomically incremented in reservation)
      try {
        const data = await executeLive();
        return {
          authorized: true,
          provider: requestedProvider,
          reason: "ok",
          upgradeAvailable: false,
          data,
        };
      } catch (liveError) {
        // Refund atomic reservation if live provider execution failed
        await this.usageRepo.refundScraperCall(userId);
        throw liveError; // Re-throw to be caught by outer catch block for mock fallback
      }
    } catch (error) {
      console.error(`[UsageGuard] Error evaluating scraper guard for user ${userId}, falling back to mock:`, error);
      const data = await executeMock();
      return {
        authorized: true,
        provider: "mock",
        reason: "zero_key_fallback",
        upgradeAvailable: false,
        data,
      };
    }
  }

  /**
   * Guards AI Synthesis Execution.
   *
   * @param userId User attempting AI generation
   * @param requestedModel Model requested (e.g., 'gemini-2.5-pro', 'gpt-4o', 'claude-3-5-sonnet')
   * @param executeLive Callback to execute LLM synthesis (returns data + telemetry)
   * @param executeDeterministic Callback to execute deterministic heuristic fallback
   */
  public static async guardAiExecution<T>(
    userId: string,
    requestedModel: string,
    executeLive: () => Promise<{
      data: T;
      usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
      costUsd?: number;
      providerId: string;
    }>,
    executeDeterministic: () => Promise<T>
  ): Promise<
    IUsageGuardResult<T> & {
      telemetry?: {
        providerId: string;
        modelUsed: string;
        latencyMs: number;
        usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
        costEstimateUsd?: number;
        fallbackUsed: boolean;
        reason?: string;
        upgradeAvailable?: boolean;
      };
    }
  > {
    const startMs = Date.now();

    try {
      const sub = await this.subRepo.getSubscriptionByUserId(userId);
      const plan = await this.planRepo.getPlan(sub.planId);
      const usage = await this.usageRepo.getCurrentUsage(userId);

      const totalUsedTokens = usage.aiPromptTokens + usage.aiCompletionTokens;
      const isExceeded = plan.monthlyAiTokenLimit !== -1 && totalUsedTokens >= plan.monthlyAiTokenLimit;
      const hasModelAccess = plan.modelAccess.includes(requestedModel) || plan.modelAccess.includes("all");

      if (isExceeded || !hasModelAccess) {
        const reason = isExceeded ? "quota_exceeded" : "zero_key_fallback";
        console.warn(`[UsageGuard] AI guard check failed for user ${userId} (exceeded: ${isExceeded}, modelAccess: ${hasModelAccess}). Redirecting to deterministic.`);
        const data = await executeDeterministic();
        const latencyMs = Date.now() - startMs;

        return {
          authorized: true,
          provider: "deterministic",
          reason: isExceeded ? "quota_exceeded" : "zero_key_fallback",
          upgradeAvailable: sub.planId !== "enterprise",
          data,
          telemetry: {
            providerId: "deterministic",
            modelUsed: "deterministic-fallback",
            latencyMs,
            usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            costEstimateUsd: 0,
            fallbackUsed: true,
            reason: isExceeded ? "quota_exceeded" : undefined,
            upgradeAvailable: sub.planId !== "enterprise",
          },
        };
      }

      // Execute Live LLM
      const result = await executeLive();
      const latencyMs = Date.now() - startMs;
      const usageData = result.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
      const costUsd = result.costUsd ?? 0;

      // Record Usage
      await this.usageRepo.recordAiUsage(
        userId,
        usageData.promptTokens || 0,
        usageData.completionTokens || 0,
        costUsd
      );

      return {
        authorized: true,
        provider: result.providerId,
        reason: "ok",
        upgradeAvailable: false,
        data: result.data,
        telemetry: {
          providerId: result.providerId,
          modelUsed: requestedModel,
          latencyMs,
          usage: usageData,
          costEstimateUsd: costUsd,
          fallbackUsed: false,
        },
      };
    } catch (error) {
      console.error(`[UsageGuard] Error during AI live execution for user ${userId}, falling back to deterministic:`, error);
      const data = await executeDeterministic();
      const latencyMs = Date.now() - startMs;

      return {
        authorized: true,
        provider: "deterministic",
        reason: "zero_key_fallback",
        upgradeAvailable: false,
        data,
        telemetry: {
          providerId: "deterministic",
          modelUsed: "deterministic-fallback",
          latencyMs,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          costEstimateUsd: 0,
          fallbackUsed: true,
        },
      };
    }
  }
}
