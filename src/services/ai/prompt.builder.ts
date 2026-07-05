import type { InstagramProfile } from "@/types/instagram";
import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { ContentDNAReport } from "@/types/content-dna";
import type { ReelContentPackage } from "@/types/script-generation";
import type { AIPromptPayload } from "./provider.interface";

/**
 * Prompt Builder Layer — ReelForge AI v2.0 Phase 5.
 *
 * Responsible for generating provider-independent, structured prompt payloads.
 * By centralizing prompt construction here, individual AI providers (Gemini, OpenAI, Claude)
 * never build or format prompts themselves. They simply transmit the payload and receive text.
 *
 * This separation ensures 100% consistency across models and allows frictionless addition
 * of future models (DeepSeek, Grok, Mistral, etc.) with zero business logic changes.
 */
export class PromptBuilder {
  /**
   * Generates a provider-independent prompt payload for Brand Intelligence analysis.
   */
  public static buildBrandIntelligencePrompt(
    profile: InstagramProfile,
    fallbackData: BrandIntelligenceReport
  ): AIPromptPayload<BrandIntelligenceReport> {
    const recentCaptions = profile.posts
      ?.slice(0, 5)
      .map((p, idx) => `Post ${idx + 1}: "${(p.caption || "").slice(0, 150)}..." (${p.likes} likes, ${p.comments} comments)`)
      .join("\n") || "No recent posts available.";

    const systemPrompt = `You are ReelForge AI, an elite omnichannel brand strategist and social media intelligence engine.
Your task is to analyze an Instagram profile and output a structured Brand Intelligence Report in strict JSON format.
You must return ONLY valid JSON matching the required schema description, without any markdown formatting, backticks, or explanatory text.`;

    const userPrompt = `Analyze the following Instagram profile and determine their core brand strategy:

Profile Username: @${profile.username}
Display Name: ${profile.display_name}
Biography: ${profile.bio || "None"}
Followers: ${profile.follower_count}
Following: ${profile.following_count}
Posts Count: ${profile.post_count}
Is Verified: ${profile.is_verified}

Recent Top Posts:
${recentCaptions}

Based on this data, generate a comprehensive Brand Intelligence Report in strict JSON format.`;

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
    };
  }

  /**
   * Generates a provider-independent prompt payload for 9-section Studio Script Generation.
   */
  public static buildScriptGenerationPrompt(
    dna: ContentDNAReport,
    fallbackData: ReelContentPackage
  ): AIPromptPayload<ReelContentPackage> {
    const winningHooks = dna.winningHooks?.topHooks?.map((h) => `- ${h.hookType} (Virality: ${h.avgVirality})`).join("\n") || "None";
    const topFormats = dna.winningStructure?.formulaString || "Standard short-form structure";

    const systemPrompt = `You are ReelForge AI, an expert short-form video director, scriptwriter, and viral content strategist.
Your task is to generate a complete, production-ready 9-section Instagram Reel Content Package based on the creator's Content DNA.
You must return ONLY valid JSON matching the required schema description, without any markdown formatting, backticks, or explanatory text.`;

    const userPrompt = `Create a viral 9-section Instagram Reel Content Package tailored to this creator's Content DNA:

Creator Username: @${dna.id}
Overall DNA Score: ${dna.snapshot?.overallDNAScore || 0}/100
Dominant Hook Style: ${dna.snapshot?.dominantHook || "General"}
Dominant Psychology: ${dna.snapshot?.dominantPsychology || "Curiosity"}

Winning Hooks:
${winningHooks}

Top Performing Formats:
${topFormats}

Generate a complete, highly engaging Reel package in strict JSON format.`;

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
    };
  }
}
