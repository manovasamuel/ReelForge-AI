import type { IInstagramProvider } from "../provider.interface";
import { MockInstagramProvider } from "./mock.provider";

/**
 * Provider factory — the single point of truth for which Instagram
 * data source is active.
 *
 * Reads the INSTAGRAM_PROVIDER environment variable.
 * All other application code is completely unaware of this decision.
 *
 * To add a new provider:
 *   1. Create providers/your-provider.ts implementing IInstagramProvider
 *   2. Add a case below
 *   3. Set INSTAGRAM_PROVIDER=your-provider in environment
 */
export function getInstagramProvider(): IInstagramProvider {
  const provider = process.env.INSTAGRAM_PROVIDER ?? "mock";

  switch (provider) {
    // Phase 2+: uncomment and implement
    // case "rapidapi":
    //   return new RapidApiProvider();
    // case "apify":
    //   return new ApifyProvider();
    // case "brightdata":
    //   return new BrightDataProvider();

    case "mock":
    default:
      return new MockInstagramProvider();
  }
}
