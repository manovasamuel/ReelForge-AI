import type { ContentDNAReport } from "@/types/content-dna";
import type { ReelContentPackage } from "@/types/script-generation";
import type { IScriptGenerationProvider } from "../provider.interface";
import { generateReelPackage } from "../script-generation.utils";

/**
 * Concrete mock provider simulating Strategy & Script compilation latency.
 */
export class MockScriptGenerationProvider implements IScriptGenerationProvider {
  async generateScript(dnaReport: ContentDNAReport): Promise<ReelContentPackage> {
    // Simulate compilation processing delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return generateReelPackage(dnaReport);
  }
}
