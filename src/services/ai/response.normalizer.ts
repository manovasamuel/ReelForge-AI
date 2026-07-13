import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { ReelContentPackage } from "@/types/script-generation";
import type { CompetitorProfileAnalysis } from "@/types/competitor-analysis";
import type { ContentIntelligenceReport } from "@/types/content-intelligence";
import type { ContentDNAReport } from "@/types/content-dna";
import type { RepurposeReport } from "@/types/repurpose";
import type { AIPromptPayload } from "./provider.interface";

/**
 * Response Normalizer & Validation Layer — ReelForge AI v2.1 Phase 8.
 *
 * Centralizes the validation, parsing, and schema normalization of raw LLM outputs.
 * Every provider (Gemini, OpenAI, Claude) routes its raw text response through this layer.
 *
 * Phase 8 Capabilities:
 *   1. Strict Output Validation:
 *      - Checks for empty responses
 *      - Checks for oversized responses (> 100,000 chars)
 *      - Checks for invalid JSON syntax (stripping markdown code fences first)
 *      - Checks for missing required domain schema fields
 *   2. Automatic Failover: Throws validation errors so AIOrchestrator automatically falls back
 *   3. Domain Normalization: Maps validated fields into exact ReelForge TypeScript domain models,
 *      preventing provider-specific response formats from leaking into the application.
 */
export class ResponseNormalizer {
  /**
   * Centralized routing for validating and normalizing raw LLM text against expected domain schemas.
   * Throws an error if validation fails, triggering automatic orchestrator failover.
   */
  public static normalize<T>(rawText: string, payload: AIPromptPayload<T>): T {
    // 1. Check for empty response
    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
      throw new Error("AI response validation failed: Response is empty or null.");
    }

    // 2. Check for oversized response
    if (rawText.length > 100_000) {
      throw new Error(`AI response validation failed: Response is oversized (${rawText.length} chars > 100,000 limit).`);
    }

