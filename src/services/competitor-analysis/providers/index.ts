import type { ICompetitorAnalysisProvider } from "../provider.interface";
import { MockCompetitorAnalysisProvider } from "./mock.provider";

/**
 * Factory returning active Competitor Analysis provider based on env.
 */
export function getCompetitorAnalysisProvider(): ICompetitorAnalysisProvider {
  const provider = process.env.COMPETITOR_ANALYSIS_PROVIDER ?? "mock";

  switch (provider) {
    case "mock":
    default:
      return new MockCompetitorAnalysisProvider();
  }
}
