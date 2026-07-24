/**
 * AIOS Memory Manager — L0 through L5 Hierarchy
 *
 * This is the authoritative source of knowledge for every agent in the AIOS.
 * Each layer represents a different tier of memory with distinct characteristics:
 *
 *  L0 — Session Memory   : Intermediate agent outputs (in-process, workflow-scoped)
 *  L1 — Request Cache    : Short-lived cache for identical repeated requests (<5 min TTL)
 *  L2 — Conversation     : Recent conversation history for the current session
 *  L3 — Workspace Assets : Published content assets from the Content Workspace
 *  L4 — AKP              : Validated learned patterns from Performance Intelligence
 *  L5 — Database         : Full profile intelligence, strategies, competitor data
 *
 * Retrieval always starts at L0 (fastest, cheapest) and cascades down.
 * Each layer returns a set of MemoryDocuments that carry relevance metadata.
 *
 * Rule: Nothing is returned without a score. The Ranker decides what reaches the LLM.
 */

import { db } from "@/lib/db";
import {
  profileIntelligence,
  profileStrategies,
  competitorTracking,
  instagramProfiles,
  contentAssets,
  akpLearnedPatterns,
} from "@/lib/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { ContextBudgetManager } from "@/services/ai/context.budget";
import type { MemoryLayer } from '../agent-registry';

export type { MemoryLayer } from '../agent-registry';

export interface MemoryDocument {
  id: string;
  layer: MemoryLayer;
  content: string;
  /** 0-1: how relevant is this to the current query */
  relevanceScore: number;
  /** 0-1: how confident is this data */
  confidenceScore: number;
  /** Unix timestamp of the data. Fresher = higher freshness score. */
  freshness: number;
  /** Estimated token cost */
  tokenCost: number;
  /** Data source label for observability */
  source: string;
  /** Phase 3: Layer Versioning */
  version?: string;
  generatedAt?: string;
  /** Raw payload (for programmatic use by agents) */
  payload?: any;
}

export interface MemoryQueryOptions {
  workflowId: string;
  profileId: string;
  query: string;
  /** L0 context store from WorkflowStateManager */
  sessionContextStore?: Record<string, any>;
  /** Conversation history */
  conversationHistory?: any[];
  maxTokenBudget?: number;
  /** Phase 3: Selective Context Injection */
  requiredLayers?: MemoryLayer[];
}

const DEFAULT_MAX_BUDGET = 4000; // tokens

// --- Simple keyword relevance scorer ---
function scoreRelevance(content: string, query: string): number {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  if (queryWords.length === 0) return 0.3;
  const contentLower = content.toLowerCase();
  const hits = queryWords.filter(w => contentLower.includes(w)).length;
  return Math.min(hits / queryWords.length + 0.1, 1.0);
}

function freshnessScore(date: Date | null | undefined): number {
  if (!date) return 0.2;
  const ageMs = Date.now() - new Date(date).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  // Fresher is better: exponential decay over 30 days
  return Math.max(0.1, Math.exp(-ageDays / 30));
}

export class MemoryManager {
  private static instance: MemoryManager;

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * Retrieves memory documents from all relevant layers for the given query.
   * Returns an unsorted collection — the Ranker sorts and filters.
   */
  async retrieve(options: MemoryQueryOptions): Promise<MemoryDocument[]> {
    const docs: MemoryDocument[] = [];
    const layers = options.requiredLayers;
    const shouldFetch = (layer: MemoryLayer) => !layers || layers.includes(layer);

    // L0: Session Memory (fastest — always check first)
    if (shouldFetch('L0')) docs.push(...this.retrieveL0(options));

    // L1: Request Cache (skipped for now — Sprint 3 Cache Manager will populate)

    // L2: Conversation History
    if (shouldFetch('L2')) docs.push(...this.retrieveL2(options));

    // L3: Workspace Assets
    if (shouldFetch('L3')) docs.push(...await this.retrieveL3(options));

    // L4: AKP Learned Patterns
    if (shouldFetch('L4')) docs.push(...await this.retrieveL4(options));

    // L5: Database Intelligence - Layered
    if (shouldFetch('L5-Brand')) docs.push(...await this.retrieveL5Brand(options));
    if (shouldFetch('L5-Competitor')) docs.push(...await this.retrieveL5Competitor(options));
    if (shouldFetch('L5-Audience')) docs.push(...await this.retrieveL5Audience(options));
    if (shouldFetch('L5-ContentDNA')) docs.push(...await this.retrieveL5ContentDNA(options));

    return docs;
  }

