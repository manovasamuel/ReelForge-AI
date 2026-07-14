import type { InstagramProfile } from "@/types/instagram";
import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { ContentDNAReport } from "@/types/content-dna";
import type { ReelContentPackage } from "@/types/script-generation";
import type { Competitor } from "@/types/competitor";
import type { CompetitorProfileAnalysis } from "@/types/competitor-analysis";
import type { CollectedContentItem } from "@/types/content-collection";
import type { ContentIntelligenceReport } from "@/types/content-intelligence";
import type { RepurposeReport } from "@/types/repurpose";
import type { AIPromptPayload } from "./provider.interface";
import {
  PromptCompiler,
  PromptSelectionEngine,
  type PromptSelectionContext,
  type PromptPreviewPayload,
} from "./prompt";

export interface PromptModuleSelection {
  system?: string;
  industry?: string;
  hook?: string;
  framework?: string;
  tone?: string;
  cta?: string;
  constraints?: string;
  examples?: string;
  [key: string]: string | undefined;
}

/**
 * Prompt Builder Layer — ReelForge AI v2.1 Phase 7.3.
 *
 * Responsible for compiling modular prompt payloads from the Prompt Library
 * using the upgraded Prompt Intelligence Compiler & Selection Engine.
 *
 * By centralizing prompt construction here, individual AI providers (Gemini, OpenAI, Claude)
 * never build or format prompts themselves. They simply transmit the payload and receive text.
 *
 * Features (Phase 7.3):
 *   - Automatic Prompt Selection Engine based on profile/brand analysis
 *   - Advanced Variable Resolver (optional, defaults, nested, arrays, conditionals)
 *   - Prompt Validation Engine returning structured validation results
 *   - Prompt Preview Utility for development inspection (disabled in prod)
 *   - Integrated ONLY into Brand Intelligence and Script Generation
 */
export class PromptBuilder {
  /**
   * Compiles modular prompt modules into one unified prompt string using PromptCompiler.
   * Validates required variables, resolves complex variable syntax, and enforces integrity.
   */
  public static compilePrompt(
    selection: PromptModuleSelection,
    variables: Record<string, any>
  ): string {
    const result = PromptCompiler.compileFromSelection(selection, variables);
    return result.compiledText;
  }

  /**
   * Generates a provider-independent prompt payload for Brand Intelligence analysis
   * using automatic module selection from PromptSelectionEngine.
   */
  public static buildBrandIntelligencePrompt(
    profile: InstagramProfile,
    fallbackData: BrandIntelligenceReport
  ): AIPromptPayload<BrandIntelligenceReport> {
    const recentCaptions =
      profile.posts
        ?.slice(0, 5)
        .map(
          (p, idx) =>
            `Post ${idx + 1}: "${(p.caption || "").slice(0, 150)}..." (${p.likes} likes, ${p.comments} comments)`
        )
        .join("\n") || "No recent posts available.";

    // Use Selection Engine to automatically determine best industry, tone, examples, etc.
    const autoSelection = PromptSelectionEngine.selectForBrandIntelligence(profile);

    const compiledResult = PromptCompiler.compileFromSelection(autoSelection, {
      brand: `@${profile.username} (${profile.display_name})`,
      industry: autoSelection.industry !== "general" ? autoSelection.industry : "Social Media & Digital Creators",
      audience: "Instagram followers and prospective customers",
      goal: "Analyze core brand strategy, content pillars, and market position",
      tone: autoSelection.tone !== "general" ? autoSelection.tone : "Strategic, authoritative, and data-driven",
      framework: "Omnichannel Brand Intelligence",
      hook: "Profile engagement analysis",
      cta: "Strategic recommendations",
      competitors: "Similar creators in vertical",
      brand_voice: profile.bio || "Authentic social media presence",
      script_length: "N/A",
      language: "English",
    });

    const systemPrompt = `You are ReelForge AI, an elite omnichannel brand strategist and social media intelligence engine.\nYour task is to analyze an Instagram profile and output a structured Brand Intelligence Report in strict JSON format.\nYou must return ONLY valid JSON matching the required schema description, without any markdown formatting, backticks, or explanatory text.`;

    const userPrompt = `${compiledResult.compiledText}\n\nProfile Username: @${profile.username}\nDisplay Name: ${profile.display_name}\nBiography: ${profile.bio || "None"}\nFollowers: ${profile.follower_count}\nFollowing: ${profile.following_count}\nPosts Count: ${profile.post_count}\nIs Verified: ${profile.is_verified}\n\nRecent Top Posts:\n${recentCaptions}\n\nBased on this data and the strategic instructions above, generate a comprehensive Brand Intelligence Report in strict JSON format.`;

    const expectedSchemaDescription = `{
  "industry": "string (e.g., Fitness & Health, SaaS & Tech, Fashion & Lifestyle, etc.)",
  "subIndustry": "string",
  "brandType": "Personal Brand | B2C Brand | B2B SaaS | E-Commerce | Media / Publication | Agency / Service",
  "targetAudience": "string describing demographic and psychographic profile",
  "estimatedAudienceAge": "string (e.g., 18-24, 25-34)",
  "brandTone": "string (e.g., Authoritative yet accessible)",
  "contentStyle": "string describing video presentation style",
  "primaryContentPillars": ["array of 3 to 5 core content themes/topics"],
  "postingFrequency": "string (e.g., Daily, 3x/week)",
  "estimatedMarketPosition": "Niche Authority | Emerging Creator | Market Leader | Growth Challenger",
  "confidenceScore": 95
}`;

    return {
      systemPrompt,
      userPrompt,
      expectedSchemaDescription,
      schemaType: "brand-intelligence",
      temperature: 0.3,
      maxOutputTokens: 1024,
      fallbackData,
      compiledResult,
    };
  }

