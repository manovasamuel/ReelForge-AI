// Domain types for Competitor Discovery Engine (Phase 3 & Phase 4C)

export type CompetitorDiscoveryState =
  | "AI_SUGGESTED"
  | "CACHE_VERIFIED"
  | "UNVERIFIED"
  | "LIVE_VERIFIED"
  | "CONTENT_COLLECTED";

export interface Competitor {
  id: string;
  username: string;
  displayName: string;
  profilePictureUrl: string;
  followers: number;
  industry: string;
  similarityScore: number; // 0 to 100
  reasonMatch: string;
  confidenceScore: number; // 0 to 100
  /** Candidate truthfulness and provenance state per Stage 3B Phase 4C rules. */
  discoveryState?: CompetitorDiscoveryState;
  /** True only when verified via ProfileRepository or live scraper. False when AI suggested or unverified. */
  isVerifiedAccount?: boolean;
}
