import type { Competitor } from "@/types/competitor";
import type { CompetitorProfileAnalysis } from "@/types/competitor-analysis";

/**
 * Deterministically generates a comprehensive 11-section Competitor Profile Analysis
 * tailored to the competitor account.
 */
export function inferCompetitorAnalysis(competitor: Competitor): CompetitorProfileAnalysis {
  const isSaaS = competitor.industry.toLowerCase().includes("tech") || competitor.industry.toLowerCase().includes("saas");
  const isFitness = competitor.industry.toLowerCase().includes("health") || competitor.industry.toLowerCase().includes("fitness");
  const isRetail = competitor.industry.toLowerCase().includes("retail") || competitor.industry.toLowerCase().includes("commerce");

  const followers = competitor.followers || 150000;
  const engRate = isSaaS ? 3.8 : isFitness ? 4.9 : 4.2;
  const avgLikes = Math.round(followers * (engRate / 100) * 0.85);
  const avgComments = Math.round(followers * (engRate / 100) * 0.15);

  return {
    id: `cpa-${competitor.id}-${Date.now()}`,
    competitorId: competitor.id,
    username: competitor.username,
    analyzedAt: new Date().toISOString(),
    businessSummary: {
      industry: competitor.industry,
      marketPosition: isSaaS ? "B2B Thought Leader & Tool Authority" : isRetail ? "D2C Trendsetter & Lifestyle Brand" : "Category Authority & Digital Creator",
      primaryAudience: isSaaS ? "Founders, Product Engineers & Growth Marketers" : isFitness ? "Health Enthusiasts & Everyday Athletes" : "Modern Digital Consumers (22-40 yrs)",
      coreDifferentiator: isSaaS ? "Deep technical teardowns with actionable visual hooks" : "High-production aesthetic storytelling paired with community proof",
      contentMaturity: competitor.similarityScore >= 90 ? "Established Leader (Tier 1 Production)" : "High-Growth Challenger (Optimized Agile Loop)",
    },
    accountOverview: {
      username: competitor.username,
      displayName: competitor.displayName,
      profilePictureUrl: competitor.profilePictureUrl,
      followers: competitor.followers,
      following: Math.round(Math.min(competitor.followers * 0.05, 1200)),
      totalPosts: Math.round((competitor.followers / 1000) * 4 + 180),
      verifiedStatus: competitor.followers > 100000,
      estimatedAccountAge: competitor.followers > 300000 ? "4+ Years" : "2.5 Years",
    },
    performanceMetrics: {
      estimatedEngagementRate: engRate,
      avgLikes,
      avgComments,
      estimatedMonthlyGrowth: "+4.2% MoM",
      postingFrequency: "5x / week",
      reelPercentage: 65,
      carouselPercentage: 25,
      imagePercentage: 10,
    },
    brandPosition: {
      industry: competitor.industry,
      brandType: isSaaS ? "B2B Software & Education" : "Modern Lifestyle Brand",
      pricePosition: isSaaS ? "Mid-to-High Tier SaaS Subscription" : "Premium Accessible ($50-$150)",
      targetAudience: isSaaS ? "Tech Professionals & Executives" : "Active Trend-Conscious Adults",
      audienceAge: "24-38 Years Old",
      brandTone: isSaaS ? "Authoritative, Direct & Data-Driven" : "Motivating, Aspirational & Clean",
      contentStyle: "Fast-Paced Hook-Oriented Reels & Value Carousels",
      marketPosition: competitor.similarityScore >= 90 ? "Top 5% Niche Dominator" : "Rising Category Contender",
    },
    contentPillars: [
      { name: "Educational", estimatedPercentage: 35, confidenceScore: 94 },
      { name: "Lifestyle & Behind the Scenes", estimatedPercentage: 20, confidenceScore: 89 },
      { name: "Product Showcase & Teardowns", estimatedPercentage: 25, confidenceScore: 92 },
      { name: "Offers & Promotions", estimatedPercentage: 10, confidenceScore: 86 },
      { name: "Community & UGC Testimonials", estimatedPercentage: 10, confidenceScore: 88 },
    ],
    captionAnalysis: {
      averageCaptionLength: "Medium (120-180 words)",
      emojiUsage: "Moderate (3-4 structure markers per post)",
      ctaFrequency: "High (82% of recent Reels contain verbal + caption CTA)",
      hashtagUsage: "Strategic (3-5 high-relevance niche hashtags)",
      writingStyle: "Scannable single-sentence paragraphs with punchy hook headers",
      storytellingLevel: "Advanced problem-agitation-solution structure",
    },
    audiencePsychology: {
      primaryMotivation: isSaaS ? "Efficiency, ROI & Competitive Edge" : "Self-Improvement & Status Alignment",
      buyingIntent: "High intent driven by actionable problem-solving demonstrations",
      emotionalTriggers: ["Fear of falling behind in tech/trends", "Desire for streamlined workflow mastery", "Pride in premium craftsmanship"],
      decisionDrivers: ["Verified peer case studies", "Step-by-step visual workflow proof", "Clear immediate time/cost savings"],
      painPoints: ["Information overload & complicated tooling", "Inconsistent results with legacy approaches", "Lack of clear step-by-step guidance"],
      trustSignals: ["High engagement ratio in comment threads", "Consistently high audio & visual production quality", "Regular founder/expert on-camera presence"],
      preferredContent: "60-second deep-dive Reels paired with swipeable step-by-step PDF/Carousel cheat sheets",
    },
    strengths: [
      "Strong first-3-second visual and verbal hooks driving high retention",
      "Consistent visual identity and color grading across all media formats",
      "High audience interaction density in comment sections (active community curation)",
      "Premium positioning that allows high-margin offer conversions",
    ],
    weaknesses: [
      "Occasional overly technical captions that reduce casual shareability",
      "Lower posting consistency on weekends leading to reach dips",
      "Over-reliance on talking-head B-roll without dynamic visual pattern interrupts in mid-sections",
      "Underutilized story highlight funnels for immediate new follower conversion",
    ],
    recommendations: [
      "Increase Reel frequency from 5x/week to daily to capture algorithmic momentum",
      "Improve mid-script retention by inserting visual pattern interrupts every 4–6 seconds",
      "Shorten educational captions into scannable bullet points with explicit lead magnet CTAs",
      "Increase educational carousel volume to drive higher save and share metrics",
      "Strengthen end-of-reel CTA usage with animated visual arrows and text overlays",
    ],
    overallIntelligenceScore: {
      overallScore: Math.min(Math.round(competitor.similarityScore * 0.98 + 3), 98),
      brandMaturity: 92,
      growthPotential: 89,
      contentQuality: 94,
      consistency: 88,
      confidence: 95,
    },
  };
}
