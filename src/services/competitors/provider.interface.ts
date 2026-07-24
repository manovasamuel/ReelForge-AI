import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { Competitor } from "@/types/competitor";
import type { ProfileClassificationResult } from "@/types/competitor-intelligence";

/**
 * Contract for any Competitor Discovery provider.
 * Follows the swappable provider architecture established in previous phases.
 */
export interface ICompetitorProvider {
  discoverCompetitors(report: BrandIntelligenceReport, strategy?: ProfileClassificationResult): Promise<Competitor[]>;
}