  /**
   * Generates a provider-independent prompt payload for 9-section Studio Script Generation
   * using automatic module selection from PromptSelectionEngine.
   */
  public static buildScriptGenerationPrompt(
    dna: ContentDNAReport,
    fallbackData: ReelContentPackage
  ): AIPromptPayload<ReelContentPackage> {
    const winningHooks =
      dna.winningHooks?.topHooks
        ?.map((h) => `- ${h.hookType} (Virality: ${h.avgVirality})`)
        .join("\n") || "None";
    const topFormats =
      dna.winningStructure?.formulaString || "Standard short-form structure";

    // Use Selection Engine to automatically determine best hook, framework, tone, cta, etc.
    const autoSelection = PromptSelectionEngine.selectForScriptGeneration(dna);

    const compiledResult = PromptCompiler.compileFromSelection(autoSelection, {
      brand: `@${dna.id}`,
      industry: "Short-Form Video & Social Media",
      audience: "Target Instagram Reels demographic",
      goal: "Maximize retention, virality, and keyword comment lead capture",
      tone: autoSelection.tone !== "general" ? autoSelection.tone : "High-energy, engaging, and authoritative",
      framework: autoSelection.framework !== "general" ? autoSelection.framework : "Hormozi Value Equation & No-Brainer Offer",
      hook: dna.snapshot?.dominantHook || "Curiosity Gap",
      cta: "Keyword Comment DM",
      competitors: "Top viral creators in niche",
      brand_voice: "Authentic, fast-paced video narrator",
      script_length: "130-150 words",
      language: "English",
    });

    const systemPrompt = `You are ReelForge AI, an expert short-form video director, scriptwriter, and viral content strategist.\nYour task is to generate a complete, production-ready 9-section Instagram Reel Content Package based on the creator's Content DNA.\nYou must return ONLY valid JSON matching the required schema description, without any markdown formatting, backticks, or explanatory text.`;

    const userPrompt = `${compiledResult.compiledText}\n\nCreator Username: @${dna.id}\nOverall DNA Score: ${dna.snapshot?.overallDNAScore || 0}/100\nDominant Hook Style: ${dna.snapshot?.dominantHook || "General"}\nDominant Psychology: ${dna.snapshot?.dominantPsychology || "Curiosity"}\n\nWinning Hooks:\n${winningHooks}\n\nTop Performing Formats:\n${topFormats}\n\nGenerate a complete, highly engaging Reel package in strict JSON format.`;

    const expectedSchemaDescription = `{
  "id": "string (unique ID)",
  "createdAt": "ISO timestamp",
  "strategy": { "contentGoal": "string", "targetAudience": "string", "emotion": "string", "contentPillar": "string", "hookStyle": "string", "ctaStyle": "string", "difficulty": "string", "estimatedPerformance": "string", "confidence": 95 },
  "reelIdea": { "title": "string", "summary": "string", "uniqueAngle": "string", "expectedOutcome": "string" },
  "hook": { "firstSentence": "string", "openingVisual": "string", "openingShot": "string", "textOverlay": "string", "voiceover": "string" },
  "scenes": [
    { "sceneNumber": 1, "title": "string", "visual": "string", "camera": "string", "voiceover": "string", "textOverlay": "string", "duration": "0:00-0:03", "transition": "string" },
    { "sceneNumber": 2, "title": "string", "visual": "string", "camera": "string", "voiceover": "string", "textOverlay": "string", "duration": "0:03-0:15", "transition": "string" }
  ],
  "caption": { "fullCaption": "string" },
  "cta": { "primaryCTA": "string", "alternativeCTA": "string", "pinnedComment": "string" },
  "hashtags": { "groups": [{ "category": "High Reach", "tags": ["#tag1", "#tag2"] }], "allTagsString": "#tag1 #tag2" },
  "postingRecommendation": { "bestTime": "string", "bestDay": "string", "coverStyle": "string", "firstComment": "string" },
  "checklist": { "hookReady": false, "captionReady": false, "ctaReady": false, "hashtagsReady": false, "coverReady": false, "postReady": false },
  "productionSummary": { "estimatedShootTime": "string", "estimatedReelDuration": "string", "editingDifficulty": "string", "equipmentNeeded": ["Camera", "Mic"], "bRollCount": 3 },
  "productionScore": { "overallScore": 92, "confidence": 95, "difficulty": "Medium", "estimatedPerformance": "High" }
}`;

    return {
      systemPrompt,
      userPrompt,
      expectedSchemaDescription,
      schemaType: "script-generation",
      temperature: 0.5,
      maxOutputTokens: 2048,
      fallbackData,
      compiledResult,
    };
  }

