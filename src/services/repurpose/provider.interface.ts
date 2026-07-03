import type { ReelContentPackage } from "@/types/script-generation";
import type { RepurposeReport } from "@/types/repurpose";

/**
 * Contract for Multi-Platform Repurpose provider.
 */
export interface IRepurposeProvider {
  generateRepurpose(pkg: ReelContentPackage): Promise<RepurposeReport>;
}
