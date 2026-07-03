import type { ContentDNAReport } from "@/types/content-dna";
import type { ReelContentPackage } from "@/types/script-generation";
import type { IScriptGenerationProvider } from "./provider.interface";
import { getScriptGenerationProvider } from "./providers";

export class ScriptGenerationError extends Error {
  constructor(message: string, public readonly code: string = "SCRIPT_GENERATION_ERROR") {
    super(message);
    this.name = "ScriptGenerationError";
  }
}

export class ScriptGenerationService {
  private readonly provider: IScriptGenerationProvider;

  constructor(provider?: IScriptGenerationProvider) {
    this.provider = provider ?? getScriptGenerationProvider();
  }

  async generateScript(dnaReport: ContentDNAReport): Promise<ReelContentPackage> {
    if (!dnaReport || !dnaReport.id) {
      throw new ScriptGenerationError("Must provide a valid Content DNA report to generate a script package.", "INVALID_INPUT");
    }

    try {
      return await this.provider.generateScript(dnaReport);
    } catch (err) {
      if (err instanceof ScriptGenerationError) throw err;
      throw new ScriptGenerationError(
        err instanceof Error ? err.message : "Failed to generate Strategy & Script package.",
        "GENERATION_FAILED"
      );
    }
  }
}
