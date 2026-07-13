import type { InstagramProfile } from "@/types/instagram";
import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { ContentDNAReport } from "@/types/content-dna";
import type { ReelContentPackage } from "@/types/script-generation";
import type { Competitor } from "@/types/competitor";
import type { CompetitorProfileAnalysis } from "@/types/competitor-analysis";
import type { CollectedContentItem } from "@/types/content-collection";
import type { ContentIntelligenceReport } from "@/types/content-intelligence";
import type { RepurposeReport } from "@/types/repurpose";
import type { AITelemetry } from "./provider.interface";
import { PromptBuilder } from "./prompt.builder";
import { getAIOrchestrator } from "./providers";
import { DevPromptLogger } from "./logger/dev-prompt.logger";

/**
 * AI Service Layer — ReelForge AI v2.1 Phase 8.
 *
 * Central domain orchestration service coordinating between API routes, PromptBuilder,
 * AIOrchestrator, and deterministic fallback engines.
 *
 * Per Phase 8 scope, this layer integrates real AI execution with:
 *   1. Real Gemini Integration & Failover routing
 *   2. Real Prompt Execution (feeding compiled prompts + schema descriptions)
 *   3. Output Validation & Response Normalization via ResponseNormalizer
 *   4. Development Prompt Logging (compiled prompt, score, response, latency, tokens)
 */
export class AIService {
  /**
   * Orchestrates multi-model AI generation for Brand Intelligence.
   *
   * Lifecycle:
   *   1. Receives InstagramProfile and baseline Deterministic Fallback report
   *   2. Invokes PromptBuilder to construct provider-independent AIPromptPayload (with compiledResult)
   *   3. Delegates to AIOrchestrator (Gemini -> OpenAI -> Claude -> Fallback)
   *   4. Logs structured telemetry (tokens, latency, estimated cost) and dev prompt logs
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

      // Phase 8: Development Prompt Logging
      DevPromptLogger.log({
        domain: "Brand Intelligence",
        providerId: response.telemetry.providerId,
        model: response.telemetry.modelUsed,
        compiledPrompt: `${promptPayload.systemPrompt}\n\n${promptPayload.userPrompt}`,
        aiResponse: response.data,
        promptScore: promptPayload.compiledResult?.evaluation?.overallScore,
        evaluationReport: promptPayload.compiledResult?.evaluation,
        latencyMs: response.telemetry.latencyMs,
        tokenUsage: response.telemetry.usage,
      });

      return { data: response.data, telemetry: response.telemetry };
    } catch (error) {
      console.error("[AIService] Critical error in generateBrandIntelligence orchestration. Reverting to fallback:", error);
      const telemetry: AITelemetry = {
        providerId: "deterministic",
        modelUsed: "deterministic-fallback",
        latencyMs: 0,
        fallbackUsed: true,
      };

      DevPromptLogger.log({
        domain: "Brand Intelligence",
        providerId: "deterministic",
        model: "deterministic-fallback",
        compiledPrompt: `${promptPayload.systemPrompt}\n\n${promptPayload.userPrompt}`,
        aiResponse: fallbackData,
        promptScore: promptPayload.compiledResult?.evaluation?.overallScore,
        evaluationReport: promptPayload.compiledResult?.evaluation,
        latencyMs: 0,
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      });

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

      // Phase 8: Development Prompt Logging
      DevPromptLogger.log({
        domain: "Script Generation",
        providerId: response.telemetry.providerId,
        model: response.telemetry.modelUsed,
        compiledPrompt: `${promptPayload.systemPrompt}\n\n${promptPayload.userPrompt}`,
        aiResponse: response.data,
        promptScore: promptPayload.compiledResult?.evaluation?.overallScore,
        evaluationReport: promptPayload.compiledResult?.evaluation,
        latencyMs: response.telemetry.latencyMs,
        tokenUsage: response.telemetry.usage,
      });

      return { data: response.data, telemetry: response.telemetry };
    } catch (error) {
      console.error("[AIService] Critical error in generateScriptPackage orchestration. Reverting to fallback:", error);
      const telemetry: AITelemetry = {
        providerId: "deterministic",
        modelUsed: "deterministic-fallback",
        latencyMs: 0,
        fallbackUsed: true,
      };

      DevPromptLogger.log({
        domain: "Script Generation",
        providerId: "deterministic",
        model: "deterministic-fallback",
        compiledPrompt: `${promptPayload.systemPrompt}\n\n${promptPayload.userPrompt}`,
        aiResponse: fallbackData,
        promptScore: promptPayload.compiledResult?.evaluation?.overallScore,
        evaluationReport: promptPayload.compiledResult?.evaluation,
        latencyMs: 0,
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      });

      return { data: fallbackData, telemetry };
    }
  }

  /**
   * Orchestrates Competitor Profile Analysis using PromptBuilder and AIOrchestrator.
   */
  async generateCompetitorAnalysis(
    competitor: Competitor,
    fallbackData: CompetitorProfileAnalysis,
    preferredProvider?: string,
    modelPreference?: string
  ): Promise<{ data: CompetitorProfileAnalysis; telemetry: AITelemetry }> {
    const promptPayload = PromptBuilder.buildCompetitorAnalysisPrompt(competitor, fallbackData);
    const orchestrator = getAIOrchestrator(preferredProvider, modelPreference);

    try {
      const response = await orchestrator.generateStructured<CompetitorProfileAnalysis>(promptPayload);

      DevPromptLogger.log({
        domain: "Competitor Analysis",
        providerId: response.telemetry.providerId,
        model: response.telemetry.modelUsed,
        compiledPrompt: `${promptPayload.systemPrompt}\n\n${promptPayload.userPrompt}`,
        aiResponse: response.data,
        promptScore: promptPayload.compiledResult?.evaluation?.overallScore,
        evaluationReport: promptPayload.compiledResult?.evaluation,
        latencyMs: response.telemetry.latencyMs,
        tokenUsage: response.telemetry.usage,
      });

      this.logTelemetry("Competitor Analysis", response.telemetry);
      return response;
    } catch (error) {
      console.error("[AIService] Error in generateCompetitorAnalysis orchestration. Reverting to fallback:", error);
      const telemetry: AITelemetry = {
        providerId: "deterministic",
        modelUsed: "deterministic-fallback",
        latencyMs: 0,
        fallbackUsed: true,
      };

      DevPromptLogger.log({
        domain: "Competitor Analysis",
        providerId: "deterministic",
        model: "deterministic-fallback",
        compiledPrompt: `${promptPayload.systemPrompt}\n\n${promptPayload.userPrompt}`,
        aiResponse: fallbackData,
        promptScore: promptPayload.compiledResult?.evaluation?.overallScore,
        evaluationReport: promptPayload.compiledResult?.evaluation,
        latencyMs: 0,
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      });

      return { data: fallbackData, telemetry };
    }
  }

