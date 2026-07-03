import type { CollectedContentItem } from "@/types/content-collection";
import type { ContentIntelligenceReport } from "@/types/content-intelligence";
import type { IContentIntelligenceProvider } from "./provider.interface";
import { AppError } from "@/lib/errors";

export class ContentIntelligenceError extends AppError {
  constructor(message: string) {
    super(`[Content Intelligence] ${message}`, "CONTENT_INTELLIGENCE_ERROR", 500);
    this.name = "ContentIntelligenceError";
  }
}

export class ContentIntelligenceService {
  constructor(private readonly provider: IContentIntelligenceProvider) {}

  async analyzeContentItems(items: CollectedContentItem[]): Promise<ContentIntelligenceReport[]> {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ContentIntelligenceError("At least one selected content item is required for intelligence analysis.");
    }

    try {
      return await this.provider.analyzeContentItems(items);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : "Failed to generate content intelligence.";
      throw new ContentIntelligenceError(message);
    }
  }
}