    // 3. Clean markdown fences and check valid JSON
    const cleaned = this.cleanRawOutput(rawText);
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err: any) {
      throw new Error(`AI response validation failed: Invalid JSON syntax (${err.message}).`);
    }

    if (!parsed || typeof parsed !== "object") {
      throw new Error("AI response validation failed: Parsed JSON is not a valid object or array.");
    }

    // 4. Validate required fields & Normalize into domain models
    if (payload.schemaType === "brand-intelligence") {
      this.validateBrandIntelligenceFields(parsed);
      return this.normalizeBrandIntelligence(parsed, payload.fallbackData as unknown as BrandIntelligenceReport) as unknown as T;
    }

    if (payload.schemaType === "script-generation") {
      this.validateScriptGenerationFields(parsed);
      return this.normalizeScriptGeneration(parsed, payload.fallbackData as unknown as ReelContentPackage) as unknown as T;
    }

    if (payload.schemaType === "competitor-analysis") {
      return this.normalizeCompetitorAnalysis(parsed, payload.fallbackData as unknown as CompetitorProfileAnalysis) as unknown as T;
    }

    if (payload.schemaType === "content-intelligence") {
      return this.normalizeContentIntelligence(parsed, payload.fallbackData as unknown as ContentIntelligenceReport[]) as unknown as T;
    }

    if (payload.schemaType === "content-dna") {
      return this.normalizeContentDNA(parsed, payload.fallbackData as unknown as ContentDNAReport) as unknown as T;
    }

    if (payload.schemaType === "repurpose") {
      return this.normalizeRepurpose(parsed, payload.fallbackData as unknown as RepurposeReport) as unknown as T;
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
   * Validates required fields for Brand Intelligence report.
   */
  private static validateBrandIntelligenceFields(parsed: any): void {
    const missing: string[] = [];
    if (!parsed.industry) missing.push("industry");
    if (!parsed.brandType) missing.push("brandType");
    if (!parsed.targetAudience) missing.push("targetAudience");
    if (!parsed.brandTone) missing.push("brandTone");
    if (!Array.isArray(parsed.primaryContentPillars) || parsed.primaryContentPillars.length === 0) {
      missing.push("primaryContentPillars");
    }

    if (missing.length > 0) {
      throw new Error(`AI response validation failed: Missing required fields for Brand Intelligence (${missing.join(", ")}).`);
    }
  }

  /**
   * Validates required fields for Script Generation package.
   */
  private static validateScriptGenerationFields(parsed: any): void {
    const missing: string[] = [];
    if (!parsed.reelIdea || typeof parsed.reelIdea !== "object" || !parsed.reelIdea.title) missing.push("reelIdea.title");
    if (!parsed.hook || typeof parsed.hook !== "object" || !parsed.hook.firstSentence) missing.push("hook.firstSentence");
    if (!Array.isArray(parsed.scenes) || parsed.scenes.length === 0) missing.push("scenes");
    if (!parsed.caption || typeof parsed.caption !== "object") missing.push("caption");
    if (!parsed.cta || typeof parsed.cta !== "object") missing.push("cta");

    if (missing.length > 0) {
      throw new Error(`AI response validation failed: Missing required fields for Script Generation (${missing.join(", ")}).`);
    }
  }

  /**
   * Normalizes validated JSON object or string into a BrandIntelligenceReport domain model.
   * Ensures optional fields get clean defaults from fallbackData and zero provider quirks leak through.
   */
  public static normalizeBrandIntelligence(
    input: string | any,
    fallbackData: BrandIntelligenceReport
  ): BrandIntelligenceReport {
    try {
      const parsed = typeof input === "string" ? JSON.parse(this.cleanRawOutput(input)) : input;
      return {
        industry: parsed?.industry || fallbackData.industry,
        subIndustry: parsed?.subIndustry || fallbackData.subIndustry,
        brandType: (parsed?.brandType || fallbackData.brandType) as BrandIntelligenceReport["brandType"],
        targetAudience: parsed?.targetAudience || fallbackData.targetAudience,
        estimatedAudienceAge: parsed?.estimatedAudienceAge || fallbackData.estimatedAudienceAge,
        brandTone: parsed?.brandTone || fallbackData.brandTone,
        contentStyle: parsed?.contentStyle || fallbackData.contentStyle,
        primaryContentPillars: Array.isArray(parsed?.primaryContentPillars) && parsed.primaryContentPillars.length > 0
          ? parsed.primaryContentPillars
          : fallbackData.primaryContentPillars,
        postingFrequency: parsed?.postingFrequency || fallbackData.postingFrequency,
        estimatedMarketPosition: (parsed?.estimatedMarketPosition || fallbackData.estimatedMarketPosition) as BrandIntelligenceReport["estimatedMarketPosition"],
        confidenceScore: typeof parsed?.confidenceScore === "number" ? parsed.confidenceScore : fallbackData.confidenceScore,
      };
    } catch (error) {
      console.warn("[ResponseNormalizer] Fallback parsing in normalizeBrandIntelligence:", error);
      return fallbackData;
    }
  }

  /**
   * Normalizes validated JSON object or string into a ReelContentPackage domain model.
   * Ensures optional fields get clean defaults from fallbackData.
   */
  public static normalizeScriptGeneration(
    input: string | any,
    fallbackData: ReelContentPackage
  ): ReelContentPackage {
    try {
      const parsed = typeof input === "string" ? JSON.parse(this.cleanRawOutput(input)) : input;
      return {
        id: String(parsed?.id || fallbackData.id || crypto.randomUUID()),
        createdAt: String(parsed?.createdAt || fallbackData.createdAt || new Date().toISOString()),
        strategy: parsed?.strategy || fallbackData.strategy,
        reelIdea: parsed?.reelIdea || fallbackData.reelIdea,
        hook: parsed?.hook || fallbackData.hook,
        scenes: Array.isArray(parsed?.scenes) && parsed.scenes.length > 0 ? parsed.scenes : fallbackData.scenes,
        caption: parsed?.caption || fallbackData.caption,
        cta: parsed?.cta || fallbackData.cta,
        hashtags: parsed?.hashtags || fallbackData.hashtags,
        postingRecommendation: parsed?.postingRecommendation || fallbackData.postingRecommendation,
        checklist: parsed?.checklist || fallbackData.checklist,
        productionSummary: parsed?.productionSummary || fallbackData.productionSummary,
        productionScore: parsed?.productionScore || fallbackData.productionScore,
      };
    } catch (error) {
      console.warn("[ResponseNormalizer] Fallback parsing in normalizeScriptGeneration:", error);
      return fallbackData;
    }
  }

  /**
   * Normalizes validated JSON object or string into a CompetitorProfileAnalysis domain model.
   */
  public static normalizeCompetitorAnalysis(
    input: string | any,
    fallbackData: CompetitorProfileAnalysis
  ): CompetitorProfileAnalysis {
    try {
      const parsed = typeof input === "string" ? JSON.parse(this.cleanRawOutput(input)) : input;
      return {
        id: String(parsed?.id || fallbackData.id || crypto.randomUUID()),
        competitorId: String(parsed?.competitorId || fallbackData.competitorId || ""),
        username: String(parsed?.username || fallbackData.username || ""),
        analyzedAt: String(parsed?.analyzedAt || fallbackData.analyzedAt || new Date().toISOString()),
        businessSummary: parsed?.businessSummary || fallbackData.businessSummary,
        accountOverview: parsed?.accountOverview || fallbackData.accountOverview,
        performanceMetrics: parsed?.performanceMetrics || fallbackData.performanceMetrics,
        brandPosition: parsed?.brandPosition || fallbackData.brandPosition,
        contentPillars: Array.isArray(parsed?.contentPillars) && parsed.contentPillars.length > 0 ? parsed.contentPillars : fallbackData.contentPillars,
        captionAnalysis: parsed?.captionAnalysis || fallbackData.captionAnalysis,
        audiencePsychology: parsed?.audiencePsychology || fallbackData.audiencePsychology,
        strengths: Array.isArray(parsed?.strengths) && parsed.strengths.length > 0 ? parsed.strengths : fallbackData.strengths,
        weaknesses: Array.isArray(parsed?.weaknesses) && parsed.weaknesses.length > 0 ? parsed.weaknesses : fallbackData.weaknesses,
        recommendations: Array.isArray(parsed?.recommendations) && parsed.recommendations.length > 0 ? parsed.recommendations : fallbackData.recommendations,
        overallIntelligenceScore: parsed?.overallIntelligenceScore || fallbackData.overallIntelligenceScore,
      };
    } catch (error) {
      console.warn("[ResponseNormalizer] Fallback parsing in normalizeCompetitorAnalysis:", error);
      return fallbackData;
    }
  }

  /**
   * Normalizes validated JSON object or string into a ContentIntelligenceReport[] domain model.
   */
  public static normalizeContentIntelligence(
    input: string | any,
    fallbackData: ContentIntelligenceReport[]
  ): ContentIntelligenceReport[] {
    try {
      const parsed = typeof input === "string" ? JSON.parse(this.cleanRawOutput(input)) : input;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any, idx: number) => ({
          ...fallbackData[idx % fallbackData.length],
          ...item,
        }));
      }
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.reports) && parsed.reports.length > 0) {
        return parsed.reports.map((item: any, idx: number) => ({
          ...fallbackData[idx % fallbackData.length],
          ...item,
        }));
      }
      return fallbackData;
    } catch (error) {
      console.warn("[ResponseNormalizer] Fallback parsing in normalizeContentIntelligence:", error);
      return fallbackData;
    }
  }

  /**
   * Normalizes validated JSON object or string into a ContentDNAReport domain model.
   */
  public static normalizeContentDNA(
    input: string | any,
    fallbackData: ContentDNAReport
  ): ContentDNAReport {
    try {
      const parsed = typeof input === "string" ? JSON.parse(this.cleanRawOutput(input)) : input;
      return {
        id: String(parsed?.id || fallbackData.id || `dna-${Date.now()}`),
        snapshot: parsed?.snapshot || fallbackData.snapshot,
        winningHooks: parsed?.winningHooks || fallbackData.winningHooks,
        winningCTA: parsed?.winningCTA || fallbackData.winningCTA,
        winningCaptionStyle: parsed?.winningCaptionStyle || fallbackData.winningCaptionStyle,
        winningEditingStyle: parsed?.winningEditingStyle || fallbackData.winningEditingStyle,
        winningPsychology: parsed?.winningPsychology || fallbackData.winningPsychology,
        winningVisualStyle: parsed?.winningVisualStyle || fallbackData.winningVisualStyle,
        winningStructure: parsed?.winningStructure || fallbackData.winningStructure,
        avoidPatterns: parsed?.avoidPatterns || fallbackData.avoidPatterns,
        blueprintExport: parsed?.blueprintExport || fallbackData.blueprintExport,
        dnaInsights: Array.isArray(parsed?.dnaInsights) && parsed.dnaInsights.length > 0 ? parsed.dnaInsights : fallbackData.dnaInsights,
        dnaScore: parsed?.dnaScore || fallbackData.dnaScore,
      };
    } catch (error) {
      console.warn("[ResponseNormalizer] Fallback parsing in normalizeContentDNA:", error);
      return fallbackData;
    }
  }

  /**
   * Normalizes validated JSON object or string into a RepurposeReport domain model.
   */
  public static normalizeRepurpose(
    input: string | any,
    fallbackData: RepurposeReport
  ): RepurposeReport {
    try {
      const parsed = typeof input === "string" ? JSON.parse(this.cleanRawOutput(input)) : input;
      return {
        id: String(parsed?.id || fallbackData.id || `repurpose-${Date.now()}`),
        createdAt: String(parsed?.createdAt || fallbackData.createdAt || new Date().toISOString()),
        sourcePackageId: String(parsed?.sourcePackageId || fallbackData.sourcePackageId || ""),
        instagram: parsed?.instagram || fallbackData.instagram,
        linkedIn: parsed?.linkedIn || fallbackData.linkedIn,
        x: parsed?.x || fallbackData.x,
        threads: parsed?.threads || fallbackData.threads,
        facebook: parsed?.facebook || fallbackData.facebook,
        youtubeShorts: parsed?.youtubeShorts || fallbackData.youtubeShorts,
      };
    } catch (error) {
      console.warn("[ResponseNormalizer] Fallback parsing in normalizeRepurpose:", error);
      return fallbackData;
    }
  }
}
