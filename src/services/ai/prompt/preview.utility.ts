import type { PromptModuleSelection } from "../prompt.builder";
import type { PromptValidationResult } from "./validation.engine";
import type { CompiledPromptResult } from "./compiler";
import { PromptVariableResolver } from "./variable.resolver";
import type { PromptEvaluationReport } from "./evaluation.engine";
import type { PromptOptimizationResult } from "./optimization.engine";
import type { PromptMetricsReport } from "./metrics.engine";

export interface PromptPreviewPayload {
  timestamp: string;
  environment: string;
  score?: number;
  selection: PromptModuleSelection;
  loadedModules: { id: string; name: string; category: string; version: string }[];
  variablesProvided: string[];
  validation: PromptValidationResult;
  evaluation?: PromptEvaluationReport;
  optimization?: PromptOptimizationResult;
  metrics?: PromptMetricsReport;
  compiledPrompt: string;
  sections: { category: string; id: string; name: string; compiledText: string }[];
}

/**
 * Prompt Preview Utility — ReelForge AI v2.1 Phase 7.3 & 7.4.
 *
 * Development and debugging utility that allows engineers to inspect
 * fully compiled prompt payloads, section breakdowns, variable resolutions,
 * validation reports, quality scores, evaluation reports, and optimization summaries
 * before sending them to AI providers (Gemini/OpenAI/Claude).
 *
 * Strictly disabled in production environments to protect proprietary prompt IP
 * and ensure production performance.
 */
export class PromptPreviewUtility {
  /**
   * Generates a detailed inspection report of a compiled prompt result.
   * Throws an error if invoked in a production environment.
   */
  public static inspect(result: CompiledPromptResult, variables: Record<string, any>): PromptPreviewPayload {
    if (process.env.NODE_ENV === "production" && process.env.ENABLE_PROMPT_PREVIEW_IN_PROD !== "true") {
      throw new Error("PromptPreviewUtility is disabled in production environments for security and performance.");
    }

    const sections = result.loadedModules.map((mod) => {
      const compiledText = PromptVariableResolver.resolve(mod.template, variables, mod.requiredVariables || []);
      return {
        category: mod.category,
        id: mod.id,
        name: mod.name,
        compiledText,
      };
    });

    return {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      score: result.evaluation?.overallScore,
      selection: result.selection,
      loadedModules: result.loadedModules.map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        version: m.version,
      })),
      variablesProvided: Object.keys(variables || {}),
      validation: result.validation,
      evaluation: result.evaluation,
      optimization: result.optimization,
      metrics: result.metrics,
      compiledPrompt: result.compiledText,
      sections,
    };
  }
}
