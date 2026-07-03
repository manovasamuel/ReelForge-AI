import type { InstagramProfile } from "@/types/instagram";
import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { Competitor } from "@/types/competitor";
import type { CompetitorProfileAnalysis } from "@/types/competitor-analysis";
import type { CollectedContentItem } from "@/types/content-collection";
import type { ContentIntelligenceReport } from "@/types/content-intelligence";
import type { ContentDNAReport } from "@/types/content-dna";
import type { ReelContentPackage } from "@/types/script-generation";
import type { RepurposeReport } from "@/types/repurpose";

export type ProjectSortOption =
  | "newest"
  | "oldest"
  | "updated"
  | "alphabetical";

export interface StorageStats {
  totalProjects: number;
  totalStorageUsedBytes: number;
  totalStorageUsedFormatted: string;
  largestProjectName: string;
  largestProjectSizeBytes: number;
  largestProjectSizeFormatted: string;
  averageProjectSizeBytes: number;
  averageProjectSizeFormatted: string;
  lastSaved: string | null;
}

export interface SavedProject {
  id: string;
  version: "1.1.0" | "1.2.0";
  name: string;
  instagramUrl: string;
  createdAt: string;
  updatedAt: string;
  // Complete application state snapshot
  state: {
    profile: InstagramProfile | null;
    brandReport: BrandIntelligenceReport | null;
    competitors: Competitor[] | null;
    competitorAnalysis: {
      competitor: Competitor;
      analysis: CompetitorProfileAnalysis;
    } | null;
    contentCollection: {
      username: string;
      items: CollectedContentItem[];
    } | null;
    contentIntelligence: ContentIntelligenceReport[] | null;
    contentDNA: ContentDNAReport | null;
    scriptPackage: ReelContentPackage | null;
    repurposePackage: RepurposeReport | null;
    selectedCompetitor: string | null;
  };
}
