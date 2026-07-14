import type { ICompetitorProvider } from "../provider.interface";
import { MockCompetitorProvider } from "./mock.provider";
import { LiveCompetitorProvider } from "./live.provider";

/**
 * Provider factory for Competitor Discovery Engine.
 * Supports swappable resolution between 'live' candidate/cache bridge and 'mock' heuristic engine.
 */
export function getCompetitorProvider(providerId?: string): ICompetitorProvider {
  const provider = providerId || process.env.COMPETITORS_PROVIDER || (process.env.INSTAGRAM_PROVIDER === "apify" ? "live" : "mock");

  switch (provider) {
    case "live":
      return new LiveCompetitorProvider();
    case "mock":
    default:
      return new MockCompetitorProvider();
  }
}
