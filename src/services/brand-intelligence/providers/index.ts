import type { IBrandIntelligenceProvider } from "../provider.interface";
import { MockBrandIntelligenceProvider } from "./mock.provider";

/**
 * Provider factory for Brand Intelligence Engine.
 * Single point of switch when plugging in LLM or API providers in later phases.
 */
export function getBrandIntelligenceProvider(): IBrandIntelligenceProvider {
  const provider = process.env.BRAND_INTELLIGENCE_PROVIDER ?? "mock";

  switch (provider) {
    case "mock":
    default:
      return new MockBrandIntelligenceProvider();
  }
}