  /**
   * Orchestrates Content Intelligence Report generation using PromptBuilder and AIOrchestrator.
   */
  async generateContentIntelligence(
    items: CollectedContentItem[],
    fallbackData: ContentIntelligenceReport[],
    preferredProvider?: string,
    modelPreference?: string
  ): Promise<{ data: ContentIntelligenceReport[]; telemetry: AITelemetry }> {
    const promptPayload = PromptBuilder.buildContentIntelligencePrompt(items, fallbackData);
    const orchestrator = getAIOrchestrator(preferredProvider, modelPreference);

    try {
      const response = await orchestrator.generateStructured<ContentIntelligenceReport[]>(promptPayload);

      DevPromptLogger.log({
        domain: "Content Intelligence",
        providerId: response.telemetry.providerId,
        model: response.telemetry.modelUsed,
        compiledPrompt: `${promptPayload.systemPrompt}\n\n${promptPayload.userPrompt}`,
        aiResponse: response.data,
        promptScore: promptPayload.compiledResult?.evaluation?.overallScore,
        evaluationReport: promptPayload.compiledResult?.evaluation,
        latencyMs: response.telemetry.latencyMs,
        tokenUsage: response.telemetry.usage,
      });

      this.logTelemetry("Content Intelligence", response.telemetry);
      return response;
    } catch (error) {
      console.error("[AIService] Error in generateContentIntelligence orchestration. Reverting to fallback:", error);
      const telemetry: AITelemetry = {
        providerId: "deterministic",
        modelUsed: "deterministic-fallback",
        latencyMs: 0,
        fallbackUsed: true,
      };

      DevPromptLogger.log({
        domain: "Content Intelligence",
        providerId: "deterministic",
        model: "deterministic-fallback",
        compiledPrompt: `${promptPayload.systemPrompt}\n\n${promptPayload.userPrompt}`,
        aiResponse: fallbackData,
        promptScore: promptPayload.compiledResult?.evaluation?.overallScore,
        evaluationReport: promptPayload.compiledResult?.evaluation,
        latencyMs: 0,
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      });

      return { data: fallbackData, telemetry };
    }
  }

