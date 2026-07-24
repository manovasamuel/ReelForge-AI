/**
 * AIOS Compressor
 *
 * Takes the ranked documents and applies a priority-ordered token budget strategy.
 * The goal: fit the maximum strategic value within the LLM's context window.
 *
 * Budget allocation strategy (ordered by priority — higher priority filled first):
 *   1. L0 Session Memory  (always included — inter-agent outputs)
 *   2. L4 AKP Patterns    (learned strategic intelligence)
 *   3. L5 Profile Intel   (profile context)
 *   4. L3 Workspace       (recent content examples)
 *   5. L2 Conversation    (user history)
 *
 * Documents within each tier are included in rank order until the budget is exhausted.
 * We NEVER truncate individual documents mid-sentence — we include them whole or skip them.
 *
 * Design principle: The Compressor is the last gatekeeper before the LLM.
 *   It enforces the token contract. Nothing exceeds the budget.
 */

import type { RankedDocument } from './ranker';
import type { MemoryLayer } from '../agent-registry';
import { ContextBudgetManager } from '@/services/ai/context.budget';

// Priority order for budget filling (Phase 3: Layered Intelligence)
const LAYER_PRIORITY: MemoryLayer[] = [
  'L0', 
  'L5-Brand', 
  'L5-Audience', 
  'L5-ContentDNA', 
  'L4', 
  'L5-Competitor', 
  'L3', 
  'L2', 
  'L1'
];

// Portion of total budget reserved for each tier (soft caps, not hard)
const TIER_BUDGET_PORTION: Record<MemoryLayer, number> = {
  'L0': 0.35,
  'L5-Brand': 0.15,
  'L5-Audience': 0.10,
  'L5-ContentDNA': 0.10,
  'L4': 0.10,
  'L5-Competitor': 0.10,
  'L3': 0.05,
  'L2': 0.05,
  'L1': 0.00,
};

export interface CompressionResult {
  /** Documents that made it into the final context */
  included: RankedDocument[];
  /** Documents dropped due to budget */
  excluded: RankedDocument[];
  /** Estimated total tokens used */
  totalTokensUsed: number;
  /** Budget utilization percentage */
  utilizationPercent: number;
  /** Summary of what each layer contributed */
  layerSummary: Record<string, { count: number; tokens: number }>;
}

export class Compressor {
  private static instance: Compressor;

  static getInstance(): Compressor {
    if (!Compressor.instance) {
      Compressor.instance = new Compressor();
    }
    return Compressor.instance;
  }

  /**
   * Compresses ranked documents into a token-budgeted selection.
   * @param ranked - Documents sorted by composite score (from Ranker)
   * @param totalBudget - Total token budget available for context
   */
  compress(ranked: RankedDocument[], totalBudget: number): CompressionResult {
    const included: RankedDocument[] = [];
    const excluded: RankedDocument[] = [];
    let totalTokensUsed = 0;
    const layerSummary: Record<string, { count: number; tokens: number }> = {};

    // Group documents by layer (Phase 3: Reject low confidence)
    const byLayer: Record<string, RankedDocument[]> = {};
    for (const doc of ranked) {
      if (doc.confidenceScore < 0.60) {
        excluded.push(doc);
        continue; // Quality Gate: Reject low confidence
      }

      if (!byLayer[doc.layer]) byLayer[doc.layer] = [];
      
      // Add visual warning flag for borderline confidence
      if (doc.confidenceScore >= 0.60 && doc.confidenceScore < 0.80) {
        doc.content = `[LOW CONFIDENCE - USE WITH CAUTION] ${doc.content}`;
      }
      
      byLayer[doc.layer]!.push(doc);
    }

    // Fill in priority order
    for (const layer of LAYER_PRIORITY) {
      const docs = byLayer[layer] || [];
      if (docs.length === 0) continue;

      const tierBudget = Math.floor(totalBudget * TIER_BUDGET_PORTION[layer]);
      let tierTokensUsed = 0;

      for (const doc of docs) {
        const overhead = 50; // Safety buffer per document for formatting
        const docCost = doc.tokenCost + overhead;

        if (totalTokensUsed + docCost <= totalBudget && tierTokensUsed + docCost <= tierBudget * 1.5) {
          included.push(doc);
          totalTokensUsed += docCost;
          tierTokensUsed += docCost;

          if (!layerSummary[layer]) layerSummary[layer] = { count: 0, tokens: 0 };
          layerSummary[layer].count++;
          layerSummary[layer].tokens += docCost;
        } else {
          excluded.push(doc);
        }
      }
    }

    return {
      included,
      excluded,
      totalTokensUsed,
      utilizationPercent: Math.round((totalTokensUsed / totalBudget) * 100),
      layerSummary,
    };
  }
}

export const compressor = Compressor.getInstance();