  /**
   * Generates a provider-independent prompt payload for Competitor Analysis
   * using automatic module selection and PromptCompiler.
   */
  public static buildCompetitorAnalysisPrompt(
    competitor: Competitor,
    fallbackData: CompetitorProfileAnalysis
  ): AIPromptPayload<CompetitorProfileAnalysis> {
    const compiledResult = PromptCompiler.compileFromSelection({
      system: "system.default",
      industry: "industry.general",
      tone: "tone.authoritative",
    }, {
      brand: `@${competitor.username} (${competitor.displayName})`,
      industry: competitor.industry || "Social Media Creators",
      audience: "Target followers and prospective consumers",
      goal: "Analyze competitor content strategy, engagement benchmarks, and brand position",
      tone: "Strategic, analytical, and objective",
    });

    const systemPrompt = `You are ReelForge AI, an elite competitive intelligence analyst.\nYour task is to analyze a competitor's Instagram profile and output a structured Competitor Profile Analysis report in strict JSON format.\nYou must return ONLY valid JSON matching the required schema description, without any markdown formatting, backticks, or explanatory text.`;

    const userPrompt = `${compiledResult.compiledText}\n\nCompetitor Username: @${competitor.username}\nDisplay Name: ${competitor.displayName}\nFollowers: ${competitor.followers}\nIndustry/Category: ${competitor.industry}\nSimilarity Score: ${competitor.similarityScore}%\nReason Match: ${competitor.reasonMatch}\n\nBased on this data, generate a comprehensive Competitor Profile Analysis report in strict JSON format.`;

    const expectedSchemaDescription = `{
  "id": "string",
  "competitorId": "string",
  "username": "string",
  "analyzedAt": "ISO timestamp",
  "businessSummary": { "industry": "string", "marketPosition": "string", "primaryAudience": "string", "coreDifferentiator": "string", "contentMaturity": "string" },
  "accountOverview": { "username": "string", "displayName": "string", "profilePictureUrl": "string", "followers": 10000, "following": 500, "totalPosts": 120, "verifiedStatus": false, "estimatedAccountAge": "string" },
  "performanceMetrics": { "estimatedEngagementRate": 4.5, "avgLikes": 450, "avgComments": 35, "estimatedMonthlyGrowth": "string", "postingFrequency": "string", "reelPercentage": 70, "carouselPercentage": 20, "imagePercentage": 10 },
  "brandPosition": { "industry": "string", "brandType": "string", "pricePosition": "string", "targetAudience": "string", "audienceAge": "string", "brandTone": "string", "contentStyle": "string", "marketPosition": "string" },
  "contentPillars": [{ "name": "string", "estimatedPercentage": 50, "confidenceScore": 90 }],
  "captionAnalysis": { "averageCaptionLength": "string", "emojiUsage": "string", "ctaFrequency": "string", "hashtagUsage": "string", "writingStyle": "string", "storytellingLevel": "string" },
  "audiencePsychology": { "primaryMotivation": "string", "buyingIntent": "string", "emotionalTriggers": ["string"], "decisionDrivers": ["string"], "painPoints": ["string"], "trustSignals": ["string"], "preferredContent": "string" },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"],
  "overallIntelligenceScore": { "overallScore": 88, "brandMaturity": 85, "growthPotential": 90, "contentQuality": 88, "consistency": 87, "confidence": 92 }
}`;

    return {
      systemPrompt,
      userPrompt,
      expectedSchemaDescription,
      schemaType: "competitor-analysis",
      temperature: 0.3,
      maxOutputTokens: 2048,
      fallbackData,
      compiledResult,
    };
  }

