import type { ContentIntelligenceReport } from "@/types/content-intelligence";
import type { ContentDNAReport } from "@/types/content-dna";
import type { IContentDNAProvider } from "./provider.interface";
import { getContentDNAProvider } from "./providers";

export class ContentDNAError extends Error {
  constructor(message: string, public readonly code: string = "CONTENT_DNA_ERROR") {
    super(message);
    this.name = "ContentDNAError";
  }
}

export class ContentDNAService {
  private readonly provider: IContentDNAProvider;

  constructor(provider?: IContentDNAProvider) {
    this.provider = provider ?? getContentDNAProvider();
  }

  async generateDNA(reports: ContentIntelligenceReport[]): Promise<ContentDNAReport> {
    if (!reports || reports.length === 0) {
      throw new ContentDNAError("Must provide at least one Content Intelligence report to aggregate DNA.", "INVALID_INPUT");
    }

    try {
      return await this.provider.generateDNA(reports);
    } catch (err) {
      if (err instanceof ContentDNAError) throw err;
      throw new ContentDNAError(
        err instanceof Error ? err.message : "Failed to generate Content DNA blueprint.",
        "AGGREGATION_FAILED"
      );
    }
  }
}
