import type { CollectedContentItem } from "@/types/content-collection";
import type { ContentIntelligenceReport } from "@/types/content-intelligence";

/**
 * Contract for Content Intelligence provider.
 */
export interface IContentIntelligenceProvider {
  analyzeContentItems(items: CollectedContentItem[]): Promise<ContentIntelligenceReport[]>;
}
