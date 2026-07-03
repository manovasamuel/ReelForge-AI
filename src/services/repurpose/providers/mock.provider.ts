import type { ReelContentPackage } from "@/types/script-generation";
import type { RepurposeReport } from "@/types/repurpose";
import type { IRepurposeProvider } from "../provider.interface";
import { generateRepurposeReport } from "../repurpose.utils";

/**
 * Concrete mock provider simulating Multi-Platform Repurpose adaptation latency.
 */
export class MockRepurposeProvider implements IRepurposeProvider {
  async generateRepurpose(pkg: ReelContentPackage): Promise<RepurposeReport> {
    // Simulate adaptation computation delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return generateRepurposeReport(pkg);
  }
}
