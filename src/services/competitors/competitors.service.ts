import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { Competitor } from "@/types/competitor";
import type { InstagramProfile } from "@/types/instagram";
import type { ProfileClassificationResult, CompetitorIntelligenceTelemetry } from "@/types/competitor-intelligence";
import type { ICompetitorProvider } from "./provider.interface";
import { AppError } from "@/lib/errors";
import { getCompetitorConfig } from "@/config/competitor.config";
import { GrowthStageClassifier } from "./adaptive/growth-stage.classifier";
import { 
  FollowerScorer, 
  EngagementRateScorer, 
  AverageLikesScorer, 
  EngagementToFollowerRatioScorer, 
  ContentMaturityScorer 
} from "./adaptive/scorers/initial-scorers";

export class CompetitorDiscoveryError extends AppError {
  constructor(message: string) {
    super(`[Competitor Discovery] ${message}`, "COMPETITOR_DISCOVERY_ERROR", 500);
    this.name = "CompetitorDiscoveryError";
  }
}

/**
 * Orchestration service for Competitor Discovery.
 */
export class CompetitorService {
  constructor(private readonly provider: ICompetitorProvider) {}

  async discoverCompetitors(report: BrandIntelligenceReport, baseProfile?: InstagramProfile): Promise<Competitor[]> {
    if (!report || !report.industry) {
      throw new CompetitorDiscoveryError("Valid Brand Intelligence report is required for competitor discovery.");
    }

    // Phase 4: Adaptive Competitor Intelligence - Structured Telemetry & Adaptive Mode
    const config = getCompetitorConfig();
    let classificationResult: ProfileClassificationResult | undefined = undefined;
    
    const telemetry: CompetitorIntelligenceTelemetry = {
      executed: false,
      mode: config.mode,
      success: false,
      durationMs: 0,
      timestamp: new Date().toISOString(),
    };

    if (config.mode !== "disabled" && baseProfile) {
      const startTime = Date.now();
      try {
        const classifier = new GrowthStageClassifier();
        classifier.registerScorer(new FollowerScorer());
        classifier.registerScorer(new EngagementRateScorer());
        classifier.registerScorer(new AverageLikesScorer());
        classifier.registerScorer(new EngagementToFollowerRatioScorer());
        classifier.registerScorer(new ContentMaturityScorer());

        classificationResult = await classifier.classify(baseProfile);
        
        telemetry.executed = true;
        telemetry.success = true;
        telemetry.durationMs = Date.now() - startTime;
        telemetry.growthStage = classificationResult.growthStage;
        telemetry.totalScore = classificationResult.totalScore;
        telemetry.matrix = classificationResult.matrix;

      } catch (err) {
        telemetry.executed = true;
        telemetry.success = false;
        telemetry.durationMs = Date.now() - startTime;
        telemetry.fallbackReason = err instanceof Error ? err.message : "Classification failed";
        console.warn(`[CompetitorService] Adaptive Intelligence classification failed. Falling back to legacy.`, err);
      }
      
      // Emit structured diagnostic telemetry
      console.log(JSON.stringify({ event: "AdaptiveCompetitorIntelligence", telemetry }, null, 2));
    }

    try {
      // If mode is adaptive and classification succeeded, pass it to the provider.
      // Otherwise, gracefully fall back to legacy discovery.
      const activeStrategy = (config.mode === "adaptive" && telemetry.success) ? classificationResult : undefined;
      return await this.provider.discoverCompetitors(report, activeStrategy);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : "Failed to discover competitors.";
      throw new CompetitorDiscoveryError(message);
    }
  }
}
