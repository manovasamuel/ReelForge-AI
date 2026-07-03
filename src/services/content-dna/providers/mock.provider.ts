import type { ContentIntelligenceReport } from "@/types/content-intelligence";
import type { ContentDNAReport } from "@/types/content-dna";
import type { IContentDNAProvider } from "../provider.interface";
import { aggregateContentDNA } from "../content-dna.utils";

/**
 * Concrete mock provider simulating Content DNA aggregation latency.
 */
export class MockContentDNAProvider implements IContentDNAProvider {
  async generateDNA(reports: ContentIntelligenceReport[]): Promise<ContentDNAReport> {
    // Simulate realistic aggregation computation delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return aggregateContentDNA(reports);
  }
}
