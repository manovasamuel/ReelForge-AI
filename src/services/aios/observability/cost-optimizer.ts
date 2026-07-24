/**
 * AIOS Cost Optimizer
 *
 * Calculates estimated tokens, monetary costs, and savings (from cache/compression).
 * Prepares the platform for future paid model integration even while using free models.
 */

export interface CostEstimate {
  estimatedTokensUsed: number;
  estimatedCostUsd: number;
  savedTokensCache: number;
  savedTokensCompression: number;
  savedCostUsd: number;
  compressionRatio: number;
}

export class CostOptimizer {
  private static instance: CostOptimizer;

  static getInstance(): CostOptimizer {
    if (!CostOptimizer.instance) {
      CostOptimizer.instance = new CostOptimizer();
    }
    return CostOptimizer.instance;
  }

  /**
   * Calculates the cost for a single agent execution.
   */
  calculateExecutionCost(params: {
    modelCostPer1kTokens: number;
    tokensUsed: number;
    originalContextTokens: number; // Tokens before compression
    wasCached: boolean;
  }): CostEstimate {
    const { modelCostPer1kTokens, tokensUsed, originalContextTokens, wasCached } = params;

    if (wasCached) {
      const savedTokens = originalContextTokens + tokensUsed; // Roughly
      return {
        estimatedTokensUsed: 0,
        estimatedCostUsd: 0,
        savedTokensCache: savedTokens,
        savedTokensCompression: 0,
        savedCostUsd: (savedTokens / 1000) * modelCostPer1kTokens,
        compressionRatio: 0,
      };
    }

    const savedByCompression = Math.max(0, originalContextTokens - tokensUsed);
    const estimatedCostUsd = (tokensUsed / 1000) * modelCostPer1kTokens;
    const savedCostUsd = (savedByCompression / 1000) * modelCostPer1kTokens;
    const compressionRatio = originalContextTokens > 0 
      ? 1 - (tokensUsed / originalContextTokens)
      : 0;

    return {
      estimatedTokensUsed: tokensUsed,
      estimatedCostUsd,
      savedTokensCache: 0,
      savedTokensCompression: savedByCompression,
      savedCostUsd,
      compressionRatio,
    };
  }
}

export const costOptimizer = CostOptimizer.getInstance();
