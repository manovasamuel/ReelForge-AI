import type { Competitor } from "@/types/competitor";
import type { CompetitorProfileAnalysis } from "@/types/competitor-analysis";

/**
 * Contract for Competitor Profile Analysis provider.
 */
export interface ICompetitorAnalysisProvider {
  analyzeCompetitor(competitor: Competitor): Promise<CompetitorProfileAnalysis>;
}
