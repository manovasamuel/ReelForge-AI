import type { InstagramProfile } from "@/types/instagram";
import type { ContentDNAReport } from "@/types/content-dna";
import type { PromptModuleSelection } from "../prompt.builder";
import { PROMPT_LIBRARY } from "../library";

export interface PromptSelectionContext {
  brandName?: string;
  brandBio?: string;
  industry?: string;
  subIndustry?: string;
  brandType?: string;
  targetAudience?: string;
  goal?: string;
  scriptDuration?: number | string;
  platform?: string;
  hookStyle?: string;
  ctaStyle?: string;
  tonePreference?: string;
  frameworkPreference?: string;
  systemType?: "brand_intelligence" | "script_generation" | "general";
}

/**
 * Prompt Selection Engine — ReelForge AI v2.1 Phase 7.3.
 *
 * Automatically determines the optimal combination of prompt modules
 * (Industry, Tone, Framework, Hook, CTA, Constraints, Examples)
 * based on brand analysis, Instagram profile, target audience, business category,
 * goal, script duration, and platform.
 *
 * Operates purely on deterministic rules and semantic heuristic matching
 * without requiring RAG, vector databases, or external AI agents.
 */
export class PromptSelectionEngine {
  /**
   * Selects optimal prompt modules based on the provided context.
   */
  public static select(context: PromptSelectionContext): PromptModuleSelection {
    const system = PromptSelectionEngine.selectSystem(context);
    const industry = PromptSelectionEngine.selectIndustry(context);
    const tone = PromptSelectionEngine.selectTone(context);
    const framework = PromptSelectionEngine.selectFramework(context);
    const hook = PromptSelectionEngine.selectHook(context);
    const cta = PromptSelectionEngine.selectCTA(context);
    const constraints = PromptSelectionEngine.selectConstraints(context);
    const examples = PromptSelectionEngine.selectExamples(context, industry);

    return {
      system,
      industry,
      hook,
      framework,
      tone,
      cta,
      constraints,
      examples,
    };
  }

  /**
   * Helper to build selection context from an InstagramProfile for Brand Intelligence.
   */
  public static selectForBrandIntelligence(profile: InstagramProfile): PromptModuleSelection {
    const context: PromptSelectionContext = {
      brandName: profile.display_name || profile.username,
      brandBio: profile.bio || "",
      systemType: "brand_intelligence",
      goal: "Analyze core brand strategy, content pillars, and market position",
      platform: "Instagram",
    };
    return PromptSelectionEngine.select(context);
  }

  /**
   * Helper to build selection context from a ContentDNAReport for Script Generation.
   */
  public static selectForScriptGeneration(dna: ContentDNAReport): PromptModuleSelection {
    const dominantHook = dna.snapshot?.dominantHook || "";
    const dominantPsychology = dna.snapshot?.dominantPsychology || "";
    
    const context: PromptSelectionContext = {
      brandName: dna.id,
      systemType: "script_generation",
      hookStyle: dominantHook || dominantPsychology,
      goal: "Maximize retention, virality, and keyword comment lead capture",
      platform: "Instagram Reels",
      scriptDuration: 45,
    };
    return PromptSelectionEngine.select(context);
  }

  private static selectSystem(context: PromptSelectionContext): string {
    if (context.systemType === "brand_intelligence") {
      return "brand_intelligence_system";
    }
    if (context.systemType === "script_generation") {
      return "script_generation_system";
    }
    return "general";
  }

