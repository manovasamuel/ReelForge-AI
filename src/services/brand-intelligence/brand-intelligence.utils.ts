import type { InstagramProfile } from "@/types/instagram";
import type { BrandIntelligenceReport } from "@/types/brand-intelligence";

/**
 * Deterministically infers a structured Brand Intelligence Report from an Instagram profile snapshot.
 * Uses heuristic keyword matching and engagement/follower ratios without AI or external API calls.
 */
export function inferBrandIntelligence(profile: InstagramProfile): BrandIntelligenceReport {
  const bio = (profile.bio ?? "").toLowerCase();
  const category = (profile.category ?? "").toLowerCase();
  const username = profile.username.toLowerCase();
  const combinedText = `${username} ${category} ${bio}`;

  // 1. Industry & Sub-Industry mapping
  let industry = "Lifestyle & Creators";
  let subIndustry = "Visual Storytelling";
  let brandType: BrandIntelligenceReport["brandType"] = "Personal Brand";
  let targetAudience = "Creative professionals & photography enthusiasts";
  let estimatedAudienceAge = "22 - 38 years";
  let brandTone = "Inspirational & Authentic";
  let contentStyle = "Cinematic Visuals & Storytelling";
  let primaryContentPillars = [
    "Behind-the-Scenes & Tutorials",
    "High-Aesthetic Portfolio Showcase",
    "Gear & Process Breakdown",
    "Personal Travel & Explorations",
  ];

  if (combinedText.includes("tech") || combinedText.includes("saas") || combinedText.includes("software") || combinedText.includes("ai")) {
    industry = "Technology & Software";
    subIndustry = "Artificial Intelligence & SaaS";
    brandType = "B2B SaaS";
    targetAudience = "Founders, developers, and product designers";
    estimatedAudienceAge = "24 - 45 years";
    brandTone = "Authoritative, Innovative & Concise";
    contentStyle = "Educational Breakdowns & Feature Demos";
    primaryContentPillars = [
      "AI Workflow Optimizations",
      "Product Feature Showcases",
      "Industry Insights & Benchmarks",
      "Founder Journey & Build in Public",
    ];
  } else if (combinedText.includes("shop") || combinedText.includes("store") || combinedText.includes("fashion") || combinedText.includes("wear")) {
    industry = "E-Commerce & Retail";
    subIndustry = "Direct-to-Consumer Apparel & Goods";
    brandType = "E-Commerce";
    targetAudience = "Style-conscious shoppers & modern consumers";
    estimatedAudienceAge = "18 - 34 years";
    brandTone = "Aspirational, Trendy & Vibrant";
    contentStyle = "High-Energy Reels & Product Try-Ons";
    primaryContentPillars = [
      "New Drop Announcements & Teasers",
      "User-Generated Content & Styling Ideas",
      "Day in the Life / Brand Aesthetic",
      "Exclusive Promotions & Flash Sales",
    ];
  } else if (combinedText.includes("fitness") || combinedText.includes("gym") || combinedText.includes("health") || combinedText.includes("coach")) {
    industry = "Health & Wellness";
    subIndustry = "Fitness Training & Coaching";
    brandType = "Personal Brand";
    targetAudience = "Fitness seekers, athletes & wellness enthusiasts";
    estimatedAudienceAge = "20 - 40 years";
    brandTone = "Motivating, Energetic & Direct";
    contentStyle = "Quick Workout Reels & Form Tips";
    primaryContentPillars = [
      "Step-by-Step Exercise Tutorials",
      "Client Transformations & Case Studies",
      "Nutrition Hacks & Meal Prep",
      "Mindset & Daily Discipline Routines",
    ];
  } else if (combinedText.includes("agency") || combinedText.includes("marketing") || combinedText.includes("media") || combinedText.includes("consult")) {
    industry = "Marketing & Media";
    subIndustry = "Digital Growth & Content Strategy";
    brandType = "Agency / Service";
    targetAudience = "Brand owners, marketing directors & creators";
    estimatedAudienceAge = "25 - 48 years";
    brandTone = "Strategic, Results-Driven & Professional";
    contentStyle = "Talking Head Insights & Carousel Frameworks";
    primaryContentPillars = [
      "Algorithm Updates & Strategy Breakdowns",
      "Client Case Studies & ROI Proof",
      "Content Creation Frameworks",
      "Agency BTS & Culture",
    ];
  }

  // 2. Posting Frequency heuristic
  let postingFrequency = "3-4 times per week";
  if (profile.post_count > 1000) {
    postingFrequency = "Daily (7+ posts per week)";
  } else if (profile.post_count < 150) {
    postingFrequency = "1-2 times per week";
  }

  // 3. Estimated Market Position
  let estimatedMarketPosition: BrandIntelligenceReport["estimatedMarketPosition"] = "Growth Challenger";
  if (profile.follower_count >= 500_000) {
    estimatedMarketPosition = "Market Leader";
  } else if (profile.follower_count >= 100_000) {
    estimatedMarketPosition = "Niche Authority";
  } else if (profile.follower_count < 15_000) {
    estimatedMarketPosition = "Emerging Creator";
  }

  // 4. Deterministic Confidence Score (higher for detailed bios, verified status, higher post counts)
  let baseScore = 78;
  if (profile.bio && profile.bio.length > 50) baseScore += 8;
  if (profile.is_verified) baseScore += 6;
  if (profile.category) baseScore += 4;
  const confidenceScore = Math.min(Math.max(baseScore, 65), 96);

  return {
    industry,
    subIndustry,
    brandType,
    targetAudience,
    estimatedAudienceAge,
    brandTone,
    contentStyle,
    primaryContentPillars,
    postingFrequency,
    estimatedMarketPosition,
    confidenceScore,
  };
}
