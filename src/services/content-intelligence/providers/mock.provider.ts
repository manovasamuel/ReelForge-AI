import type { CollectedContentItem } from "@/types/content-collection";
import type { ContentIntelligenceReport } from "@/types/content-intelligence";
import type { IContentIntelligenceProvider } from "../provider.interface";
import { inferContentIntelligence } from "../content-intelligence.utils";

/**
 * Deterministic MockContentIntelligenceProvider simulating network latency
 * and evaluating selected content items.
 */
export class MockContentIntelligenceProvider implements IContentIntelligenceProvider {
  private readonly SIMULATED_DELAY_MS = 1000;

  async analyzeContentItems(items: CollectedContentItem[]): Promise<ContentIntelligenceReport[]> {
    await new Promise((resolve) => setTimeout(resolve, this.SIMULATED_DELAY_MS));
    return inferContentIntelligence(items);
  }
}