  // ---- L0: Session Memory ----
  private retrieveL0(options: MemoryQueryOptions): MemoryDocument[] {
    if (!options.sessionContextStore) return [];

    return Object.entries(options.sessionContextStore).map(([key, value]) => {
      const content = typeof value === 'string' ? value : JSON.stringify(value);
      return {
        id: `l0:${key}`,
        layer: 'L0' as MemoryLayer,
        content,
        relevanceScore: 0.95, // Session outputs are always highly relevant
        confidenceScore: 1.0,
        freshness: 1.0, // Just generated
        tokenCost: ContextBudgetManager.estimateTokens(content),
        source: `Session Output (${key})`,
        version: '1.0',
        generatedAt: new Date().toISOString(),
        payload: value,
      };
    });
  }

  // ---- L2: Conversation History ----
  private retrieveL2(options: MemoryQueryOptions): MemoryDocument[] {
    if (!options.conversationHistory || options.conversationHistory.length === 0) return [];

    const recentMessages = options.conversationHistory.slice(-6); // Last 3 turns
    const content = recentMessages
      .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    return [{
      id: 'l2:conversation',
      layer: 'L2',
      content,
      relevanceScore: scoreRelevance(content, options.query),
      confidenceScore: 1.0,
      freshness: 1.0,
      tokenCost: ContextBudgetManager.estimateTokens(content),
      source: 'ConversationHistory',
    }];
  }

  // ---- L3: Workspace Assets (recent published content) ----
  private async retrieveL3(options: MemoryQueryOptions): Promise<MemoryDocument[]> {
    try {
      const assets = await db.select({
        id: contentAssets.id,
        title: contentAssets.title,
        contentType: contentAssets.contentType,
        contentState: contentAssets.contentState,
        contentData: contentAssets.contentData,
        createdAt: contentAssets.createdAt,
      })
        .from(contentAssets)
        .where(eq(contentAssets.profileId, options.profileId))
        .orderBy(desc(contentAssets.createdAt))
        .limit(5);

      return assets.map(asset => {
        const content = `[${asset.contentType}] "${asset.title}" (${asset.contentState}): ${
          typeof asset.contentData === 'string' ? asset.contentData.slice(0, 300) : JSON.stringify(asset.contentData).slice(0, 300)
        }`;
        return {
          id: `l3:${asset.id}`,
          layer: 'L3' as MemoryLayer,
          content,
          relevanceScore: scoreRelevance(content, options.query),
          confidenceScore: 0.8,
          freshness: freshnessScore(asset.createdAt),
          tokenCost: ContextBudgetManager.estimateTokens(content),
          source: `Workspace:${asset.title}`,
          payload: asset,
        };
      });
    } catch {
      return [];
    }
  }

  // ---- L4: AKP Learned Patterns (the most strategically valuable layer) ----
  private async retrieveL4(options: MemoryQueryOptions): Promise<MemoryDocument[]> {
    try {
      const patterns = await db.select()
        .from(akpLearnedPatterns)
        .where(gte(akpLearnedPatterns.confidenceScore, 60)) // Only reasonably confident patterns
        .orderBy(desc(akpLearnedPatterns.confidenceScore))
        .limit(10);

      return patterns.map(p => {
        const content = `[AKP Pattern | ${p.patternType} | Confidence: ${p.confidenceScore}% | Lift: ${p.averageLift}x | Samples: ${p.sampleSize}] ${p.pattern}`;
        return {
          id: `l4:${p.id}`,
          layer: 'L4' as MemoryLayer,
          content,
          relevanceScore: scoreRelevance(content, options.query) * (p.confidenceScore / 100),
          confidenceScore: p.confidenceScore / 100,
          freshness: freshnessScore(p.updatedAt),
          tokenCost: ContextBudgetManager.estimateTokens(content),
          source: `AKP:${p.patternType}`,
          payload: p,
        };
      });
    } catch {
      return [];
    }
  }

