import type { InstagramProfile } from "@/types/instagram";
import type { BrandIntelligenceReport } from "@/types/brand-intelligence";

/**
 * Contract for any Brand Intelligence analysis provider.
 * Follows the swappable provider architecture established in Phase 1.
 */
export interface IBrandIntelligenceProvider {
  analyzeBrand(profile: InstagramProfile): Promise<BrandIntelligenceReport>;
}