  /**
   * Generates a provider-independent prompt payload for Content Intelligence analysis
   * using automatic module selection and PromptCompiler.
   */
  public static buildContentIntelligencePrompt(
    items: CollectedContentItem[],
    fallbackData: ContentIntelligenceReport[]
  ): AIPromptPayload<ContentIntelligenceReport[]> {
    const itemsSummary = items
      .slice(0, 10)
      .map((it, idx) => {
        const viewsStr =
          it.viewsAvailable === false || (!it.viewsAvailable && it.views === 0)
            ? "unavailable (profile scraper)"
            : `${it.views || 0}`;
        return `Item ${idx + 1} (${it.type}): "${(it.caption || "").slice(0, 120)}..." | Views: ${viewsStr}, Likes: ${it.likes || 0}, Comments: ${it.comments || 0}`;
      })
      .join("\n");

    const compiledResult = PromptCompiler.compileFromSelection({
      system: "system.default",
      industry: "industry.general",
      tone: "tone.authoritative",
    }, {
      brand: "Target Creator Portfolio",
      industry: "Short-Form Video Content",
      audience: "Digital video consumers",
      goal: "Deconstruct viral hooks, retention patterns, and psychological triggers",
      tone: "Analytical, precise, and actionable",
    });

    const systemPrompt = `You are ReelForge AI, an expert content intelligence and viral video teardown specialist.\nYour task is to analyze selected short-form video items and output an array of detailed Content Intelligence Reports in strict JSON format.\nYou must return ONLY valid JSON matching the required schema description, without any markdown formatting, backticks, or explanatory text.`;

    const userPrompt = `${compiledResult.compiledText}\n\nSelected Content Items (${items.length} total):\n${itemsSummary}\n\nIMPORTANT METRIC PROVENANCE:\nWhere 'Views' are listed as 'unavailable (profile scraper)', you MUST obey these rules:\n1. Do not interpret unavailable views as zero views or zero reach.\n2. Do not invent or fabricate missing view counts.\n3. Do not claim a precise view-based engagement rate, virality score, save rate, or share rate when views or reach are unavailable.\n4. Analyze virality, psychology, and winning/failure factors strictly based on available engagement signals (Likes, Comments, Caption structure, and Content Type).\n5. Treat save counts, share counts, view counts, and total reach as unavailable unless explicitly provided in the input item metrics.\n\nGenerate an array of Content Intelligence Reports corresponding to each analyzed item in strict JSON format.`;

    const expectedSchemaDescription = `[
  {
    "id": "string",
    "contentItemId": "string",
    "thumbnailUrl": "string",
    "type": "reel | video | carousel",
    "caption": "string",
    "publishDate": "string",
    "hook": { "hookType": "string", "hookStrength": 85, "patternInterrupt": "string", "first3Seconds": "string" },
    "captionIntelligence": { "length": "string", "cta": "string", "emojiUsage": "string", "storytelling": "string", "readability": "string" },
    "visual": { "editingPace": "string", "cameraStyle": "string", "textOverlay": "string", "colorStyle": "string" },
    "engagement": { "views": 0, "viewsAvailable": false, "likes": 500, "comments": 50, "estimatedSaveRate": 0, "estimatedShareRate": 0 },
    "psychology": { "curiosity": 85, "emotion": 80, "authority": 75, "socialProof": 70, "scarcity": 60, "relatability": 90 },
    "virality": { "viralityScore": 0, "viralityAvailable": false, "successProbability": "Unavailable (No Reach/View Data)", "confidence": 0 },
    "winningFactors": ["string"],
    "failureFactors": ["string"],
    "reusability": { "score": 88, "reusabilityLevel": "High", "confidence": 90 },
    "whyItWorked": ["string"]
  }
]`;

    return {
      systemPrompt,
      userPrompt,
      expectedSchemaDescription,
      schemaType: "content-intelligence",
      temperature: 0.3,
      maxOutputTokens: 2048,
      fallbackData,
      compiledResult,
    };
  }

