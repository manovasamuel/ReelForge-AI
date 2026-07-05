import type { InstagramProfile } from "@/types/instagram";
import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { ContentDNAReport } from "@/types/content-dna";
import type { ReelContentPackage } from "@/types/script-generation";
import type { AITelemetry } from "./provider.interface";
import { PromptBuilder } from "./prompt.builder";
import { getAIOrchestrator } from "./providers";

/**
 * AI Service Layer — ReelForge AI v2.0 Phase 5.
 *
 * Central domain orchestration service coordinating between API routes, PromptBuilder,
 * AIOrchestrator, and deterministic fallback engines.
 *
 * Per Phase 5 refined scope (Requirement 7), this layer is integrated ONLY into:
 *   1. Brand Intelligence (`generateBrandIntelligence`)
 *   2. Script Generation (`generateScriptPackage`)
 */
export class AIService {
  /**
   * Orchestrates multi-model AI generation for Brand Intelligence.
   *
   * Lifecycle:
   *   1. Receives InstagramProfile and baseline Deterministic Fallback report
   *   2. Invokes PromptBuilder to construct provider-independent AIPromptPayload
   *   3. Delegates to AIOrchestrator (Gemini -> OpenAI -> Claude -> Fallback)
   *   4. Logs structured telemetry (tokens, latency, estimated cost)
   *   5. Returns type-safe BrandIntelligenceReport
   */
  public async generateBrandIntelligence(
    profile: InstagramProfile,
    fallbackData: BrandIntelligenceReport,
    preferredProvider?: string,
    modelPreference?: string
  ): Promise<{ data: BrandIntelligenceReport; telemetry: AITelemetry }> {
    const promptPayload = PromptBuilder.buildBrandIntelligencePrompt(profile, fallbackData);
    const orchestrator = getAIOrchestrator(preferredProvider, modelPreference);

    try {
      const response = await orchestrator.generateStructured<BrandIntelligenceReport>(promptPayload);
      this.logTelemetry("Brand Intelligence", response.telemetry);
      return { data: response.data, telemetry: response.telemetry };
    } catch (error) {
      console.error("[AIService] Critical error in generateBrandIntelligence orchestration. Reverting to fallback:", error);
      const telemetry: AITelemetry = {
        providerId: "deterministic",
        modelUsed: "deterministic-fallback",
        latencyMs: 0,
        fallbackUsed: true,
      };
      return { data: fallbackData, telemetry };
    }
  }

  /**
   * Orchestrates multi-model AI generation for 9-section Studio Script Generation.
   */
  public async generateScriptPackage(
    dna: ContentDNAReport,
    fallbackData: ReelContentPackage,
    preferredProvider?: string,
    modelPreference?: string
  ): Promise<{ data: ReelContentPackage; telemetry: AITelemetry }> {
    const promptPayload = PromptBuilder.buildScriptGenerationPrompt(dna, fallbackData);
    const orchestrator = getAIOrchestrator(preferredProvider, modelPreference);

    try {
      const response = await orchestrator.generateStructured<ReelContentPackage>(promptPayload);
      this.logTelemetry("Script Generation", response.telemetry);
      return { data: response.data, telemetry: response.telemetry };
    } catch (error) {
      console.error("[AIService] Critical error in generateScriptPackage orchestration. Reverting to fallback:", error);
      const telemetry: AITelemetry = {
        providerId: "deterministic",
        modelUsed: "deterministic-fallback",
        latencyMs: 0,
        fallbackUsed: true,
      };
      return { data: fallbackData, telemetry };
    }
  }

  /**
   * Structured logging for AI telemetry, token consumption, and cost estimation.
   */
  private logTelemetry(domain: string, telemetry: AITelemetry): void {
    console.info(
      `[AIService Telemetry] Domain: [${domain}] | Provider: [${telemetry.providerId}] | Model: [${telemetry.modelUsed}] | Latency: ${telemetry.latencyMs}ms | Tokens: ${telemetry.usage?.totalTokens || 0} (Prompt: ${telemetry.usage?.promptTokens || 0}, Comp: ${telemetry.usage?.completionTokens || 0}) | Est. Cost: $${telemetry.costEstimateUsd || 0} | Fallback Used: ${telemetry.fallbackUsed}`
    );
  }
}
