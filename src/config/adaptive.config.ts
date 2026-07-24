import { AISchemaType } from "@/services/ai/provider.interface";

export type AdaptiveMode = "disabled" | "observe" | "adaptive";

export interface DomainAdaptiveConfig {
  acceptanceThreshold: number; // 0-100 scale
  penalties: Record<string, number>;
}

export interface AdaptiveConfig {
  mode: AdaptiveMode;
  maxRevisions: number;
  emaAlpha: number;
  penaltyCooldownMs: number;
  penaltyRecoveryPoints: number;
  minimumImprovementScore: number;
  domains: Record<AISchemaType, DomainAdaptiveConfig>;
}

/**
 * Standard configuration defaults for Adaptive Intelligence.
 * Used if environment-specific overrides are missing.
 */
export const DEFAULT_ADAPTIVE_CONFIG: AdaptiveConfig = {
  // Safe default: observe mode gathers metrics without changing behavior
  mode: "observe",
  
  // Hard limit: max 1 revision
  maxRevisions: 1,
  
  // Standard EMA smoothing factor (weights recent performance at 20%)
  emaAlpha: 0.2,
  
  // 60 seconds before time-decay recovery kicks in
  penaltyCooldownMs: 60000,
  
  // Recover 5 points per minute
  penaltyRecoveryPoints: 5,
  
  // Revisions must improve the score by at least this amount to be accepted
  minimumImprovementScore: 10,
  
  // Domain specific thresholds and explicit penalty definitions
  domains: {
    "script-generation": {
      acceptanceThreshold: 85,
      penalties: {
        MISSING_HOOK: 15,
        INVALID_PACING: 10,
        MISSING_CTA: 5,
        UNDER_WORD_COUNT: 10
      },
    },
    "brand-intelligence": {
      acceptanceThreshold: 80,
      penalties: {
        MISSING_KEY_METRIC: 10,
        SHALLOW_ANALYSIS: 15,
      },
    },
    "competitor-discovery": {
      acceptanceThreshold: 90,
      penalties: {
        MISSING_PROFILES: 10,
      },
    },
    "competitor-analysis": {
      acceptanceThreshold: 85,
      penalties: {
        MISSING_CONTENT_STRATEGY: 15,
      },
    },
    "content-intelligence": {
      acceptanceThreshold: 85,
      penalties: {
        MISSING_ENGAGEMENT_DATA: 10,
      },
    },
    "content-dna": {
      acceptanceThreshold: 85,
      penalties: {
        MISSING_FORMAT_PATTERNS: 10,
      },
    },
    "repurpose": {
      acceptanceThreshold: 85,
      penalties: {
        PLATFORM_CONSTRAINT_VIOLATION: 15,
      },
    },
    "vision-analysis": {
      acceptanceThreshold: 80,
      penalties: {
        MISSING_CONFIDENCE_SCORE: 10,
        MISSING_CAPTION: 5,
      }
    }
  },
};

/**
 * Validates and retrieves the active configuration.
 * Allows environment variables to safely override the execution mode.
 */
export function getAdaptiveConfig(): AdaptiveConfig {
  const envMode = process.env.NEXT_PUBLIC_ADAPTIVE_MODE || process.env.ADAPTIVE_MODE;
  
  let mode = DEFAULT_ADAPTIVE_CONFIG.mode;
  if (envMode === "disabled" || envMode === "observe" || envMode === "adaptive") {
    mode = envMode as AdaptiveMode;
  }

  return {
    ...DEFAULT_ADAPTIVE_CONFIG,
    mode,
  };
}
