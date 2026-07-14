import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { Competitor } from "@/types/competitor";

/**
 * Deterministically generates top 10 competitors based on the Brand Intelligence report.
 * Tailors similarity scores, follower counts, and reason matches to the brand's industry and style.
 */
export function inferCompetitors(report: BrandIntelligenceReport): Competitor[] {
  const industry = report.industry;
  const sub = report.subIndustry;

  const createComp = (
    idx: number,
    username: string,
    displayName: string,
    followers: number,
    simScore: number,
    confScore: number,
    reason: string
  ): Competitor => ({
    id: `comp-${idx}`,
    username,
    displayName,
    profilePictureUrl: `https://images.unsplash.com/photo-${1500000000000 + idx * 86400000}?auto=format&fit=crop&w=150&q=80`,
    followers,
    industry: `${industry} (${sub})`,
    similarityScore: simScore,
    reasonMatch: reason,
    confidenceScore: confScore,
    discoveryState: "UNVERIFIED",
    isVerifiedAccount: false,
  });

  if (industry.includes("Technology") || industry.includes("SaaS")) {
    return [
      createComp(1, "saas_architects", "SaaS Growth Lab", 245000, 96, 94, "Matches B2B SaaS founder breakdowns and high-converting product demo hooks."),
      createComp(2, "buildinpublic_daily", "Build In Public Hub", 182000, 93, 91, "Direct audience overlap targeting startup founders and developers."),
      createComp(3, "ai_dev_workflows", "AI Dev Strategies", 410000, 91, 95, "Identical content style focusing on AI workflow optimization tutorials."),
      createComp(4, "product_ui_gems", "UI/UX Product Gems", 158000, 89, 88, "High visual similarity in SaaS UI breakdowns and design engineering."),
      createComp(5, "scale_founders", "Scale Founders", 320000, 87, 89, "Similar authoritative tone and posting frequency targeting tech executives."),
      createComp(6, "code_to_revenue", "Code To Revenue", 98000, 85, 84, "Overlap in developer monetization and micro-SaaS case studies."),
      createComp(7, "tech_trend_insights", "Tech Trend Radar", 512000, 83, 90, "Competes for the same tech industry benchmarks and news audience."),
      createComp(8, "dev_tool_mastery", "DevTool Mastery", 134000, 81, 85, "Shares primary content pillar around software tool comparisons."),
      createComp(9, "nextjs_innovators", "FullStack Innovators", 215000, 79, 82, "Target audience matches web developers and engineering managers."),
      createComp(10, "startup_metrics_iq", "Startup Metrics IQ", 89000, 77, 80, "Similar focus on SaaS retention benchmarks and growth metrics."),
    ];
  }

  if (industry.includes("E-Commerce") || industry.includes("Retail")) {
    return [
      createComp(1, "modern_apparel_co", "Modern Apparel Co.", 540000, 95, 94, "Identical D2C aesthetic and high-energy product drop reel formats."),
      createComp(2, "streetwear_daily", "Urban Threads Studio", 380000, 92, 92, "Direct overlap in 18-34 demographic and styling try-on content."),
      createComp(3, "minimal_goods_hub", "Minimalist Goods", 290000, 90, 89, "Matches aspirational brand tone and carousel product showcases."),
      createComp(4, "eco_style_collective", "EcoStyle Collective", 175000, 88, 87, "Competes for style-conscious modern consumer demographics."),
      createComp(5, "trend_fits_studio", "TrendFits Studio", 420000, 86, 91, "Similar flash sale promotion patterns and UGC styling reels."),
      createComp(6, "luxe_basics_wear", "Luxe Basics Wear", 610000, 84, 88, "Shares visual storytelling aesthetic and high posting frequency."),
      createComp(7, "daily_drop_exclusive", "Daily Drop Exclusives", 145000, 82, 83, "Competes directly on limited release hype sequences."),
      createComp(8, "curated_closet_co", "Curated Closet", 230000, 80, 85, "Overlap in day-in-the-life behind-the-scenes brand reels."),
      createComp(9, "essentials_outfitted", "Essentials Outfitted", 310000, 78, 81, "Similar pricing tier and target customer profile."),
      createComp(10, "vibe_apparel_group", "Vibe Apparel Group", 189000, 75, 79, "Shares primary content pillars around customer testimonials."),
    ];
  }

  if (industry.includes("Health") || industry.includes("Fitness")) {
    return [
      createComp(1, "elite_form_coaching", "Elite Form Coaching", 480000, 97, 95, "Matches direct step-by-step exercise tutorial reels and form tips."),
      createComp(2, "daily_strength_lab", "Daily Strength Lab", 310000, 94, 93, "Direct overlap in workout routines and athlete transformations."),
      createComp(3, "hypertrophy_hacks", "Hypertrophy Hacks", 590000, 91, 92, "Identical motivating tone and science-backed training breakdowns."),
      createComp(4, "fuel_and_flex", "Fuel & Flex Nutrition", 220000, 89, 88, "Competes for fitness seekers looking for meal prep and discipline tips."),
      createComp(5, "functional_athlete", "Functional Athlete", 350000, 87, 89, "Shares workout pacing and high-energy video hooks."),
      createComp(6, "mindset_muscle_co", "Mindset & Muscle", 165000, 85, 84, "Overlap in daily discipline routines and fitness mindset content."),
      createComp(7, "shred_science_daily", "Shred Science", 430000, 83, 87, "Similar posting frequency and engagement rate performance."),
      createComp(8, "mobility_masterclass", "Mobility Masterclass", 195000, 80, 82, "Target audience matches active individuals and fitness enthusiasts."),
      createComp(9, "prime_physique_club", "Prime Physique Club", 275000, 78, 83, "Competes directly for 20-40 year fitness coaching demographics."),
      createComp(10, "core_conditioning_hub", "Core Conditioning", 140000, 76, 80, "Shares workout equipment and home gym breakdown pillars."),
    ];
  }

  // Default / Lifestyle & Creators / Marketing & Media
  return [
    createComp(1, "cinematic_creator_lab", "Cinematic Creator Lab", 620000, 96, 95, "Matches cinematic lighting breakdowns and B-roll storytelling hooks."),
    createComp(2, "visual_story_masters", "Visual Story Masters", 410000, 93, 93, "Direct overlap targeting creative directors and visual creators."),
    createComp(3, "reel_hooks_strategy", "Reel Hooks Strategy", 350000, 91, 91, "Identical content style focusing on viral short-form pacing."),
    createComp(4, "creative_gear_junkie", "Creative Gear Setup", 280000, 88, 89, "Competes for camera setup, lighting gear, and editing tutorials."),
    createComp(5, "creator_monetization", "Creator Economy Hub", 510000, 86, 88, "Shares audience of creative professionals building online businesses."),
    createComp(6, "aesthetic_reels_co", "Aesthetic Reels Co.", 195000, 84, 85, "High visual similarity in transition animations and color grading."),
    createComp(7, "digital_nomad_lens", "Digital Nomad Lens", 330000, 82, 84, "Overlap in personal travel explorations and behind-the-scenes vlogs."),
    createComp(8, "edit_flow_mastery", "Edit Flow Mastery", 240000, 80, 83, "Similar video editing tutorial structure and pacing."),
    createComp(9, "viral_format_insider", "Viral Format Insider", 175000, 78, 81, "Competes on analyzing top trending reel formats and audio selections."),
    createComp(10, "lens_and_light_hub", "Lens & Light Studio", 150000, 76, 79, "Matches core audience of aspiring videographers and photographers."),
  ];
}
