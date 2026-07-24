/**
 * AIOS Context Builder
 *
 * The final stage of the memory pipeline: Retriever → Ranker → Compressor → Context Builder.
 *
 * Takes the compressed, budget-approved set of memory documents and assembles
 * them into a structured context string ready for injection into an agent's prompt.
 *
 * Key behaviors:
 * - AKP learned patterns are always surfaced prominently (L4 is business-critical)
 * - Session context (L0) is presented as "Prior Agent Work" so agents don't repeat
 * - Each section is clearly labeled so the LLM understands the source and weight
 * - Provides a `buildForAgent` method for agents to call, abstracting all pipeline steps
 *
 * This replaces and supersedes the legacy `ContextBuilderService` in `src/services/copilot/`.
 * The old service is preserved for the streaming Copilot path. This is the AIOS path.
 */

import { retriever } from './retriever';
import { ranker, type RankedDocument } from './ranker';
import { compressor } from './compressor';
import type { MemoryQueryOptions } from './memory.manager';

export interface AgentContextPayload {
  /** The assembled context string to inject into the system/user prompt */
  contextString: string;
  /** Extracted AKP patterns for direct programmatic use by agents */
  akpPatterns: string[];
  /** Estimated tokens consumed by this context */
  tokenCost: number;
  /** Budget utilization summary */
  utilizationPercent: number;
  /** Layer breakdown for observability */
  layerSummary: Record<string, { count: number; tokens: number }>;
}

// Default token budgets per agent complexity tier
const BUDGET_BY_CAPABILITY: Record<string, number> = {
  audit_analysis: 8000,
  strategy_generation: 6000,
  generate_script: 4000,
  generate_hook: 2000,
  generate_caption: 2000,
  generate_hashtags: 1500,
  default: 3000,
};

export class AIOSContextBuilder {
  private static instance: AIOSContextBuilder;

  static getInstance(): AIOSContextBuilder {
    if (!AIOSContextBuilder.instance) {
      AIOSContextBuilder.instance = new AIOSContextBuilder();
    }
    return AIOSContextBuilder.instance;
  }

  /**
   * Full pipeline: Retrieve → Rank → Compress → Assemble.
   * Called by the Orchestrator to prepare context for each agent before execution.
   */
  async buildForAgent(options: MemoryQueryOptions, capability?: string): Promise<AgentContextPayload> {
    const budget = BUDGET_BY_CAPABILITY[capability || 'default'] || BUDGET_BY_CAPABILITY.default;

    // 1. Retrieve
    const rawDocs = await retriever.retrieve(options);

    // 2. Rank
    const ranked = ranker.rank(rawDocs);
    const filtered = ranker.filter(ranked, { minScore: 0.25, maxDocuments: 30 });

    // 3. Compress
    const { included, totalTokensUsed, utilizationPercent, layerSummary } = compressor.compress(filtered, budget);

    // 4. Assemble
    const contextString = this.assembleContextString(included);
    const akpPatterns = this.extractAkpPatterns(included);

    // Phase 3: Retrieval Logging
    const requested = options.requiredLayers || ['All Layers'];
    const retrievedLayers = [...new Set(included.map(d => d.layer))];
    const skippedLayers = requested.filter(l => l !== 'All Layers' && !retrievedLayers.includes(l as any));
    
    console.log(`[AIOSContextBuilder] Retrieved: ${retrievedLayers.length > 0 ? retrievedLayers.join(', ') : 'None'}`);
    if (skippedLayers.length > 0) {
      console.log(`[AIOSContextBuilder] Skipped: ${skippedLayers.join(', ')}`);
    }
    
    // Estimate original raw token size for logging
    const rawTokens = rawDocs.reduce((acc, doc) => acc + doc.tokenCost, 0);
    console.log(`[AIOSContextBuilder] Compressed Tokens: ${rawTokens} → ${totalTokensUsed} (${utilizationPercent}% budget used)`);

    return { contextString, akpPatterns, tokenCost: totalTokensUsed, utilizationPercent, layerSummary };
  }

  private assembleContextString(docs: RankedDocument[]): string {
    if (docs.length === 0) return '';

    const sections: string[] = [];

    // Group by layer for structured presentation
    const l0 = docs.filter(d => d.layer === 'L0');
    const l4 = docs.filter(d => d.layer === 'L4');
    
    // Phase 3: Layered Intelligence
    const l5Brand = docs.filter(d => d.layer === 'L5-Brand');
    const l5Competitor = docs.filter(d => d.layer === 'L5-Competitor');
    const l5Audience = docs.filter(d => d.layer === 'L5-Audience');
    const l5ContentDNA = docs.filter(d => d.layer === 'L5-ContentDNA');
    
    const l3 = docs.filter(d => d.layer === 'L3');
    const l2 = docs.filter(d => d.layer === 'L2');

    if (l0.length > 0) {
      sections.push(`=== PRIOR AGENT WORK (Use as direct input — do not repeat) ===\n${l0.map(d => `[${d.source}]: ${d.content}`).join('\n\n')}`);
    }

    if (l4.length > 0) {
      sections.push(`=== VALIDATED PERFORMANCE PATTERNS (AKP — Apply these to maximize impact) ===\n${l4.map(d => d.content).join('\n')}`);
    }

    if (l5Brand.length > 0) {
      sections.push(`=== BRAND INTELLIGENCE ===\n${l5Brand.map(d => d.content).join('\n')}`);
    }
    
    if (l5Competitor.length > 0) {
      sections.push(`=== COMPETITOR INTELLIGENCE ===\n${l5Competitor.map(d => d.content).join('\n')}`);
    }
    
    if (l5Audience.length > 0) {
      sections.push(`=== AUDIENCE PSYCHOLOGY ===\n${l5Audience.map(d => d.content).join('\n')}`);
    }
    
    if (l5ContentDNA.length > 0) {
      sections.push(`=== CONTENT DNA (Winning Formats) ===\n${l5ContentDNA.map(d => d.content).join('\n')}`);
    }

    if (l3.length > 0) {
      sections.push(`=== RECENT WORKSPACE CONTENT (Maintain consistency) ===\n${l3.map(d => d.content).join('\n\n')}`);
    }

    if (l2.length > 0) {
      sections.push(`=== CONVERSATION CONTEXT ===\n${l2.map(d => d.content).join('\n')}`);
    }

    return sections.join('\n\n---\n\n');
  }

  private extractAkpPatterns(docs: RankedDocument[]): string[] {
    return docs
      .filter(d => d.layer === 'L4')
      .map(d => d.content);
  }
}

export const aiosContextBuilder = AIOSContextBuilder.getInstance();
