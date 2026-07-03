// Domain types for Competitor Discovery Engine (Phase 3)

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
}
