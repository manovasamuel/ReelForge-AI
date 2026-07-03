import type { ContentDNAReport } from "@/types/content-dna";
import type { ReelContentPackage } from "@/types/script-generation";

/**
 * Contract for Script Generation provider.
 */
export interface IScriptGenerationProvider {
  generateScript(dnaReport: ContentDNAReport): Promise<ReelContentPackage>;
}