  /**
   * Generates a provider-independent prompt payload for Content DNA synthesis
   * using automatic module selection and PromptCompiler.
   */
  public static buildContentDNAPrompt(
    reports: ContentIntelligenceReport[],
    fallbackData: ContentDNAReport
  ): AIPromptPayload<ContentDNAReport> {
    const topHooks = reports
      .slice(0, 5)
      .map((r, idx) => `Report ${idx + 1}: Hook Type -> ${r.hook?.hookType || "General"} | Strength: ${r.hook?.hookStrength || 80}`)
      .join("\n");

    const compiledResult = PromptCompiler.compileFromSelection({
      system: "system.default",
      industry: "industry.general",
      tone: "tone.authoritative",
    }, {
      brand: "Creator Content DNA",
      industry: "Short-Form Video Strategy",
      audience: "Target demographic across platforms",
      goal: "Synthesize winning creative patterns into a repeatable master formula blueprint",
      tone: "Strategic, authoritative, and actionable",
    });

    const systemPrompt = `You are ReelForge AI, the master strategist behind viral short-form Content DNA synthesis.\nYour task is to aggregate multiple Content Intelligence reports into a unified, high-precision Content DNA blueprint in strict JSON format.\nYou must return ONLY valid JSON matching the required schema description, without any markdown formatting, backticks, or explanatory text.`;

    const userPrompt = `${compiledResult.compiledText}\n\nAnalyzed Reports Count: ${reports.length}\nTop Performing Hook Signatures:\n${topHooks}\n\nSynthesize the complete Content DNA Master Formula in strict JSON format.`;

    const expectedSchemaDescription = `{
  "id": "string",
  "generatedAt": "ISO timestamp",
  "analyzedPostCount": 10,
  "winningHooks": { "dominantHookType": "string", "avgHookScore": 88, "topHooks": [{ "hookType": "string", "example": "string", "avgVirality": 90, "whyItWorks": "string" }] },
  "winningStructure": { "primaryFramework": "string", "avgPacing": "string", "formulaString": "Hook -> Agitate -> Value -> CTA", "retentionTactics": ["string"] },
  "topConversionAccelerators": [{ "ctaStyle": "string", "conversionScore": 88, "bestUsedFor": "string" }],
  "audiencePsychologyProfile": { "coreDesire": "string", "primaryFear": "string", "emotionalDriver": "string", "persuasionTrigger": "string" },
  "contentPillarsMatrix": [{ "pillarName": "string", "recommendedShare": "40%", "expectedAvgVirality": 85, "sampleHookAngles": ["string"] }],
  "optimalPostingSchedule": { "bestDays": ["string"], "bestTimeWindows": ["string"], "recommendedFrequency": "string" },
  "productionChecklist": ["string"],
  "captionFormulaMatrix": [{ "formulaName": "string", "structure": "string", "bestFor": "string" }],
  "recommendedNextSteps": ["string"],
  "snapshot": { "dominantHook": "string", "dominantPsychology": "string", "bestFramework": "string", "overallDNAScore": 91 }
}`;

    return {
      systemPrompt,
      userPrompt,
      expectedSchemaDescription,
      schemaType: "content-dna",
      temperature: 0.3,
      maxOutputTokens: 2048,
      fallbackData,
      compiledResult,
    };
  }

