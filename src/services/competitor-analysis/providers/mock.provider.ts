import type { Competitor } from "@/types/competitor";
import type { CompetitorProfileAnalysis } from "@/types/competitor-analysis";
import type { ICompetitorAnalysisProvider } from "../provider.interface";
import { inferCompetitorAnalysis } from "../competitor-analysis.utils";

/**
 * Deterministic MockCompetitorAnalysisProvider simulating network delay
 * and returning comprehensive 11-section analysis.
 */
export class MockCompetitorAnalysisProvider implements ICompetitorAnalysisProvider {
  private readonly SIMULATED_DELAY_MS = 1000;

  async analyzeCompetitor(competitor: Competitor): Promise<CompetitorProfileAnalysis> {
    await new Promise((resolve) => setTimeout(resolve, this.SIMULATED_DELAY_MS));
    return inferCompetitorAnalysis(competitor);
  }
}
