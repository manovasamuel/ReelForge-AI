import type { Competitor } from "@/types/competitor";
import type { CompetitorProfileAnalysis } from "@/types/competitor-analysis";
import type { ICompetitorAnalysisProvider } from "./provider.interface";
import { AppError } from "@/lib/errors";

export class CompetitorAnalysisError extends AppError {
  constructor(message: string) {
    super(`[Competitor Analysis] ${message}`, "COMPETITOR_ANALYSIS_ERROR", 500);
    this.name = "CompetitorAnalysisError";
  }
}

export class CompetitorAnalysisService {
  constructor(private readonly provider: ICompetitorAnalysisProvider) {}

  async analyzeCompetitor(competitor: Competitor): Promise<CompetitorProfileAnalysis> {
    if (!competitor || !competitor.username) {
      throw new CompetitorAnalysisError("Valid competitor profile data is required.");
    }

    try {
      return await this.provider.analyzeCompetitor(competitor);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : "Failed to analyze competitor profile.";
      throw new CompetitorAnalysisError(message);
    }
  }
}
