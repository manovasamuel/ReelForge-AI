import type { IContentIntelligenceProvider } from "../provider.interface";
import { MockContentIntelligenceProvider } from "./mock.provider";

/**
 * Factory returning active Content Intelligence provider based on env.
 */
export function getContentIntelligenceProvider(): IContentIntelligenceProvider {
  const provider = process.env.CONTENT_INTELLIGENCE_PROVIDER ?? "mock";

  switch (provider) {
    case "mock":
    default:
      return new MockContentIntelligenceProvider();
  }
}
