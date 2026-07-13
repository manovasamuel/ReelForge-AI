import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/server-user";
import { SubscriptionRepository } from "@/lib/db/repositories/subscription.repository";
import { PlanRepository } from "@/lib/db/repositories/plan.repository";
import { UsageRepository } from "@/lib/db/repositories/usage.repository";
import { AIOrchestratorProvider } from "@/services/ai/providers/orchestrator.provider";

const subRepo = new SubscriptionRepository();
const planRepo = new PlanRepository();
const usageRepo = new UsageRepository();

/**
 * GET /api/ai/telemetry/summary
 *
 * Authenticated, user-scoped telemetry summary endpoint for Milestone 5 Stage 2.
 * Returns persisted historical token consumption and real-time AI provider health metrics.
 *
 * Strict Security & Privacy Guarantees:
 * - Enforces 401 authentication; never exposes another user's metrics or prompts.
 * - Clearly distinguishes persisted usage data (`persistedUsage`) from runtime health (`runtimeHealth`).
 * - Sanitizes errors and never leaks API keys, Clerk IDs, or environment variables.
 */
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to access telemetry summary.",
          },
        },
        { status: 401 }
      );
    }

    // 1. Query persisted subscription, plan, and usage records for the authenticated user
    const sub = await subRepo.getSubscriptionByUserId(userId);
    const plan = await planRepo.getPlan(sub.planId);
    const usage = await usageRepo.getCurrentUsage(userId);

    // 2. Perform safe token accounting and quota calculations
    const promptTokens = Number(usage.aiPromptTokens || 0);
    const completionTokens = Number(usage.aiCompletionTokens || 0);
    const totalTokens = promptTokens + completionTokens;
    const aiTokenLimit = Number(plan.monthlyAiTokenLimit ?? 0);

    const isUnlimited = aiTokenLimit === -1;
    let remainingTokens: number | null = null;
    let usagePercentage: number | null = null;

    if (isUnlimited) {
      remainingTokens = null;
      usagePercentage = null;
    } else if (aiTokenLimit > 0) {
      remainingTokens = Math.max(0, aiTokenLimit - totalTokens);
      usagePercentage = Number(Math.min(100, Math.max(0, (totalTokens / aiTokenLimit) * 100)).toFixed(2));
    } else {
      // Limit is explicitly 0
      remainingTokens = 0;
      usagePercentage = totalTokens > 0 ? 100 : 0;
    }

    // Format estimated USD cost
    let totalEstimatedCostUsd = "0.0000";
    if (typeof usage.totalCostUsd === "number") {
      totalEstimatedCostUsd = usage.totalCostUsd.toFixed(4);
    } else if (usage.totalCostUsd) {
      const parsedCost = parseFloat(String(usage.totalCostUsd));
      totalEstimatedCostUsd = !isNaN(parsedCost) ? parsedCost.toFixed(4) : "0.0000";
    }

    // 3. Retrieve production-safe runtime health from AIOrchestratorProvider
    const runtimeHealth = AIOrchestratorProvider.getHealthStatus();

    // 4. Return structured summary distinguishing persisted metrics from runtime health
    return NextResponse.json(
      {
        status: "ok",
        data: {
          planId: sub.planId,
          planName: plan.name,
          persistedUsage: {
            billingPeriodStart: usage.billingPeriodStart ? new Date(usage.billingPeriodStart).toISOString() : null,
            billingPeriodEnd: usage.billingPeriodEnd ? new Date(usage.billingPeriodEnd).toISOString() : null,
            aiPromptTokens: promptTokens,
            aiCompletionTokens: completionTokens,
            totalTokens,
            aiTokenLimit,
            remainingTokens,
            usagePercentage,
            totalEstimatedCostUsd,
            isUnlimited,
          },
          runtimeHealth: {
            providers: runtimeHealth,
            timestamp: new Date().toISOString(),
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[TelemetrySummary] Error fetching user telemetry summary:", error);
    return NextResponse.json(
      {
        error: {
          code: "TELEMETRY_SUMMARY_FAILED",
          message: "An unexpected error occurred while retrieving user telemetry summary.",
        },
      },
      { status: 500 }
    );
  }
}
