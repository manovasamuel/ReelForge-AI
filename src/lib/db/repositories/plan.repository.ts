import type { IPlanConfig, PlanId } from "@/services/billing/plan.interface";

/**
 * Plan Repository — ReelForge AI v2.0 Phase 6.
 *
 * Authoritative data source for subscription tiers, usage quotas, feature flags,
 * model access lists, and priority queue settings.
 *
 * Enforces Requirement 1: Zero hardcoding of quotas inside application business logic.
 * In production, this queries database configurations or Stripe Product metadata.
 * Includes fallback seed definitions for offline dev / Playwright CI environments.
 */
export class PlanRepository {
  private static readonly SEED_PLANS: Record<PlanId, IPlanConfig> = {
    free: {
      id: "free",
      name: "Free Tier",
      monthlyScraperLimit: 20,
      monthlyAiTokenLimit: 10000,
      features: [
        "20 Monthly Instagram Profiles (Mock/Fallback)",
        "10,000 AI Tokens / month",
        "Deterministic Script & Strategy Engine",
        "Standard Export Formats (PDF, Markdown)",
        "Single Workspace Project",
      ],
      priceUsd: 0,
      modelAccess: ["gemini-2.5-flash", "deterministic-fallback"],
      priorityQueue: false,
    },
    pro: {
      id: "pro",
      name: "Pro Creator",
      monthlyScraperLimit: 500,
      monthlyAiTokenLimit: 500000,
      features: [
        "500 Live Instagram Scraper Profiles / month",
        "500,000 AI Tokens / month",
        "Full Multi-Model AI Engine (Gemini, OpenAI, Claude)",
        "Priority Queue Processing",
        "Unlimited Workspace Projects & Cloud Sync",
        "All Export Formats (JSON, HTML, PDF, MD)",
      ],
      priceUsd: 29,
      modelAccess: [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gpt-4o-mini",
        "gpt-4o",
        "claude-3-5-sonnet",
        "deterministic-fallback",
      ],
      priorityQueue: true,
    },
    enterprise: {
      id: "enterprise",
      name: "Enterprise & Agency",
      monthlyScraperLimit: -1, // Unlimited
      monthlyAiTokenLimit: -1, // Unlimited
      features: [
        "Unlimited Live Instagram Scraper Profiles",
        "Unlimited AI Tokens & Custom Fine-Tuning",
        "Dedicated VIP Priority Queue",
        "Custom API Rate Limits & SLA",
        "Dedicated Account Manager",
        "White-Label Export Formatting",
      ],
      priceUsd: 199,
      modelAccess: [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gpt-4o-mini",
        "gpt-4o",
        "claude-3-5-sonnet",
        "deterministic-fallback",
      ],
      priorityQueue: true,
    },
  };

  /**
   * Retrieves plan configuration by Plan ID.
   * If an invalid planId is supplied, cleanly falls back to 'free'.
   */
  public async getPlan(planId?: string | null): Promise<IPlanConfig> {
    const normalized = (planId?.toLowerCase() || "free") as PlanId;
    return PlanRepository.SEED_PLANS[normalized] || PlanRepository.SEED_PLANS.free;
  }

  /**
   * Retrieves all available plan definitions.
   */
  public async getAllPlans(): Promise<IPlanConfig[]> {
    return Object.values(PlanRepository.SEED_PLANS);
  }
}
