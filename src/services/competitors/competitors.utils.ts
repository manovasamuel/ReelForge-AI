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

  const indText = `${industry} ${sub} ${report.contentStyle || ""}`.toLowerCase();
  if (
    indText.includes("sport") ||
    indText.includes("athletic") ||
    indText.includes("footwear") ||
    indText.includes("apparel") ||
    indText.includes("fashion") ||
    indText.includes("nike")
  ) {
    return [
      createComp(1, "adidas", "adidas", 28000000, 96, 95, "Matches direct global sportswear performance and lifestyle streetwear."),
      createComp(2, "puma", "Puma", 12000000, 93, 93, "Direct overlap targeting athletic performance and urban streetwear."),
      createComp(3, "underarmour", "Under Armour", 8500000, 91, 91, "Identical focus on training, gym performance, and athletic grit."),
      createComp(4, "newbalance", "New Balance", 7200000, 89, 89, "Competes for running innovation and lifestyle sneaker enthusiasts."),
      createComp(5, "lululemon", "lululemon", 4900000, 87, 88, "Shares high-engagement community fitness and athletic apparel demographic."),
      createComp(6, "asics", "ASICS Running", 1800000, 85, 85, "Overlap in technical marathon running and footwear energy return."),
      createComp(7, "reebok", "Reebok", 4100000, 83, 84, "Similar training, functional fitness, and classic footwear heritage."),
      createComp(8, "gymshark", "Gymshark", 6800000, 81, 83, "Competes directly on social-first fitness creator challenges and gymwear."),
      createComp(9, "salomon", "Salomon", 2100000, 79, 81, "Overlap in trail running, outdoor endurance, and technical performance."),
      createComp(10, "hoka", "HOKA", 1500000, 77, 79, "Direct competitor in maximum cushion running shoe innovation."),
    ];
  }

  if (indText.includes("technology") || indText.includes("saas") || indText.includes("software") || indText.includes("tech")) {
    return [
      createComp(1, "vercel", "Vercel", 185000, 96, 94, "Matches frontend deployment workflows and developer experience breakdowns."),
      createComp(2, "supabase", "Supabase", 142000, 93, 91, "Direct audience overlap targeting backend developers and database engineering."),
      createComp(3, "nextjs", "Next.js", 310000, 91, 95, "Identical content style focusing on React framework features and tutorials."),
      createComp(4, "figma", "Figma", 890000, 89, 88, "High visual similarity in collaborative design and UI/UX product engineering."),
      createComp(5, "stripe", "Stripe", 420000, 87, 89, "Similar authoritative developer documentation and financial infrastructure tone."),
      createComp(6, "github", "GitHub", 1200000, 85, 84, "Overlap in software engineering workflows and open source community engagement."),
      createComp(7, "openai", "OpenAI", 3500000, 83, 90, "Competes for AI developer tooling and cutting-edge model integration audience."),
      createComp(8, "notion", "Notion", 1800000, 81, 85, "Shares primary content pillar around workspace productivity and templates."),
      createComp(9, "linear", "Linear", 115000, 79, 82, "Target audience matches product managers and software engineering leaders."),
      createComp(10, "clerk", "Clerk", 89000, 77, 80, "Similar focus on developer authentication and user management workflows."),
    ];
  }

  if (indText.includes("e-commerce") || indText.includes("retail") || indText.includes("beauty") || indText.includes("commerce")) {
    return [
      createComp(1, "zara", "ZARA", 61000000, 95, 94, "Identical D2C fast fashion aesthetic and high-energy product drop reel formats."),
      createComp(2, "hm", "H&M", 38000000, 92, 92, "Direct overlap in global retail demographics and seasonal styling content."),
      createComp(3, "asos", "ASOS", 14000000, 90, 89, "Matches aspirational brand tone and trend-driven apparel showcases."),
      createComp(4, "uniqlo", "UNIQLO", 5200000, 88, 87, "Competes for minimalist essentials and functional casual wear demographics."),
      createComp(5, "levis", "Levi's", 9100000, 86, 91, "Similar classic denim heritage and high-engagement lifestyle campaigns."),
      createComp(6, "nike", "Nike", 305000000, 84, 88, "Shares visual storytelling mastery and global brand community dominance."),
      createComp(7, "gymshark", "Gymshark", 6800000, 82, 83, "Competes directly on creator-driven fitness and lifestyle apparel drops."),
      createComp(8, "glossier", "Glossier", 2900000, 80, 85, "Overlap in community-first D2C branding and authentic behind-the-scenes reels."),
      createComp(9, "sephora", "Sephora", 22000000, 78, 81, "Similar retail curation and product review tutorial pacing."),
      createComp(10, "skims", "SKIMS", 6100000, 75, 79, "Shares primary content pillars around inclusive sizing and viral product launches."),
    ];
  }

  if (indText.includes("health") || indText.includes("fitness") || indText.includes("wellness") || indText.includes("gym")) {
    return [
      createComp(1, "gymshark", "Gymshark", 6800000, 97, 95, "Matches direct fitness motivation and high-energy athlete community reels."),
      createComp(2, "crossfit", "CrossFit", 3100000, 94, 93, "Direct overlap in functional training routines and athlete transformations."),
      createComp(3, "whoop", "WHOOP", 1200000, 91, 92, "Identical scientific recovery breakdowns and fitness performance tracking."),
      createComp(4, "myprotein", "Myprotein", 1900000, 89, 88, "Competes for fitness seekers looking for nutrition supplement routines."),
      createComp(5, "gatorade", "Gatorade", 1800000, 87, 89, "Shares high-energy sports endurance and hydration storytelling."),
      createComp(6, "alo", "Alo Yoga", 3400000, 85, 84, "Overlap in mindful movement, yoga lifestyle, and premium activewear."),
      createComp(7, "equinox", "Equinox", 430000, 83, 87, "Similar luxury fitness club branding and high-performance lifestyle visuals."),
      createComp(8, "hyperice", "Hyperice", 490000, 80, 82, "Target audience matches active athletes focusing on recovery technology."),
      createComp(9, "peloton", "Peloton", 1700000, 78, 83, "Competes directly for interactive home fitness and instructor-led training."),
      createComp(10, "nike", "Nike", 305000000, 76, 80, "Shares global fitness community leadership and athletic motivation pillars."),
    ];
  }

  // Default / Creative Media / Lifestyle / Creators
  return [
    createComp(1, "sonyalpha", "Sony Alpha", 3200000, 96, 95, "Matches cinematic lighting breakdowns, camera gear setups, and visual storytelling."),
    createComp(2, "canonusa", "Canon USA", 1900000, 93, 93, "Direct overlap targeting professional photographers and videographers."),
    createComp(3, "gopro", "GoPro", 20500000, 91, 91, "Identical action storytelling style focusing on immersive short-form POV pacing."),
    createComp(4, "reddigitalcinema", "RED Digital Cinema", 1100000, 88, 89, "Competes for high-end cinema camera setup and production workflows."),
    createComp(5, "dji_official", "DJI", 4500000, 86, 88, "Shares audience of visual creators leveraging drone cinematography and gimbals."),
    createComp(6, "adobecreativecloud", "Adobe Creative Cloud", 1600000, 84, 85, "High visual similarity in transition animations, Premiere Pro, and color grading."),
    createComp(7, "filmmakersworld", "Filmmakers World", 1800000, 82, 84, "Overlap in behind-the-scenes set breakdowns and directorial techniques."),
    createComp(8, "blackmagicnewsofficial", "Blackmagic Design", 640000, 80, 83, "Similar DaVinci Resolve color grading tutorial structure and pacing."),
    createComp(9, "aputure.lighting", "Aputure Lighting", 520000, 78, 81, "Competes on analyzing top lighting setups and studio illumination techniques."),
    createComp(10, "rode", "RØDE Microphones", 980000, 76, 79, "Matches core audience of content creators, podcasters, and audio engineers."),
  ];
}
