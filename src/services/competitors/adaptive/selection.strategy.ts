import type { GrowthStage, CompetitorSelectionMatrix } from "@/types/competitor-intelligence";
import { getStageConfig } from "@/config/competitor.config";

/**
 * Architectural Foundation for the Selection Strategy (Phase 1).
 * Translates a Growth Stage into a highly specific configuration-driven Matrix.
 */
export class AdaptiveSelectionStrategy {
  /**
   * Generates a selection matrix strategy based on the profile's classified growth stage.
   */
  public static getStrategyForStage(stage: GrowthStage): CompetitorSelectionMatrix {
    const config = getStageConfig(stage);
    if (!config) {
      throw new Error(`[AdaptiveSelectionStrategy] Missing configuration for stage: ${stage}`);
    }

    return config.matrix;
  }

  /**
   * Helper to fetch the Next Realistic Objective for prompting.
   */
  public static getNextObjectiveForStage(stage: GrowthStage): string {
    const config = getStageConfig(stage);
    return config?.nextObjective || "Optimize content and grow audience.";
  }
}
