import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { Competitor } from "@/types/competitor";

/**
 * Contract for any Competitor Discovery provider.
 * Follows the swappable provider architecture established in previous phases.
 */
export interface ICompetitorProvider {
  discoverCompetitors(report: BrandIntelligenceReport): Promise<Competitor[]>;
}
