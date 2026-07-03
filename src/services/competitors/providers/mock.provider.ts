import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { Competitor } from "@/types/competitor";
import type { ICompetitorProvider } from "../provider.interface";
import { inferCompetitors } from "../competitors.utils";

/**
 * Deterministic MockCompetitorProvider for Phase 3.
 * Evaluates Brand Intelligence output and simulates realistic network delay.
 */
export class MockCompetitorProvider implements ICompetitorProvider {
  private readonly SIMULATED_DELAY_MS = 1000;

  async discoverCompetitors(report: BrandIntelligenceReport): Promise<Competitor[]> {
    await new Promise((resolve) => setTimeout(resolve, this.SIMULATED_DELAY_MS));
    return inferCompetitors(report);
  }
}
