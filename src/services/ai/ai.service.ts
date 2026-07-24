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
import type { AITelemetry, ImagePayload } from "./provider.interface";
import { PromptBuilder } from "./prompt.builder";
import { getAIOrchestrator } from "./providers";
import { DevPromptLogger } from "./logger/dev-prompt.logger";
import { AICacheService } from "./ai-cache.service";
import { getAdaptiveConfig } from "@/config/adaptive.config";
import { getHeuristicEvaluator } from "./adaptive/evaluator.registry";
import { CircuitBreakerStore } from "@/lib/reliability/circuit-breaker";

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
   * Orchestrates vision intelligence to extract rich metadata from visual assets.
   */
  public async analyzeVisionAsset(
    image: ImagePayload,
    fallbackData: VisionResult,
    preferredProvider?: string,
    modelPreference?: string
  ): Promise<{ data: VisionResult; telemetry: AITelemetry }> {
    const promptPayload = PromptBuilder.buildVisionAnalysisPrompt(image, fallbackData);
    const orchestrator = getAIOrchestrator(preferredProvider, modelPreference);

    try {
      const response = await orchestrator.generateStructured<VisionResult>(promptPayload);
      this.logTelemetry("Vision Analysis", response.telemetry);

      DevPromptLogger.log({
        domain: "Vision Analysis",
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
      console.error("[AIService] Critical error in analyzeVisionAsset orchestration. Reverting to fallback:", error);
      const telemetry: AITelemetry = {
        telemetryVersion: 1,
        timestamp: new Date().toISOString(),
        providerId: "deterministic",
        modelUsed: "deterministic-fallback",
        latencyMs: 0,
        fallbackUsed: true,
      };

      DevPromptLogger.log({
        domain: "Vision Analysis",
        providerId: "deterministic",
        model: "deterministic-fallback",
        compiledPrompt: `${promptPayload.systemPrompt}\n\n${promptPayload.userPrompt}`,
        aiResponse: fallbackData,
        latencyMs: 0,
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      });

      return { data: fallbackData, telemetry };
    }
  }

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
    // 1. Check AI Intelligence Cache
    const cached = await AICacheService.get<BrandIntelligenceReport>("brand-intelligence", profile.username);
    if (cached) {
      const telemetry: AITelemetry = {
        telemetryVersion: 1,
        timestamp: new Date().toISOString(),
        providerId: "ai-cache",
        modelUsed: "cached-report",
        latencyMs: 0,
      };
      this.logTelemetry("Brand Intelligence", telemetry);
      return { data: cached, telemetry };
    }

    const promptPayload = PromptBuilder.buildBrandIntelligencePrompt(profile, fallbackData);
    const orchestrator = getAIOrchestrator(preferredProvider, modelPreference);

    try {
      const response = await orchestrator.generateStructured<BrandIntelligenceReport>(promptPayload);
      this.logTelemetry("Brand Intelligence", response.telemetry);

      await AICacheService.set("brand-intelligence", profile.username, response.data);

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
        telemetryVersion: 1,
        timestamp: new Date().toISOString(),
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

      // Phase 2 & 3: Adaptive Intelligence Observation and Revision Mode
      const config = getAdaptiveConfig();
      const domainConfig = config.domains["script-generation"];
      const evaluator = getHeuristicEvaluator("script-generation");

      if ((config.mode === "observe" || config.mode === "adaptive") && evaluator && domainConfig) {
        const evaluation = evaluator.evaluate(response.data);
        
        response.telemetry.baseHeuristicScore = evaluation.score;
        response.telemetry.finalHeuristicScore = evaluation.score;
        response.telemetry.failedRules = evaluation.failedRules;
        response.telemetry.adaptiveRevisionsCount = 0;
        response.telemetry.revisionAttempted = false;
        response.telemetry.revisionSucceeded = false;
        
        // Phase 3: Adaptive Revision
        if (config.mode === "adaptive" && evaluation.score < domainConfig.acceptanceThreshold && config.maxRevisions > 0) {
          response.telemetry.revisionAttempted = true;
          const startTime = Date.now();
          
          try {
            const revisionPrompt = PromptBuilder.buildAdaptiveRevisionPrompt(
              promptPayload,
              response.data,
              evaluation.failedRules
            );
            
            // Execute bounded single-revision call
            const revisionResponse = await orchestrator.generateStructured<ReelContentPackage>(revisionPrompt);
            const revisionEvaluation = evaluator.evaluate(revisionResponse.data);
            
            response.telemetry.revisionLatencyMs = Date.now() - startTime;
            
            const improvement = revisionEvaluation.score - evaluation.score;
            
            // Only accept revision if the score strictly improved by the configured threshold
            if (improvement >= config.minimumImprovementScore) {
              response.data = revisionResponse.data;
              response.telemetry.finalHeuristicScore = revisionEvaluation.score;
              response.telemetry.failedRules = revisionEvaluation.failedRules;
              response.telemetry.adaptiveRevisionsCount = 1;
              response.telemetry.revisionSucceeded = true;
              response.telemetry.scoreImprovement = improvement;
              response.telemetry.revisionRejectedReason = "ACCEPTED";
              
              // Accumulate tokens for accurate quota guard tracking
              if (response.telemetry.usage && revisionResponse.telemetry.usage) {
                response.telemetry.usage.promptTokens += revisionResponse.telemetry.usage.promptTokens;
                response.telemetry.usage.completionTokens += revisionResponse.telemetry.usage.completionTokens;
                response.telemetry.usage.totalTokens += revisionResponse.telemetry.usage.totalTokens;
              }
              if (response.telemetry.costEstimateUsd && revisionResponse.telemetry.costEstimateUsd) {
                response.telemetry.costEstimateUsd += revisionResponse.telemetry.costEstimateUsd;
              }
            } else {
              response.telemetry.revisionSucceeded = false;
              response.telemetry.scoreImprovement = improvement > 0 ? improvement : 0;
              response.telemetry.revisionRejectedReason = improvement > 0 ? "BELOW_THRESHOLD" : "NO_IMPROVEMENT";
            }
          } catch (revisionError) {
             // Safe Exit: If revision fails or times out, swallow error and keep original output.
             console.warn("[AIService] Adaptive revision failed. Falling back to original generation.", revisionError);
             response.telemetry.revisionSucceeded = false;
             response.telemetry.revisionLatencyMs = Date.now() - startTime;
             response.telemetry.revisionRejectedReason = "REVISION_FAILED";
          }
        }
      }

        // Phase 4: Provider Learning (EMA and Routing)
        if (config.mode === "adaptive" && response.telemetry.finalHeuristicScore !== undefined) {
          try {
            if (response.telemetry.fallbackUsed) {
              response.telemetry.learningApplied = false;
              response.telemetry.learningSkippedReason = "FALLBACK_USED";
            } else if (response.telemetry.providerId === "ai-cache") {
              response.telemetry.learningApplied = false;
              response.telemetry.learningSkippedReason = "CACHED_RESPONSE";
            } else if (response.telemetry.providerId === "deterministic" || response.telemetry.providerId === "mock") {
              response.telemetry.learningApplied = false;
              response.telemetry.learningSkippedReason = "PROVIDER_ERROR";
            } else {
              const learningResult = await CircuitBreakerStore.updateQualityScore(
                response.telemetry.providerId,
                "script-generation",
                response.telemetry.finalHeuristicScore,
                config.emaAlpha
              );
              response.telemetry.learningApplied = true;
              response.telemetry.providerQualityBefore = learningResult.before;
              response.telemetry.providerQualityAfter = learningResult.after;
              response.telemetry.qualityDelta = learningResult.after - learningResult.before;
            }
          } catch (learningError) {
             console.warn("[AIService] Provider learning failed.", learningError);
             response.telemetry.learningApplied = false;
             response.telemetry.learningSkippedReason = "PROVIDER_ERROR";
          }
        } else if (config.mode !== "adaptive") {
          response.telemetry.learningApplied = false;
          response.telemetry.learningSkippedReason = "ADAPTIVE_DISABLED";
        }

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
        telemetryVersion: 1,
        timestamp: new Date().toISOString(),
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
    const cached = await AICacheService.get<CompetitorProfileAnalysis>("competitor-analysis", competitor.username);
    if (cached) {
      const telemetry: AITelemetry = {
        telemetryVersion: 1,
        timestamp: new Date().toISOString(),
        providerId: "ai-cache",
        modelUsed: "cached-report",
        latencyMs: 0,
      };
      this.logTelemetry("Competitor Analysis", telemetry);
      return { data: cached, telemetry };
    }

    const promptPayload = PromptBuilder.buildCompetitorAnalysisPrompt(competitor, fallbackData);
    const orchestrator = getAIOrchestrator(preferredProvider, modelPreference);

    try {
      const response = await orchestrator.generateStructured<CompetitorProfileAnalysis>(promptPayload);

      await AICacheService.set("competitor-analysis", competitor.username, response.data);

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
        telemetryVersion: 1,
        timestamp: new Date().toISOString(),
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
        telemetryVersion: 1,
        timestamp: new Date().toISOString(),
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
    const cacheKey = reports.map(r => r.contentItemId || r.id).sort().join("_").slice(0, 100) || "default-dna";
    const cached = await AICacheService.get<ContentDNAReport>("content-dna", cacheKey);
    if (cached) {
      const telemetry: AITelemetry = {
        telemetryVersion: 1,
        timestamp: new Date().toISOString(),
        providerId: "ai-cache",
        modelUsed: "cached-report",
        latencyMs: 0,
      };
      this.logTelemetry("Content DNA", telemetry);
      return { data: cached, telemetry };
    }

    const promptPayload = PromptBuilder.buildContentDNAPrompt(reports, fallbackData);
    const orchestrator = getAIOrchestrator(preferredProvider, modelPreference);

    try {
      const response = await orchestrator.generateStructured<ContentDNAReport>(promptPayload);

      await AICacheService.set("content-dna", cacheKey, response.data);

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
        telemetryVersion: 1,
        timestamp: new Date().toISOString(),
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
    if (preferredProvider === "deterministic" || process.env.REPURPOSE_PROVIDER === "deterministic" || process.env.AI_PROVIDER === "deterministic") {
      const telemetry: AITelemetry = {
        telemetryVersion: 1,
        timestamp: new Date().toISOString(),
        providerId: "deterministic",
        modelUsed: "deterministic-engine",
        latencyMs: 0,
        fallbackUsed: true,
      };
      this.logTelemetry("Repurpose Studio", telemetry);
      return { data: fallbackData, telemetry };
    }

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
        telemetryVersion: 1,
        timestamp: new Date().toISOString(),
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
    const scoreStr = telemetry.finalHeuristicScore !== undefined ? ` | Score: ${telemetry.finalHeuristicScore}` : '';
    console.info(
      `[AIService Telemetry] Domain: [${domain}] | Provider: [${telemetry.providerId}] | Model: [${telemetry.modelUsed}] | Latency: ${telemetry.latencyMs}ms | Tokens: ${telemetry.usage?.totalTokens || 0} (Prompt: ${telemetry.usage?.promptTokens || 0}, Comp: ${telemetry.usage?.completionTokens || 0}) | Est. Cost: $${telemetry.costEstimateUsd || 0} | Fallback Used: ${telemetry.fallbackUsed}${scoreStr}`
    );
  }
}
