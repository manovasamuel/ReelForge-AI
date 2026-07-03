import type { ContentIntelligenceReport } from "@/types/content-intelligence";
import type { ContentDNAReport } from "@/types/content-dna";

/**
 * Contract for Content DNA provider.
 */
export interface IContentDNAProvider {
  generateDNA(reports: ContentIntelligenceReport[]): Promise<ContentDNAReport>;
}
