/**
 * Plan & Billing Domain Interfaces — ReelForge AI v2.0 Phase 6.
 *
 * Enforces zero hardcoding of quotas in business logic.
 * All limits, features, prices, and model access rules are defined in data schemas
 * and managed by PlanRepository and UsageGuard.
 */

export type PlanId = "free" | "pro" | "enterprise";

export interface IPlanConfig {
  id: PlanId;
  name: string;
  monthlyScraperLimit: number; // -1 indicates unlimited
  monthlyAiTokenLimit: number; // -1 indicates unlimited
  features: string[];
  priceUsd: number;
  modelAccess: string[];
  priorityQueue: boolean;
}

export interface IUsageGuardResult<T> {
  authorized: boolean;
  provider: string;
  reason: "ok" | "quota_exceeded" | "zero_key_fallback";
  upgradeAvailable: boolean;
  data: T;
}

export interface IBillingSummary {
  plan: IPlanConfig;
  subscription: {
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    stripeCustomerId: string | null;
  } | null;
  usage: {
    scraperCallsCount: number;
    aiPromptTokens: number;
    aiCompletionTokens: number;
    totalTokens: number;
    totalCostUsd: number;
    billingPeriodStart: string;
    billingPeriodEnd: string;
  };
}
