import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { Competitor } from "@/types/competitor";
import type { ICompetitorProvider } from "./provider.interface";
import { AppError } from "@/lib/errors";

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

  async discoverCompetitors(report: BrandIntelligenceReport): Promise<Competitor[]> {
    if (!report || !report.industry) {
      throw new CompetitorDiscoveryError("Valid Brand Intelligence report is required for competitor discovery.");
    }

    try {
      return await this.provider.discoverCompetitors(report);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : "Failed to discover competitors.";
      throw new CompetitorDiscoveryError(message);
    }
  }
}
