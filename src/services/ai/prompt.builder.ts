import type { InstagramProfile } from "@/types/instagram";
import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { ContentDNAReport } from "@/types/content-dna";
import type { ReelContentPackage } from "@/types/script-generation";
import type { Competitor } from "@/types/competitor";
import type { CompetitorProfileAnalysis } from "@/types/competitor-analysis";
import type { CollectedContentItem } from "@/types/content-collection";
import type { ContentIntelligenceReport } from "@/types/content-intelligence";
import type { RepurposeReport } from "@/types/repurpose";
import type { VisionResult } from "@/types/brand-knowledge";
import type { AIPromptPayload, ImagePayload } from "./provider.interface";
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

    // Use Selection Engine to automatically determine best industry, tone, constraints
    const autoSelection = PromptSelectionEngine.selectForBrandIntelligence(profile);

    const compiledResult = PromptCompiler.compileFromSelection({
      system: autoSelection.system || "system.default",
      industry: autoSelection.industry || "industry.general",
      tone: autoSelection.tone || "tone.authoritative",
      constraints: autoSelection.constraints || "constraints.default",
    }, {
      brand: `@${profile.username} (${profile.display_name})`,
      industry: autoSelection.industry !== "general" ? autoSelection.industry : "Social Media & Digital Creators",
      audience: "Instagram followers and prospective customers",
      goal: "Analyze core brand strategy, content pillars, and market position",
      tone: autoSelection.tone !== "general" ? autoSelection.tone : "Strategic, authoritative, and data-driven",
      brand_voice: "Strategic, authoritative, and data-driven",
      script_length: "N/A (Analytical Extraction)",
      language: "English",
    });

    const systemPrompt = `You are ReelForge AI, an elite omnichannel brand strategist and social media intelligence engine.\nYour task is to analyze an Instagram profile and output a structured Brand Intelligence Report in strict JSON format.`;

    const expectedSchemaDescription = `{"industry":"string","subIndustry":"string","brandType":"Personal Brand | B2C Brand | B2B SaaS | E-Commerce | Media / Publication | Agency / Service","targetAudience":"string","estimatedAudienceAge":"string","brandTone":"string","contentStyle":"string","primaryContentPillars":["string"],"postingFrequency":"string","estimatedMarketPosition":"string","confidenceScore":95}`;

    const userPrompt = `${compiledResult.compiledText}\n\nProfile Username: @${profile.username}\nDisplay Name: ${profile.display_name}\nBiography: ${profile.bio || "None"}\nFollowers: ${profile.follower_count}\nFollowing: ${profile.following_count}\nPosts Count: ${profile.post_count}\nIs Verified: ${profile.is_verified}\n\nRecent Top Posts:\n${recentCaptions}\n\nExpected JSON Schema:\n${expectedSchemaDescription}`;

    return {
      systemPrompt,
      userPrompt,
      expectedSchemaDescription,
      schemaType: "brand-intelligence",
      temperature: 0.3,
      maxOutputTokens: 600,
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

    // Use Selection Engine to automatically determine best hook, framework, cta, constraints
    const autoSelection = PromptSelectionEngine.selectForScriptGeneration(dna);

    const compiledResult = PromptCompiler.compileFromSelection({
      system: autoSelection.system || "system.default",
      hook: autoSelection.hook || "hook.curiosity",
      framework: autoSelection.framework || "framework.hormozi",
      cta: autoSelection.cta || "cta.comment_keyword",
      constraints: autoSelection.constraints || "constraints.default",
    }, {
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

    const systemPrompt = `You are ReelForge AI, an expert short-form video director, scriptwriter, and viral content strategist.\nYour task is to generate a complete, production-ready 9-section Instagram Reel Content Package based on the creator's Content DNA.`;

    const expectedSchemaDescription = `{"id":"string","createdAt":"string","strategy":{"contentGoal":"string","targetAudience":"string","emotion":"string","contentPillar":"string","hookStyle":"string","ctaStyle":"string","difficulty":"string","estimatedPerformance":"string","confidence":95},"reelIdea":{"title":"string","summary":"string","uniqueAngle":"string","expectedOutcome":"string"},"hook":{"firstSentence":"string","openingVisual":"string","openingShot":"string","textOverlay":"string","voiceover":"string"},"scenes":[{"sceneNumber":1,"title":"string","visual":"string","camera":"string","voiceover":"string","textOverlay":"string","duration":"0:00-0:03","transition":"string"},{"sceneNumber":2,"title":"string","visual":"string","camera":"string","voiceover":"string","textOverlay":"string","duration":"0:03-0:15","transition":"string"}],"caption":{"fullCaption":"string"},"cta":{"primaryCTA":"string","alternativeCTA":"string","pinnedComment":"string"},"hashtags":{"groups":[{"category":"High Reach","tags":["#tag1","#tag2"]}],"allTagsString":"#tag1 #tag2"},"postingRecommendation":{"bestTime":"string","bestDay":"string","coverStyle":"string","firstComment":"string"},"checklist":{"hookReady":false,"captionReady":false,"ctaReady":false,"hashtagsReady":false,"coverReady":false,"postReady":false},"productionSummary":{"estimatedShootTime":"string","estimatedReelDuration":"string","editingDifficulty":"string","equipmentNeeded":["Camera","Mic"],"bRollCount":3},"productionScore":{"overallScore":92,"confidence":95,"difficulty":"Medium","estimatedPerformance":"High"}}`;

    const userPrompt = `${compiledResult.compiledText}\n\nCreator Username: @${dna.id}\nOverall DNA Score: ${dna.snapshot?.overallDNAScore || 0}/100\nDominant Hook Style: ${dna.snapshot?.dominantHook || "General"}\nDominant Psychology: ${dna.snapshot?.dominantPsychology || "Curiosity"}\n\nWinning Hooks:\n${winningHooks}\n\nTop Performing Formats:\n${topFormats}\n\nExpected JSON Schema:\n${expectedSchemaDescription}`;

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
      brand_voice: "Strategic, analytical, and objective",
      script_length: "N/A (Analytical Extraction)",
      language: "English",
    });

    const systemPrompt = `You are ReelForge AI, an elite competitive intelligence analyst.\nYour task is to analyze a competitor's Instagram profile and output a structured Competitor Profile Analysis report in strict JSON format.`;

    const expectedSchemaDescription = `{"id":"string","competitorId":"string","username":"string","analyzedAt":"string","businessSummary":{"industry":"string","marketPosition":"string","primaryAudience":"string","coreDifferentiator":"string","contentMaturity":"string"},"accountOverview":{"username":"string","displayName":"string","profilePictureUrl":"string","followers":10000,"following":500,"totalPosts":120,"verifiedStatus":false,"estimatedAccountAge":"string"},"performanceMetrics":{"estimatedEngagementRate":4.5,"avgLikes":450,"avgComments":35,"estimatedMonthlyGrowth":"string","postingFrequency":"string","reelPercentage":70,"carouselPercentage":20,"imagePercentage":10},"brandPosition":{"industry":"string","brandType":"string","pricePosition":"string","targetAudience":"string","audienceAge":"string","brandTone":"string","contentStyle":"string","marketPosition":"string"},"contentPillars":[{"name":"string","estimatedPercentage":50,"confidenceScore":90}],"captionAnalysis":{"averageCaptionLength":"string","emojiUsage":"string","ctaFrequency":"string","hashtagUsage":"string","writingStyle":"string","storytellingLevel":"string"},"audiencePsychology":{"primaryMotivation":"string","buyingIntent":"string","emotionalTriggers":["string"],"decisionDrivers":["string"],"painPoints":["string"],"trustSignals":["string"],"preferredContent":"string"},"strengths":["string"],"weaknesses":["string"],"recommendations":["string"],"overallIntelligenceScore":{"overallScore":88,"brandMaturity":85,"growthPotential":90,"contentQuality":88,"consistency":87,"confidence":92}}`;

    const userPrompt = `${compiledResult.compiledText}\n\nCompetitor Username: @${competitor.username}\nDisplay Name: ${competitor.displayName}\nFollowers: ${competitor.followers}\nIndustry/Category: ${competitor.industry}\nSimilarity Score: ${competitor.similarityScore}%\nReason Match: ${competitor.reasonMatch}\n\nExpected JSON Schema:\n${expectedSchemaDescription}`;

    return {
      systemPrompt,
      userPrompt,
      expectedSchemaDescription,
      schemaType: "competitor-analysis",
      temperature: 0.3,
      maxOutputTokens: 1024,
      fallbackData,
      compiledResult,
    };
  }

  /**
   * Generates a provider-independent prompt payload for Competitor Candidate Discovery.
   * Enforces that suggested handles are candidates (`AI_SUGGESTED`) until verified via cache.
   */
  public static buildCompetitorDiscoveryPrompt(
    report: BrandIntelligenceReport,
    fallbackData: Competitor[],
    strategy?: import("@/types/competitor-intelligence").ProfileClassificationResult
  ): AIPromptPayload<Competitor[]> {
    const compiledResult = PromptCompiler.compileFromSelection({
      system: "system.default",
      constraints: "constraints.default",
    }, {
      brand: `${report.industry} (${report.subIndustry})`,
      industry: report.industry || "Social Media Creators",
      audience: report.targetAudience || "Target social media followers",
      goal: "Propose high-relevance Instagram competitor handles based on niche overlap",
      tone: "Strategic, analytical, and objective",
      brand_voice: "Strategic, analytical, and objective",
      script_length: "N/A (Candidate Discovery)",
      language: "English",
    });

    const systemPrompt = `You are ReelForge AI, an elite competitive intelligence researcher.\nYour task is to propose up to 10 high-overlap Instagram candidate handles for the specified industry niche.`;

    const expectedSchemaDescription = `[{"username":"string","displayName":"string","industry":"string","similarityScore":92,"reasonMatch":"string","confidenceScore":88}]`;

    let userPrompt = `${compiledResult.compiledText}\n\nIndustry: ${report.industry}\nSub-Industry: ${report.subIndustry}\nBrand Type: ${report.brandType}\nTarget Audience: ${report.targetAudience}\nBrand Tone: ${report.brandTone}`;

    if (strategy && strategy.matrix) {
      userPrompt += `\n\n--- ADAPTIVE COMPETITOR STRATEGY ---
Current Growth Stage: ${strategy.growthStage}
Primary Objective: ${strategy.nextObjective}
You MUST select 10 competitors strictly following this required ratio (10 total):
- ${Math.round(strategy.matrix.peerRatio / 10)} Peer accounts (Similar size/stage)
- ${Math.round(strategy.matrix.aspirationalRatio / 10)} Aspirational accounts (Next level up)
- ${Math.round(strategy.matrix.leaderRatio / 10)} Market Leaders (Top of industry)
- ${Math.round(strategy.matrix.emergingRatio / 10)} Emerging/Challengers (Fast growing micro accounts)
Provide exactly 10 candidates fulfilling these ratios.`;
    }

    userPrompt += `\n\nExpected JSON Schema:\n${expectedSchemaDescription}`;

    return {
      systemPrompt,
      userPrompt,
      expectedSchemaDescription,
      schemaType: "competitor-discovery",
      temperature: 0.4,
      maxOutputTokens: 500,
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
      .slice(0, 3)
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
      brand_voice: "Analytical, precise, and actionable",
      script_length: "N/A (Analytical Extraction)",
      language: "English",
    });

    const systemPrompt = `You are ReelForge AI, an elite content intelligence and viral video teardown specialist.\nYour task is to analyze selected short-form video items and output an array of detailed Content Intelligence Reports in strict JSON format.`;

    const expectedSchemaDescription = `[{"id":"string","contentItemId":"string","thumbnailUrl":"string","type":"reel | video | carousel","caption":"string","publishDate":"string","hook":{"hookType":"string","hookStrength":85,"patternInterrupt":"string","first3Seconds":"string"},"captionIntelligence":{"length":"string","cta":"string","emojiUsage":"string","storytelling":"string","readability":"string"},"visual":{"editingPace":"string","cameraStyle":"string","textOverlay":"string","colorStyle":"string"},"engagement":{"views":0,"viewsAvailable":false,"likes":500,"comments":50,"estimatedSaveRate":0,"estimatedShareRate":0},"psychology":{"curiosity":85,"emotion":80,"authority":75,"socialProof":70,"scarcity":60,"relatability":90},"virality":{"viralityScore":0,"viralityAvailable":false,"successProbability":"string","confidence":0},"winningFactors":["string"],"failureFactors":["string"],"reusability":{"score":88,"reusabilityLevel":"High","confidence":90},"whyItWorked":["string"]}]`;

    const userPrompt = `${compiledResult.compiledText}\n\nSelected Content Items (analyze exactly 3 items):\n${itemsSummary}\n\nIMPORTANT METRIC PROVENANCE:\nWhere 'Views' are listed as 'unavailable (profile scraper)', you MUST obey these rules:\n1. Do not interpret unavailable views as zero views or zero reach.\n2. Do not invent or fabricate missing view counts.\n3. Do not claim a precise view-based engagement rate, virality score, save rate, or share rate when views or reach are unavailable.\n4. Analyze virality, psychology, and winning/failure factors strictly based on available engagement signals (Likes, Comments, Caption structure, and Content Type).\n5. Treat save counts, share counts, view counts, and total reach as unavailable unless explicitly provided in the input item metrics.\n\nExpected JSON Schema:\n${expectedSchemaDescription}`;

    return {
      systemPrompt,
      userPrompt,
      expectedSchemaDescription,
      schemaType: "content-intelligence",
      temperature: 0.3,
      maxOutputTokens: 2500,
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
    const hasMeasuredVirality = reports.some((r) => r.virality.viralityAvailable !== false);
    const topHooks = reports
      .slice(0, 5)
      .map((r, idx) => {
        const viralityStr = r.virality.viralityAvailable === false
          ? `Virality Score: 0 (Profile Scraper - Unmeasured) | Interaction Proxy Score: ${r.virality.interactionProxyScore ?? "N/A"}`
          : `Virality Score: ${r.virality.viralityScore}`;
        return `Report ${idx + 1}: Hook Type -> ${r.hook?.hookType || "General"} | Strength: ${r.hook?.hookStrength || 80} | ${viralityStr}`;
      })
      .join("\n");

    const compiledResult = PromptCompiler.compileFromSelection({
      system: "system.default",
      constraints: "constraints.default",
    }, {
      brand: "Creator Content DNA",
      industry: "Short-Form Video Strategy",
      audience: "Target demographic across platforms",
      goal: "Synthesize winning creative patterns into a repeatable master formula blueprint",
      tone: "Strategic, authoritative, and actionable",
      brand_voice: "Strategic, authoritative, and actionable",
      script_length: "N/A (Strategic Synthesis)",
      language: "English",
    });

    const systemPrompt = `You are ReelForge AI, the master strategist behind viral short-form Content DNA synthesis.\nYour task is to aggregate multiple Content Intelligence reports into a unified, high-precision Content DNA blueprint in strict JSON format.`;

    const provenanceBlock = !hasMeasuredVirality
      ? `\n\nIMPORTANT METRIC PROVENANCE:\nThe input Content Intelligence reports were derived from profile-scraper content where measured reach and view counts are unavailable (viralityAvailable = false). You MUST obey these rules:\n1. Do not interpret unavailable virality or reach as zero virality or zero performance.\n2. Do not invent or fabricate view counts, reach percentages, save counts, share counts, or measured virality scores in the Content DNA blueprint.\n3. Keep measured 'avgVirality' and 'expectedAvgVirality' at 0 or clearly indicate that reach metrics are unavailable.\n4. Derive qualitative DNA findings (such as winning hooks, dominant CTA, caption matrix, structure, and psychology profiles) strictly from available qualitative evidence (hook patterns, caption styles, content formats, psychology triggers, likes/comments density, and explicitly labelled interaction proxies).\n5. Do not inflate 'overallDNAScore' with synthetic reach weighting.`
      : "";

    const expectedSchemaDescription = `{"id":"string","generatedAt":"string","analyzedPostCount":10,"winningHooks":{"dominantHookType":"string","avgHookScore":88,"topHooks":[{"hookType":"string","example":"string","avgVirality":0,"viralityAvailable":false,"interactionProxyScore":85,"whyItWorks":"string"}]},"winningStructure":{"primaryFramework":"string","avgPacing":"string","formulaString":"Hook -> Agitate -> Value -> CTA","retentionTactics":["string"]},"topConversionAccelerators":[{"ctaStyle":"string","conversionScore":88,"bestUsedFor":"string"}],"audiencePsychologyProfile":{"coreDesire":"string","primaryFear":"string","emotionalDriver":"string","persuasionTrigger":"string"},"contentPillarsMatrix":[{"pillarName":"string","recommendedShare":"40%","expectedAvgVirality":0,"sampleHookAngles":["string"]}],"optimalPostingSchedule":{"bestDays":["string"],"bestTimeWindows":["string"],"recommendedFrequency":"string"},"productionChecklist":["string"],"captionFormulaMatrix":[{"formulaName":"string","structure":"string","bestFor":"string"}],"recommendedNextSteps":["string"],"snapshot":{"dominantHook":"string","dominantPsychology":"string","bestFramework":"string","overallDNAScore":88,"viralityAvailable":false,"interactionProxyScore":85,"interactionProxyRate":4.2}}`;

    const userPrompt = `${compiledResult.compiledText}\n\nAnalyzed Reports Count: ${reports.length}\nTop Performing Hook Signatures:\n${topHooks}${provenanceBlock}\n\nExpected JSON Schema:\n${expectedSchemaDescription}`;

    return {
      systemPrompt,
      userPrompt,
      expectedSchemaDescription,
      schemaType: "content-dna",
      temperature: 0.3,
      maxOutputTokens: 2500,
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
      constraints: "constraints.default",
    }, {
      brand: "Omnichannel Creator",
      industry: "Multi-Platform Content Distribution",
      audience: "Audience across Instagram, TikTok, YouTube, LinkedIn, Twitter, and Email",
      goal: "Transform a winning short-form script into 14 platform-native content assets",
      tone: "Platform-native, tailored, and engaging",
      brand_voice: "Platform-native, tailored, and engaging",
      script_length: "N/A (Multi-Platform Syndication)",
      language: "English",
    });

    const systemPrompt = `You are ReelForge AI, an elite omnichannel content repurposing and syndication engine.\nYour task is to take a winning 9-section Reel Content Package and adapt it into 14 distinct platform-native assets across Meta, YouTube, TikTok, LinkedIn, Twitter, and Email Newsletter in strict JSON format.`;

    const expectedSchemaDescription = `{"id":"string","createdAt":"string","sourcePackageId":"string","instagram":{"title":"string","caption":"string","cta":"string","hashtags":"#reels #viral","metrics":{"wordCount":120,"characterCount":650,"readingTimeSeconds":36}},"linkedIn":{"professionalHook":"string","longFormPost":"string","cta":"string","hashtags":["string"],"metrics":{"wordCount":200,"characterCount":1100,"readingTimeSeconds":60}},"x":{"thread":[{"tweetNumber":1,"content":"string"}],"cta":"string","metrics":{"wordCount":80,"characterCount":280,"readingTimeSeconds":24}},"threads":{"conversationalPost":"string","cta":"string","metrics":{"wordCount":90,"characterCount":450,"readingTimeSeconds":27}},"facebook":{"communityPost":"string","cta":"string","metrics":{"wordCount":150,"characterCount":800,"readingTimeSeconds":45}},"youtubeShorts":{"title":"string","description":"string","tags":["string"],"cta":"string","metrics":{"wordCount":100,"characterCount":500,"readingTimeSeconds":30}}}`;

    const userPrompt = `${compiledResult.compiledText}\n\nSource Reel Title: ${pkg.reelIdea?.title || "Reel Script"}\nSource Hook: ${pkg.hook?.firstSentence || "Winning Hook"}\nSource Caption: ${pkg.caption?.fullCaption || ""}\nPrimary CTA: ${pkg.cta?.primaryCTA || "Keyword Comment"}\n\nExpected JSON Schema:\n${expectedSchemaDescription}`;

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
   * Constructs a targeted revision prompt for the Adaptive Intelligence Engine.
   * Instructs the LLM to fix specific failed rules while preserving the structure and successful content.
   */
  public static buildAdaptiveRevisionPrompt<T>(
    originalPayload: AIPromptPayload<T>,
    originalOutput: any,
    failedRules: string[]
  ): AIPromptPayload<T> {
    const systemPrompt = originalPayload.systemPrompt;
    const userPrompt = `[ADAPTIVE INTELLIGENCE REVISION]
The previous generation failed specific quality heuristics.

Your task is to REVISE the generated output to fix ONLY the following failed rules:
${failedRules.map(r => `- ${r}`).join("\n")}

ORIGINAL OUTPUT TO REVISE:
${JSON.stringify(originalOutput, null, 2)}

CRITICAL CONSTRAINTS:
1. Fix ONLY the failed rules listed above.
2. PRESERVE all other successful content exactly as it was.
3. PRESERVE the user's original intent and tone.
4. DO NOT rewrite sections that did not fail.
5. Return the full, complete JSON object according to the schema.

ORIGINAL INSTRUCTIONS (For Context):
${originalPayload.userPrompt}`;

    return {
      systemPrompt,
      userPrompt,
      expectedSchemaDescription: originalPayload.expectedSchemaDescription,
      schemaType: originalPayload.schemaType,
      temperature: originalPayload.temperature,
      maxOutputTokens: originalPayload.maxOutputTokens,
      fallbackData: originalPayload.fallbackData,
      compiledResult: originalPayload.compiledResult
    };
  }

  /**
   * Constructs a targeted micro-revision prompt for the Interactive Studio Copilot.
   * Provides minimal structural context and explicitly isolates the targeted node.
   */
  public static buildCopilotRevisionPrompt(
    targetNode: any,
    contextSummary: string,
    instruction: string,
    fallbackData: any
  ): AIPromptPayload<any> {
    const systemPrompt = `You are ReelForge AI, an interactive studio copilot and elite creative editor.\nYour task is to revise a highly specific JSON node based on direct user feedback. You must return ONLY the revised valid JSON structure for this specific node. DO NOT return the entire project or script.`;

    const userPrompt = `[INTERACTIVE STUDIO COPILOT REVISION]
The user has requested a targeted revision to a specific section of their content.

--- CONTEXT SUMMARY ---
${contextSummary}

--- ORIGINAL NODE TO REVISE ---
${JSON.stringify(targetNode, null, 2)}

--- USER REVISION INSTRUCTION ---
"${instruction}"

CRITICAL CONSTRAINTS:
1. Apply the user's feedback to the ORIGINAL NODE provided above.
2. Maintain the exact same schema structure as the original node.
3. If the user asks to change the tone or length, apply it only to this specific node.
4. Output ONLY the strictly typed revised JSON object or array. Do not include markdown code blocks (e.g. \`\`\`json) or extra conversational text.`;

    return {
      systemPrompt,
      userPrompt,
      expectedSchemaDescription: "DYNAMIC_COPILOT_NODE",
      schemaType: "copilot-revision" as any,
      temperature: 0.5, // Slightly higher for creative revisions
      maxOutputTokens: 1024,
      fallbackData,
      compiledResult: { compiledText: userPrompt, variables: {} }
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

  /**
   * Constructs a vision analysis prompt to analyze brand assets using multi-modal AI capabilities.
   */
  public static buildVisionAnalysisPrompt(
    image: ImagePayload,
    fallbackData: VisionResult
  ): AIPromptPayload<VisionResult> {
    const systemPrompt = `You are ReelForge AI, an expert brand strategist, designer, and visual asset analyst.
Your task is to analyze the provided visual asset (image, logo, or document).
You must output your findings as a strict JSON object matching the requested schema.`;

    const userPrompt = `Please analyze the provided image.
Extract the following:
- caption: A brief description of the image content.
- tags: Relevant keywords for search.
- ocr: Any readable text found in the image.
- dominantColors: Up to 5 dominant HEX color codes.
- logoDetected: true/false if a brand logo is present.
- objectsDetected: Array of key objects.
- peopleDetected: true/false.
- typographyStyle: Description of font style if text is present.
- visualMood: The mood or aesthetic (e.g., 'minimalist', 'energetic').
- imageOrientation: 'portrait', 'landscape', or 'square'.
- estimatedQuality: 'low', 'medium', or 'high'.
- textLanguage: The language of the text, if detected.
- brandingConfidenceScore: 0-100 indicating how strongly this functions as a brand asset.

Return ONLY a valid JSON object. Do not include markdown code blocks.`;

    return {
      systemPrompt,
      userPrompt,
      expectedSchemaDescription: "VISION_RESULT",
      schemaType: "vision-analysis",
      temperature: 0.1,
      maxOutputTokens: 2048,
      fallbackData,
      images: [image],
      capabilities: {
        requiresVision: true,
        reasoning: "low",
        latency: "medium"
      }
    };
  }
}
