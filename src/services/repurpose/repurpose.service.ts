import type { ReelContentPackage } from "@/types/script-generation";
import type { RepurposeReport } from "@/types/repurpose";
import type { IRepurposeProvider } from "./provider.interface";
import { getRepurposeProvider } from "./providers";

export class RepurposeError extends Error {
  constructor(message: string, public readonly code: string = "REPURPOSE_ERROR") {
    super(message);
    this.name = "RepurposeError";
  }
}

export class RepurposeService {
  private readonly provider: IRepurposeProvider;

  constructor(provider?: IRepurposeProvider) {
    this.provider = provider ?? getRepurposeProvider();
  }

  async generateRepurpose(pkg: ReelContentPackage): Promise<RepurposeReport> {
    if (!pkg || !pkg.id) {
      throw new RepurposeError("Must provide a valid Reel Content Package to repurpose.", "INVALID_INPUT");
    }

    try {
      return await this.provider.generateRepurpose(pkg);
    } catch (err) {
      if (err instanceof RepurposeError) throw err;
      throw new RepurposeError(
        err instanceof Error ? err.message : "Failed to adapt omnichannel repurpose package.",
        "ADAPTATION_FAILED"
      );
    }
  }
}
