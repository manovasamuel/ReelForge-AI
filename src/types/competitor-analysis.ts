// Domain types for Phase 4 — Competitor Profile Analysis Engine

export interface BusinessSummary {
  industry: string;
  marketPosition: string;
  primaryAudience: string;
  coreDifferentiator: string;
  contentMaturity: string;
}

export interface AccountOverview {
  username: string;
  displayName: string;
  profilePictureUrl: string;
  followers: number;
  following: number;
  totalPosts: number;
  verifiedStatus: boolean;
  estimatedAccountAge: string;
}

export interface PerformanceMetrics {
  estimatedEngagementRate: number; // percentage e.g. 4.2
  avgLikes: number;
  avgComments: number;
  estimatedMonthlyGrowth: string; // e.g. "+3.4%"
  postingFrequency: string; // e.g. "5x / week"
  reelPercentage: number;
  carouselPercentage: number;
  imagePercentage: number;
}

export interface BrandPosition {
  industry: string;
  brandType: string;
  pricePosition: string;
  targetAudience: string;
  audienceAge: string;
  brandTone: string;
  contentStyle: string;
  marketPosition: string;
}

export interface ContentPillarItem {
  name: string; // Educational, Lifestyle, Behind the Scenes, Product Showcase, Offers, Community
  estimatedPercentage: number;
  confidenceScore: number;
}

export interface CaptionAnalysis {
  averageCaptionLength: string; // e.g. "Medium (140-220 words)"
  emojiUsage: string; // e.g. "Moderate (2-3 per post)"
  ctaFrequency: string; // e.g. "High (85% of posts)"
  hashtagUsage: string; // e.g. "Strategic (3-5 niche tags)"
  writingStyle: string; // e.g. "Conversational & Punchy"
  storytellingLevel: string; // e.g. "Advanced narrative hook-to-payoff"
}

export interface AudiencePsychology {
  primaryMotivation: string;
  buyingIntent: string;
  emotionalTriggers: string[];
  decisionDrivers: string[];
  painPoints: string[];
  trustSignals: string[];
  preferredContent: string;
}

export interface IntelligenceScoreBreakdown {
  overallScore: number; // 0 to 100
  brandMaturity: number;
  growthPotential: number;
  contentQuality: number;
  consistency: number;
  confidence: number;
}

export interface CompetitorProfileAnalysis {
  id: string;
  competitorId: string;
  username: string;
  analyzedAt: string;
  businessSummary: BusinessSummary;
  accountOverview: AccountOverview;
  performanceMetrics: PerformanceMetrics;
  brandPosition: BrandPosition;
  contentPillars: ContentPillarItem[];
  captionAnalysis: CaptionAnalysis;
  audiencePsychology: AudiencePsychology;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  overallIntelligenceScore: IntelligenceScoreBreakdown;
}
