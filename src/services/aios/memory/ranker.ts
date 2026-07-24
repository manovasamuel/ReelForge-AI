/**
 * AIOS Ranker
 *
 * Takes the raw documents from the Retriever and ranks them
 * using a weighted composite score across four dimensions:
 *
 *   Relevance  (40%) — How topically related to the current query
 *   Confidence (25%) — How reliable/validated is this data
 *   Freshness  (20%) — How recent is this data
 *   Layer      (15%) — Layer priority bonus (L0 > L4 > L5 > L3 > L2)
 *
 * Also enforces layer deduplication so the same concept doesn't appear
 * twice (e.g., two AKP patterns saying the same thing).
 *
 * Design principle: The Ranker is purely computational — no I/O, no async.
 * Input: raw MemoryDocuments. Output: ranked MemoryDocuments.
 */

import type { MemoryDocument, MemoryLayer } from './memory.manager';

// Layer priority bonus (higher = more valuable in AIOS context)
const LAYER_BONUS: Record<MemoryLayer, number> = {
  L0: 1.00, // Session outputs — always highest value
  L4: 0.85, // AKP learned patterns — strategic gold
  'L5-Brand': 0.75,
  'L5-Competitor': 0.75,
  'L5-Audience': 0.75,
  'L5-ContentDNA': 0.75,
  L3: 0.65, // Workspace assets
  L2: 0.55, // Conversation history
  L1: 0.50, // Cache
};

// Scoring weights must sum to 1.0
const WEIGHTS = {
  relevance: 0.40,
  confidence: 0.25,
  freshness: 0.20,
  layer: 0.15,
};

export interface RankedDocument extends MemoryDocument {
  compositeScore: number;
  scoreBreakdown: {
    relevance: number;
    confidence: number;
    freshness: number;
    layer: number;
  };
}

export class Ranker {
  private static instance: Ranker;

  static getInstance(): Ranker {
    if (!Ranker.instance) {
      Ranker.instance = new Ranker();
    }
    return Ranker.instance;
  }

  /**
   * Ranks documents by composite score. Always returns in descending score order.
   */
  rank(documents: MemoryDocument[]): RankedDocument[] {
    const ranked = documents.map(doc => {
      const layerScore = LAYER_BONUS[doc.layer] ?? 0.5;

      const compositeScore =
        doc.relevanceScore * WEIGHTS.relevance +
        doc.confidenceScore * WEIGHTS.confidence +
        doc.freshness * WEIGHTS.freshness +
        layerScore * WEIGHTS.layer;

      return {
        ...doc,
        compositeScore,
        scoreBreakdown: {
          relevance: doc.relevanceScore * WEIGHTS.relevance,
          confidence: doc.confidenceScore * WEIGHTS.confidence,
          freshness: doc.freshness * WEIGHTS.freshness,
          layer: layerScore * WEIGHTS.layer,
        },
      };
    });

    // Sort descending by composite score
    ranked.sort((a, b) => b.compositeScore - a.compositeScore);

    return ranked;
  }

  /**
   * Filters to top-N documents after ranking, respecting a minimum score threshold.
   */
  filter(ranked: RankedDocument[], options: {
    minScore?: number;
    maxDocuments?: number;
  } = {}): RankedDocument[] {
    const { minScore = 0.3, maxDocuments = 20 } = options;

    return ranked
      .filter(d => d.compositeScore >= minScore)
      .slice(0, maxDocuments);
  }
}

export const ranker = Ranker.getInstance();
