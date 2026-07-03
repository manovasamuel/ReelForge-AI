import type { InstagramProfile } from "@/types/instagram";
import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { IBrandIntelligenceProvider } from "./provider.interface";
import { AppError } from "@/lib/errors";

export class BrandIntelligenceError extends AppError {
  constructor(message: string) {
    super(`[Brand Intelligence] ${message}`, "BRAND_INTELLIGENCE_ERROR", 500);
    this.name = "BrandIntelligenceError";
  }
}

/**
 * Orchestration service for Brand Intelligence report generation.
 */
export class BrandIntelligenceService {
  constructor(private readonly provider: IBrandIntelligenceProvider) {}

  async analyzeBrand(profile: InstagramProfile): Promise<BrandIntelligenceReport> {
    if (!profile || !profile.username) {
      throw new BrandIntelligenceError("Valid profile object is required for analysis.");
    }

    try {
      return await this.provider.analyzeBrand(profile);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : "Failed to analyze brand intelligence.";
      throw new BrandIntelligenceError(message);
    }
  }
}
