import type { InstagramProfile } from "@/types/instagram";
import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { IBrandIntelligenceProvider } from "../provider.interface";
import { inferBrandIntelligence } from "../brand-intelligence.utils";

/**
 * Deterministic MockBrandIntelligenceProvider for Phase 2.
 * Evaluates profile attributes using heuristics and simulates realistic latency.
 */
export class MockBrandIntelligenceProvider implements IBrandIntelligenceProvider {
  private readonly SIMULATED_DELAY_MS = 800;

  async analyzeBrand(profile: InstagramProfile): Promise<BrandIntelligenceReport> {
    await new Promise((resolve) => setTimeout(resolve, this.SIMULATED_DELAY_MS));
    return inferBrandIntelligence(profile);
  }
}