  // ---- L5-Brand: Brand Intelligence ----
  private async retrieveL5Brand(options: MemoryQueryOptions): Promise<MemoryDocument[]> {
    try {
      const intel = await db.select().from(profileIntelligence)
        .where(eq(profileIntelligence.profileId, options.profileId)).limit(1);

      if (intel[0]) {
        const d = intel[0];
        // Compression: Output Strategic Summary instead of raw JSON
        const content = `Brand Intel: ${d.niche || 'Unknown'} creator. Growth stage: ${d.growthStage || 'Unknown'}. Objective: ${d.primaryObjective || 'Unknown'}. Reasoning: ${d.aiReasoning ? d.aiReasoning.slice(0, 150) : ''}`;
        return [{
          id: 'l5:brand',
          layer: 'L5-Brand',
          content,
          relevanceScore: 0.8,
          confidenceScore: 0.9,
          freshness: freshnessScore(d.createdAt),
          tokenCost: ContextBudgetManager.estimateTokens(content),
          source: 'Brand Intelligence Analysis',
          version: '1.0',
          generatedAt: d.createdAt?.toISOString() || new Date().toISOString(),
          payload: d,
        }];
      }
    } catch (e) { console.warn('[MemoryManager] L5-Brand retrieval error:', e); }
    return [];
  }

  // ---- L5-Competitor: Competitor Tracking ----
  private async retrieveL5Competitor(options: MemoryQueryOptions): Promise<MemoryDocument[]> {
    try {
      // Mocked out DB access for competitors to return a compressed summary
      const content = `Competitor Insight: Leading competitor emphasizes rapid hook pacing and high-contrast visuals. Gap identified in educational content within this niche.`;
      return [{
        id: 'l5:competitor',
        layer: 'L5-Competitor',
        content,
        relevanceScore: 0.8,
        confidenceScore: 0.85,
        freshness: 0.9,
        tokenCost: ContextBudgetManager.estimateTokens(content),
        source: 'Competitor Tracking Engine',
        version: '1.0',
        generatedAt: new Date().toISOString(),
      }];
    } catch (e) { console.warn('[MemoryManager] L5-Competitor retrieval error:', e); }
    return [];
  }

  // ---- L5-Audience: Audience Psychology ----
  private async retrieveL5Audience(options: MemoryQueryOptions): Promise<MemoryDocument[]> {
    try {
      const strategies = await db.select().from(profileStrategies)
        .where(eq(profileStrategies.profileId, options.profileId))
        .orderBy(desc(profileStrategies.createdAt)).limit(1);

      if (strategies[0]) {
        const s = strategies[0];
        const content = `Audience Psych: Gaps: ${JSON.stringify(s.strategicGaps || []).slice(0, 100)}. Strategy: ${JSON.stringify(s.executionPlan || []).slice(0, 200)}.`;
        return [{
          id: 'l5:audience',
          layer: 'L5-Audience',
          content,
          relevanceScore: scoreRelevance(content, options.query),
          confidenceScore: 0.85,
          freshness: freshnessScore(s.createdAt),
          tokenCost: ContextBudgetManager.estimateTokens(content),
          source: 'Audience Strategy Engine',
          version: '1.0',
          generatedAt: s.createdAt?.toISOString() || new Date().toISOString(),
          payload: s,
        }];
      }
    } catch (e) { console.warn('[MemoryManager] L5-Audience retrieval error:', e); }
    return [];
  }

  // ---- L5-ContentDNA: Winning Content Patterns ----
  private async retrieveL5ContentDNA(options: MemoryQueryOptions): Promise<MemoryDocument[]> {
    return []; // Future implementation
  }
}

export const memoryManager = MemoryManager.getInstance();
