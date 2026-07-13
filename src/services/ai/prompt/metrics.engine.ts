import type { PromptModuleDefinition } from "../library";

export interface PromptMetricsReport {
  charCount: number;
  wordCount: number;
  estimatedTokenCount: number;
  variableCount: number;
  moduleCount: number;
  estimatedCostUsd: number;
  estimatedCostFormatted: string;
}

/**
 * Prompt Metrics Engine — ReelForge AI v2.1 Phase 7.4.
 *
 * Calculates character count, word count, estimated token count,
 * variable count, module count, and estimated AI transmission cost.
 */
export class PromptMetricsEngine {
  /**
   * Calculates comprehensive metrics for a prompt payload.
   */
  public static calculate(
    promptText: string,
    loadedModules: PromptModuleDefinition[],
    variables: Record<string, any>
  ): PromptMetricsReport {
    const charCount = promptText.length;
    const words = promptText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Standard rule of thumb for English LLM tokenization: ~4 characters per token
    const estimatedTokenCount = Math.ceil(charCount / 4);

    const variableCount = Object.keys(variables || {}).length;
    const moduleCount = loadedModules.length;

    // Estimated input cost based on modern commercial LLM rates (~$0.004 per 1,000 input tokens)
    const estimatedCostUsd = Number(((estimatedTokenCount / 1000) * 0.004).toFixed(6));
    const estimatedCostFormatted = `$${estimatedCostUsd.toFixed(5)} USD`;

    return {
      charCount,
      wordCount,
      estimatedTokenCount,
      variableCount,
      moduleCount,
      estimatedCostUsd,
      estimatedCostFormatted,
    };
  }
}
