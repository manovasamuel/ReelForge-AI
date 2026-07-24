import type { InstagramProfile } from "@/types/instagram";
import type { ClassificationSignal, ProfileClassificationResult, IClassificationSignalScorer } from "@/types/competitor-intelligence";
import { getCompetitorConfig, getStageConfig } from "@/config/competitor.config";

/**
 * Progressive Scoring Engine for Growth Stage Classification (Phase 2).
 */
export class GrowthStageClassifier {
  private scorers: IClassificationSignalScorer[] = [];

  constructor() {}

  /**
   * Registers a new independent scoring signal.
   */
  public registerScorer(scorer: IClassificationSignalScorer): void {
    this.scorers.push(scorer);
  }

  /**
   * Evaluates an Instagram Profile against all registered scoring signals
   * and maps the final weighted score to a specific GrowthStage.
   */
  public async classify(profile: InstagramProfile): Promise<ProfileClassificationResult> {
    const config = getCompetitorConfig();
    
    let totalWeight = 0;
    const signals: ClassificationSignal[] = [];

    // Run all independent scorers
    for (const scorer of this.scorers) {
      try {
        const signal = await scorer.score(profile);
        signals.push(signal);
        totalWeight += signal.weight;
      } catch (err) {
        console.warn(`[GrowthStageClassifier] Scorer ${scorer.name} failed. Skipping.`, err);
      }
    }

    // Calculate normalized weighted sum (0-100)
    let totalScore = 0;
    if (totalWeight > 0) {
      for (const signal of signals) {
        const normalizedWeight = signal.weight / totalWeight;
        totalScore += signal.score * normalizedWeight;
      }
    }
    
    totalScore = Math.round(totalScore);

    // Map totalScore to GrowthStage using dynamic thresholds
    let growthStage: import("@/types/competitor-intelligence").GrowthStage = "Foundation";
    
    if (totalScore >= config.stageThresholds["Authority"]) {
      growthStage = "Authority";
    } else if (totalScore >= config.stageThresholds["Established"]) {
      growthStage = "Established";
    } else if (totalScore >= config.stageThresholds["Growth"]) {
      growthStage = "Growth";
    } else if (totalScore >= config.stageThresholds["Early Growth"]) {
      growthStage = "Early Growth";
    }

    const stageConfig = getStageConfig(growthStage);

    return {
      growthStage,
      totalScore,
      signals,
      nextObjective: stageConfig.nextObjective,
      matrix: stageConfig.matrix,
    };
  }
}
