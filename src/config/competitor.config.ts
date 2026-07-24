import type { CompetitorIntelligenceConfig, GrowthStage } from "@/types/competitor-intelligence";

const defaultConfig: CompetitorIntelligenceConfig = {
  mode: "observe", // default to observe mode initially
  stageThresholds: {
    "Foundation": 0,
    "Early Growth": 20,
    "Growth": 40,
    "Established": 60,
    "Authority": 80
  },
  stages: {
    "Foundation": {
      stage: "Foundation",
      description: "Just starting out. Building initial community and finding niche.",
      nextObjective: "Find product-market fit and establish a core community footprint.",
      matrix: {
        peerRatio: 50,
        aspirationalRatio: 30,
        leaderRatio: 0,
        emergingRatio: 20
      }
    },
    "Early Growth": {
      stage: "Early Growth",
      description: "Proved the concept. Sustaining momentum.",
      nextObjective: "Optimize hooks, sustain momentum, and break algorithmic plateaus.",
      matrix: {
        peerRatio: 40,
        aspirationalRatio: 30,
        leaderRatio: 10,
        emergingRatio: 20
      }
    },
    "Growth": {
      stage: "Growth",
      description: "Consistent velocity and expanding audience.",
      nextObjective: "Expand content pillars, explore monetization, and optimize viewer retention.",
      matrix: {
        peerRatio: 30,
        aspirationalRatio: 40,
        leaderRatio: 15,
        emergingRatio: 15
      }
    },
    "Established": {
      stage: "Established",
      description: "Recognized authority in the niche.",
      nextObjective: "Defend market share, launch products, and build mass audience appeal.",
      matrix: {
        peerRatio: 20,
        aspirationalRatio: 20,
        leaderRatio: 30,
        emergingRatio: 30
      }
    },
    "Authority": {
      stage: "Authority",
      description: "Industry titans and household names.",
      nextObjective: "Maintain cultural relevance, syndicate mainstream content, and build legacy.",
      matrix: {
        peerRatio: 10,
        aspirationalRatio: 10,
        leaderRatio: 60,
        emergingRatio: 20
      }
    }
  }
};

let activeConfig: CompetitorIntelligenceConfig = { ...defaultConfig };

/**
 * Gets the active Competitor Intelligence configuration.
 */
export function getCompetitorConfig(): CompetitorIntelligenceConfig {
  return activeConfig;
}

/**
 * Validates and updates the active configuration safely.
 */
export function setCompetitorConfig(newConfig: Partial<CompetitorIntelligenceConfig>): void {
  activeConfig = {
    ...activeConfig,
    ...newConfig,
  };
}

/**
 * Helper to fetch a specific stage's configuration.
 */
export function getStageConfig(stage: GrowthStage) {
  return activeConfig.stages[stage];
}
