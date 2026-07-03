// Domain types for Brand Intelligence Engine (Phase 2)
// Completely decoupled from profile ingestion and database entity schemas.

export interface BrandIntelligenceReport {
  industry: string;
  subIndustry: string;
  brandType: "Personal Brand" | "B2C Brand" | "B2B SaaS" | "E-Commerce" | "Media / Publication" | "Agency / Service";
  targetAudience: string;
  estimatedAudienceAge: string;
  brandTone: string;
  contentStyle: string;
  primaryContentPillars: string[];
  postingFrequency: string;
  estimatedMarketPosition: "Niche Authority" | "Emerging Creator" | "Market Leader" | "Growth Challenger";
  confidenceScore: number; // 0 to 100
}
