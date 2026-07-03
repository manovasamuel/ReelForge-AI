import type { ICompetitorProvider } from "../provider.interface";
import { MockCompetitorProvider } from "./mock.provider";

/**
 * Provider factory for Competitor Discovery Engine.
 * Enables zero-friction vendor swapping in future phases.
 */
export function getCompetitorProvider(): ICompetitorProvider {
  const provider = process.env.COMPETITORS_PROVIDER ?? "mock";

  switch (provider) {
    case "mock":
    default:
      return new MockCompetitorProvider();
  }
}