  /**
   * Generates a provider-independent prompt payload for Omnichannel Repurpose Studio
   * using automatic module selection and PromptCompiler.
   */
  public static buildRepurposePrompt(
    pkg: ReelContentPackage,
    fallbackData: RepurposeReport
  ): AIPromptPayload<RepurposeReport> {
    const compiledResult = PromptCompiler.compileFromSelection({
      system: "system.default",
      industry: "industry.general",
      tone: "tone.authoritative",
    }, {
      brand: "Omnichannel Creator",
      industry: "Multi-Platform Content Distribution",
      audience: "Audience across Instagram, TikTok, YouTube, LinkedIn, Twitter, and Email",
      goal: "Transform a winning short-form script into 14 platform-native content assets",
      tone: "Platform-native, tailored, and engaging",
    });

    const systemPrompt = `You are ReelForge AI, an elite omnichannel content repurposing and syndication engine.\nYour task is to take a winning 9-section Reel Content Package and adapt it into 14 distinct platform-native assets across Meta, YouTube, TikTok, LinkedIn, Twitter, and Email Newsletter in strict JSON format.\nYou must return ONLY valid JSON matching the required schema description, without any markdown formatting, backticks, or explanatory text.`;

    const userPrompt = `${compiledResult.compiledText}\n\nSource Reel Title: ${pkg.reelIdea?.title || "Reel Script"}\nSource Hook: ${pkg.hook?.firstSentence || "Winning Hook"}\nSource Caption: ${pkg.caption?.fullCaption || ""}\nPrimary CTA: ${pkg.cta?.primaryCTA || "Keyword Comment"}\n\nGenerate the complete 14-asset omnichannel adaptation package in strict JSON format.`;

    const expectedSchemaDescription = `{
  "id": "string",
  "createdAt": "ISO timestamp",
  "sourcePackageId": "string",
  "instagram": { "title": "string", "caption": "string", "cta": "string", "hashtags": "#reels #viral", "metrics": { "wordCount": 120, "characterCount": 650, "readingTimeSeconds": 36 } },
  "linkedIn": { "professionalHook": "string", "longFormPost": "string", "cta": "string", "hashtags": ["string"], "metrics": { "wordCount": 200, "characterCount": 1100, "readingTimeSeconds": 60 } },
  "x": { "thread": [{ "tweetNumber": 1, "content": "string" }], "cta": "string", "metrics": { "wordCount": 80, "characterCount": 280, "readingTimeSeconds": 24 } },
  "threads": { "conversationalPost": "string", "cta": "string", "metrics": { "wordCount": 90, "characterCount": 450, "readingTimeSeconds": 27 } },
  "facebook": { "communityPost": "string", "cta": "string", "metrics": { "wordCount": 150, "characterCount": 800, "readingTimeSeconds": 45 } },
  "youtubeShorts": { "title": "string", "description": "string", "tags": ["string"], "cta": "string", "metrics": { "wordCount": 100, "characterCount": 500, "readingTimeSeconds": 30 } }
}`;

    return {
      systemPrompt,
      userPrompt,
      expectedSchemaDescription,
      schemaType: "repurpose",
      temperature: 0.4,
      maxOutputTokens: 2048,
      fallbackData,
      compiledResult,
    };
  }

  /**
   * Development utility to preview and inspect a compiled prompt before sending to AI providers.
   * Throws an error if invoked in production environments.
   */
  public static previewPrompt(
    context: PromptSelectionContext,
    variables: Record<string, any>,
    selectionOverride?: Partial<PromptModuleSelection>
  ): PromptPreviewPayload {
    return PromptCompiler.preview(context, variables, selectionOverride);
  }
}