  /**
   * Orchestrates Content DNA blueprint synthesis using PromptBuilder and AIOrchestrator.
   */
  async generateContentDNA(
    reports: ContentIntelligenceReport[],
    fallbackData: ContentDNAReport,
    preferredProvider?: string,
    modelPreference?: string
  ): Promise<{ data: ContentDNAReport; telemetry: AITelemetry }> {
    const promptPayload = PromptBuilder.buildContentDNAPrompt(reports, fallbackData);
    const orchestrator = getAIOrchestrator(preferredProvider, modelPreference);

    try {
      const response = await orchestrator.generateStructured<ContentDNAReport>(promptPayload);

      DevPromptLogger.log({
        domain: "Content DNA",
        providerId: response.telemetry.providerId,
        model: response.telemetry.modelUsed,
        compiledPrompt: `${promptPayload.systemPrompt}\n\n${promptPayload.userPrompt}`,
        aiResponse: response.data,
        promptScore: promptPayload.compiledResult?.evaluation?.overallScore,
        evaluationReport: promptPayload.compiledResult?.evaluation,
        latencyMs: response.telemetry.latencyMs,
        tokenUsage: response.telemetry.usage,
      });

      this.logTelemetry("Content DNA", response.telemetry);
      return response;
    } catch (error) {
      console.error("[AIService] Error in generateContentDNA orchestration. Reverting to fallback:", error);
      const telemetry: AITelemetry = {
        providerId: "deterministic",
        modelUsed: "deterministic-fallback",
        latencyMs: 0,
        fallbackUsed: true,
      };

      DevPromptLogger.log({
        domain: "Content DNA",
        providerId: "deterministic",
        model: "deterministic-fallback",
        compiledPrompt: `${promptPayload.systemPrompt}\n\n${promptPayload.userPrompt}`,
        aiResponse: fallbackData,
        promptScore: promptPayload.compiledResult?.evaluation?.overallScore,
        evaluationReport: promptPayload.compiledResult?.evaluation,
        latencyMs: 0,
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      });

      return { data: fallbackData, telemetry };
    }
  }

  /**
   * Orchestrates Omnichannel Repurpose Studio adaptation using PromptBuilder and AIOrchestrator.
   */
  async generateRepurposePackage(
    pkg: ReelContentPackage,
    fallbackData: RepurposeReport,
    preferredProvider?: string,
    modelPreference?: string
  ): Promise<{ data: RepurposeReport; telemetry: AITelemetry }> {
    const promptPayload = PromptBuilder.buildRepurposePrompt(pkg, fallbackData);
    const orchestrator = getAIOrchestrator(preferredProvider, modelPreference);

    try {
      const response = await orchestrator.generateStructured<RepurposeReport>(promptPayload);

      DevPromptLogger.log({
        domain: "Repurpose Studio",
        providerId: response.telemetry.providerId,
        model: response.telemetry.modelUsed,
        compiledPrompt: `${promptPayload.systemPrompt}\n\n${promptPayload.userPrompt}`,
        aiResponse: response.data,
        promptScore: promptPayload.compiledResult?.evaluation?.overallScore,
        evaluationReport: promptPayload.compiledResult?.evaluation,
        latencyMs: response.telemetry.latencyMs,
        tokenUsage: response.telemetry.usage,
      });

      this.logTelemetry("Repurpose Studio", response.telemetry);
      return response;
    } catch (error) {
      console.error("[AIService] Error in generateRepurposePackage orchestration. Reverting to fallback:", error);
      const telemetry: AITelemetry = {
        providerId: "deterministic",
        modelUsed: "deterministic-fallback",
        latencyMs: 0,
        fallbackUsed: true,
      };

      DevPromptLogger.log({
        domain: "Repurpose Studio",
        providerId: "deterministic",
        model: "deterministic-fallback",
        compiledPrompt: `${promptPayload.systemPrompt}\n\n${promptPayload.userPrompt}`,
        aiResponse: fallbackData,
        promptScore: promptPayload.compiledResult?.evaluation?.overallScore,
        evaluationReport: promptPayload.compiledResult?.evaluation,
        latencyMs: 0,
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      });

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