  private static selectIndustry(context: PromptSelectionContext): string {
    const text = [
      context.industry,
      context.subIndustry,
      context.brandBio,
      context.brandName,
      context.brandType,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const industryMap: Record<string, string[]> = {
      fashion: ["fashion", "apparel", "clothing", "wear", "style", "outfit", "boutique"],
      jewellery: ["jewel", "watch", "diamond", "gold", "silver", "necklace", "ring", "luxury accessory"],
      beauty: ["beauty", "makeup", "cosmetics", "salon", "lash", "brow", "nails", "glam"],
      skincare: ["skin", "derma", "facial", "glow", "serum", "dermatolog", "spf"],
      restaurant: ["restaurant", "dining", "bistro", "chef", "culinary", "eatery", "foodie"],
      cafe: ["cafe", "coffee", "bakery", "latte", "espresso", "barista", "pastry", "tea"],
      gym: ["gym", "workout", "lifting", "bodybuilding", "crossfit", "powerlifting", "barbell"],
      fitness: ["fitness", "health", "trainer", "exercise", "athletic", "cardio", "pilates", "yoga"],
      coaching: ["coach", "mentor", "consulting", "advising", "mindset", "life coach", "business coach"],
      education: ["education", "course", "learn", "academy", "school", "teach", "student", "tutorial"],
      finance: ["finance", "money", "invest", "crypto", "wealth", "tax", "accounting", "stock", "trading"],
      real_estate: ["real estate", "realtor", "property", "mortgage", "housing", "homebuyer", "broker"],
      travel: ["travel", "vacation", "hotel", "resort", "tourism", "adventure", "wanderlust", "flight"],
      medical: ["medical", "doctor", "physician", "clinic", "hospital", "health care", "surgery", "md"],
      dental: ["dental", "dentist", "smile", "teeth", "orthodont", "whitening", "invisalign"],
      saas: ["saas", "software", "app", "tech", "platform", "ai", "cloud", "developer", "startup"],
      ecommerce: ["ecommerce", "store", "shop", "product", "retail", "brand", "d2c", "amazon"],
      personal_brand: ["personal brand", "creator", "influencer", "vlog", "lifestyle", "entrepreneur"],
      photography: ["photo", "camera", "video", "studio", "shoot", "portrait", "videography", "lens"],
      interior_design: ["interior", "design", "decor", "home decor", "architecture", "renovation", "furniture"],
    };

    for (const [modId, keywords] of Object.entries(industryMap)) {
      if (keywords.some((kw) => text.includes(kw))) {
        if (PROMPT_LIBRARY.industry?.[modId]) {
          return modId;
        }
      }
    }

    return "general";
  }

  private static selectTone(context: PromptSelectionContext): string {
    const text = [
      context.tonePreference,
      context.brandBio,
      context.targetAudience,
      context.brandType,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const toneMap: Record<string, string[]> = {
      authoritative: ["authoritative", "expert", "commanding", "veteran", "leader", "master"],
      empathetic: ["empathetic", "understanding", "supportive", "inspirational", "warm", "caring"],
      high_energy: ["high energy", "high-energy", "bold", "fast", "dynamic", "enthusiastic", "exciting"],
      conversational: ["conversational", "relatable", "friendly", "casual", "natural", "everyday"],
      sophisticated: ["sophisticated", "luxury", "elegant", "prestige", "refined", "premium", "high-end"],
      contrarian: ["contrarian", "provocative", "challenge", "myth", "controversial", "unpopular", "opposite"],
      humorous: ["humorous", "witty", "funny", "lighthearted", "comedy", "entertaining", "playful"],
      urgent: ["urgent", "action", "now", "time-sensitive", "immediate", "hurry", "fast"],
      calm: ["calm", "soothing", "peaceful", "serene", "mindful", "relax", "gentle"],
      data_driven: ["data", "analytical", "statistics", "logical", "scientific", "numbers", "proof"],
      storyteller: ["story", "narrative", "cinematic", "dramatic", "journey", "experience"],
      minimalist: ["minimalist", "direct", "concise", "no fluff", "simple", "straightforward"],
      visionary: ["visionary", "futuristic", "innovation", "future", "disrupt", "horizon"],
      exclusive: ["exclusive", "vip", "insider", "elite", "secret", "private"],
      coach: ["coach", "tough love", "accountability", "discipline", "no bs", "push"],
      corporate: ["corporate", "executive", "boardroom", "b2b", "professional", "enterprise"],
    };

    for (const [modId, keywords] of Object.entries(toneMap)) {
      if (keywords.some((kw) => text.includes(kw))) {
        if (PROMPT_LIBRARY.tone?.[modId]) {
          return modId;
        }
      }
    }

    if (context.systemType === "brand_intelligence") {
      return "authoritative";
    }
    if (context.systemType === "script_generation") {
      return "high_energy";
    }
    return "general";
  }

  private static selectFramework(context: PromptSelectionContext): string {
    const text = [
      context.frameworkPreference,
      context.goal,
      context.hookStyle,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const frameworkMap: Record<string, string[]> = {
      hormozi: ["hormozi", "offer", "value equation", "no-brainer", "grand slam", "guarantee"],
      pas: ["pas", "problem", "agitation", "pain", "struggle", "frustrat"],
      storybrand: ["storybrand", "hero", "guide", "donald miller", "plan", "stak"],
      aida: ["aida", "attention", "interest", "desire", "classic"],
      bab: ["bab", "before", "after", "bridge", "transformation", "result"],
      quest: ["quest", "qualify", "educate", "stimulate"],
      fab: ["fab", "feature", "advantage", "benefit", "product"],
      "4u": ["4u", "urgent", "useful", "unique", "ultra-specific"],
      acca: ["acca", "awareness", "comprehension", "conviction"],
      russell_brunson: ["russell", "brunson", "epiphany", "backstory", "wall", "new opportunity"],
    };

    for (const [modId, keywords] of Object.entries(frameworkMap)) {
      if (keywords.some((kw) => text.includes(kw))) {
        if (PROMPT_LIBRARY.framework?.[modId]) {
          return modId;
        }
      }
    }

    if (context.systemType === "script_generation") {
      return "hormozi";
    }
    return "general";
  }

  private static selectHook(context: PromptSelectionContext): string {
    const text = [
      context.hookStyle,
      context.goal,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const hookCategories: Record<string, string[]> = {
      curiosity: ["curiosity", "secret", "hidden", "nobody", "why", "weird", "missing", "forbidden"],
      authority: ["authority", "proven", "track record", "expert", "case study", "data", "certified", "masterclass"],
      fear: ["fear", "mistake", "costly", "silent killer", "warning", "avoid", "loss", "burnout", "penalty"],
      story: ["story", "humble", "beginning", "epiphany", "journey", "vlog", "breakthrough", "mentor"],
      contrarian: ["contrarian", "myth", "lie", "unpopular", "stop", "opposite", "overhyped", "lazy"],
      numbers: ["number", "list", "steps", "3 things", "5 tools", "formula", "80/20", "roadmap"],
      identity: ["identity", "callout", "if you are", "calling all", "creator", "founder", "high performer"],
      pain: ["pain", "tired", "frustrat", "exhaust", "overwhelm", "stuck", "plateau", "headache"],
      aspiration: ["aspiration", "dream", "imagine", "freedom", "lifestyle", "goal", "legacy", "vip"],
      mistake: ["mistake", "rookie", "flaw", "trap", "blunder", "error", "wrong", "copycat"],
    };

    for (const [prefix, keywords] of Object.entries(hookCategories)) {
      if (keywords.some((kw) => text.includes(kw))) {
        // Select the first hook of this category (e.g. curiosity_1, authority_1)
        const modId = `${prefix}_1`;
        if (PROMPT_LIBRARY.hook?.[modId]) {
          return modId;
        }
      }
    }

    if (context.systemType === "script_generation") {
      return "curiosity_1";
    }
    return "general";
  }

  private static selectCTA(context: PromptSelectionContext): string {
    const text = [
      context.ctaStyle,
      context.goal,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const ctaCategories: Record<string, string[]> = {
      lead: ["lead", "dm", "keyword", "comment guide", "freebie", "audit", "newsletter", "template", "quiz", "case study"],
      sale: ["sale", "discount", "buy", "shop", "book", "discovery call", "offer", "bundle", "consultation", "vip waitlist"],
      eng: ["engage", "comment", "opinion", "question", "vote", "tag", "emoji", "agree"],
      comm: ["community", "discord", "telegram", "join", "milestone", "q&a", "accountability", "spotlight"],
      fol: ["follow", "part 2", "reminder", "daily value", "behind the scenes", "notifications"],
      sav: ["save", "bookmark", "cheat sheet", "recipe", "routine", "tool stack", "troubleshooting"],
      shr: ["share", "send", "partner", "friend", "story", "viral", "challenge", "spread"],
    };

    for (const [prefix, keywords] of Object.entries(ctaCategories)) {
      if (keywords.some((kw) => text.includes(kw))) {
        const modId = `${prefix}_1`;
        if (PROMPT_LIBRARY.cta?.[modId]) {
          return modId;
        }
      }
    }

    if (context.systemType === "script_generation") {
      return "lead_1";
    }
    return "general";
  }

  private static selectConstraints(context: PromptSelectionContext): string {
    if (context.systemType === "brand_intelligence") {
      return "brand_intelligence_constraints";
    }
    if (context.systemType === "script_generation") {
      return "script_generation_constraints";
    }
    return "general";
  }

  private static selectExamples(context: PromptSelectionContext, industry: string): string {
    if (context.systemType === "brand_intelligence") {
      return "brand_intelligence_examples";
    }
    
    // Map industry to specific example if available
    const industryExampleMap: Record<string, string> = {
      jewellery: "luxury_example",
      fashion: "luxury_example",
      education: "education_example",
      coaching: "education_example",
      fitness: "fitness_example",
      gym: "fitness_example",
      ecommerce: "ecommerce_example",
      personal_brand: "personal_branding_example",
    };

    if (industryExampleMap[industry] && PROMPT_LIBRARY.examples?.[industryExampleMap[industry]]) {
      return industryExampleMap[industry];
    }

    if (context.systemType === "script_generation") {
      return "script_generation_examples";
    }
    return "general";
  }
}
