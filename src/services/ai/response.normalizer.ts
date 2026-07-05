import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { ReelContentPackage } from "@/types/script-generation";
import type { AIPromptPayload } from "./provider.interface";

/**
 * Response Normalizer Layer — ReelForge AI v2.0 Phase 5.
 *
 * Centralizes the parsing, validation, and schema normalization of raw LLM outputs.
 * Every provider (Gemini, OpenAI, Claude) routes its raw text response through this layer.
 *
 * Capabilities:
 *   1. Strips markdown fences (e.g., ```json ... ```)
 *   2. Safely parses JSON string with error resilience
 *   3. Normalizes and validates required schema fields against deterministic fallback data
 *   4. Ensures 100% type safety and structural consistency across all providers
 */
export class ResponseNormalizer {
  /**
   * Centralized routing for normalizing raw LLM text against expected domain schemas.
   */
  public static normalize<T>(rawText: string, payload: AIPromptPayload<T>): T {
    if (payload.schemaType === "brand-intelligence") {
      return this.normalizeBrandIntelligence(rawText, payload.fallbackData as unknown as BrandIntelligenceReport) as unknown as T;
    }
    if (payload.schemaType === "script-generation") {
      return this.normalizeScriptGeneration(rawText, payload.fallbackData as unknown as ReelContentPackage) as unknown as T;
    }
    return payload.fallbackData;
  }

  /**
   * Cleans raw LLM output strings, removing markdown code blocks and whitespace.
   */
  public static cleanRawOutput(rawText: string): string {
    if (!rawText) return "";
    let cleaned = rawText.trim();

    // Remove markdown code fences if present
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3);
    }

    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }

    return cleaned.trim();
  }

  /**
   * Normalizes raw LLM output into a BrandIntelligenceReport.
   * If parsing fails or fields are missing, merges with fallbackData to guarantee zero breakage.
   */
  public static normalizeBrandIntelligence(
    rawText: string,
    fallbackData: BrandIntelligenceReport
  ): BrandIntelligenceReport {
    try {
      const cleaned = this.cleanRawOutput(rawText);
      const parsed = JSON.parse(cleaned);

      return {
        industry: parsed.industry || fallbackData.industry,
        subIndustry: parsed.subIndustry || fallbackData.subIndustry,
        brandType: parsed.brandType || fallbackData.brandType,
        targetAudience: parsed.targetAudience || fallbackData.targetAudience,
        estimatedAudienceAge: parsed.estimatedAudienceAge || fallbackData.estimatedAudienceAge,
        brandTone: parsed.brandTone || fallbackData.brandTone,
        contentStyle: parsed.contentStyle || fallbackData.contentStyle,
        primaryContentPillars: Array.isArray(parsed.primaryContentPillars) && parsed.primaryContentPillars.length > 0
          ? parsed.primaryContentPillars
          : fallbackData.primaryContentPillars,
        postingFrequency: parsed.postingFrequency || fallbackData.postingFrequency,
        estimatedMarketPosition: parsed.estimatedMarketPosition || fallbackData.estimatedMarketPosition,
        confidenceScore: typeof parsed.confidenceScore === "number" ? parsed.confidenceScore : fallbackData.confidenceScore,
      };
    } catch (error) {
      console.warn("[ResponseNormalizer] Failed to parse BrandIntelligence JSON, reverting to fallback:", error);
      return fallbackData;
    }
  }

  /**
   * Normalizes raw LLM output into a ReelContentPackage.
   * If parsing fails or fields are missing, merges with fallbackData.
   */
  public static normalizeScriptGeneration(
    rawText: string,
    fallbackData: ReelContentPackage
  ): ReelContentPackage {
    try {
      const cleaned = this.cleanRawOutput(rawText);
      const parsed = JSON.parse(cleaned);

      return {
        id: parsed.id || fallbackData.id || crypto.randomUUID(),
        createdAt: parsed.createdAt || fallbackData.createdAt || new Date().toISOString(),
        strategy: parsed.strategy || fallbackData.strategy,
        reelIdea: parsed.reelIdea || fallbackData.reelIdea,
        hook: parsed.hook || fallbackData.hook,
        scenes: Array.isArray(parsed.scenes) && parsed.scenes.length > 0 ? parsed.scenes : fallbackData.scenes,
        caption: parsed.caption || fallbackData.caption,
        cta: parsed.cta || fallbackData.cta,
        hashtags: parsed.hashtags || fallbackData.hashtags,
        postingRecommendation: parsed.postingRecommendation || fallbackData.postingRecommendation,
        checklist: parsed.checklist || fallbackData.checklist,
        productionSummary: parsed.productionSummary || fallbackData.productionSummary,
        productionScore: parsed.productionScore || fallbackData.productionScore,
      };
    } catch (error) {
      console.warn("[ResponseNormalizer] Failed to parse ScriptGeneration JSON, reverting to fallback:", error);
      return fallbackData;
    }
  }
}
