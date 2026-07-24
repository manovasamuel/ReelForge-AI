import { db } from "../../lib/db";
import { conversations, messages, longTermMemories } from "../../lib/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { embeddingRegistry } from "./providers/embedding.registry";
import type { RetrievalScope, HybridRankedResult, SemanticSearchResult, MemoryReference } from "./types";
import { CompressionEngine } from "./compression.engine";
import { ExtractionPipeline } from "./extraction.pipeline";
import { TelemetryRepository } from "../telemetry/telemetry.repository";

export class MemoryService {
  /**
   * Retrieves semantically relevant context using hybrid ranking.
   */
  public static async retrieveContext(
    query: string,
    scope: RetrievalScope,
    limit: number = 10
  ): Promise<HybridRankedResult[]> {
    const startTime = performance.now();
    const provider = embeddingRegistry.getProvider();
    const queryEmbedding = await provider.generateEmbedding(query);

    const queryEmbStr = JSON.stringify(queryEmbedding);

    // 1. Retrieve semantic matches from messages (recent across user)
    // In a real app we might filter by specific conversationId if provided, but scope handles boundaries.
    const messageResults = await db!
      .select({
        id: messages.id,
        content: messages.content,
        role: messages.role,
        createdAt: messages.createdAt,
        conversationId: messages.conversationId,
        similarity: sql<number>`1 - (${messages.embedding} <=> ${queryEmbStr})`
      })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(and(
        eq(conversations.workspaceId, scope.workspaceId),
        sql`${messages.embedding} IS NOT NULL`,
        // We only use text similarity threshold for efficiency
        sql`1 - (${messages.embedding} <=> ${queryEmbStr}) > 0.6`
      ))
      .orderBy(desc(sql`1 - (${messages.embedding} <=> ${queryEmbStr})`))
      .limit(20);

    // 2. Retrieve semantic matches from long-term memories based on scope
    const memoryResults = await db!
      .select({
        id: longTermMemories.id,
        content: longTermMemories.content,
        memoryType: longTermMemories.memoryType,
        importance: longTermMemories.importance,
        accessCount: longTermMemories.accessCount,
        lastAccessedAt: longTermMemories.lastAccessedAt,
        createdAt: longTermMemories.createdAt,
        similarity: sql<number>`1 - (${longTermMemories.embedding} <=> ${queryEmbStr})`
      })
      .from(longTermMemories)
      .where(and(
        eq(longTermMemories.workspaceId, scope.workspaceId),
        sql`${longTermMemories.embedding} IS NOT NULL`,
        sql`1 - (${longTermMemories.embedding} <=> ${queryEmbStr}) > 0.6`
      ))
      .orderBy(desc(sql`1 - (${longTermMemories.embedding} <=> ${queryEmbStr})`))
      .limit(20);

    // Combine results
    const combined: SemanticSearchResult[] = [
      ...messageResults.map(m => ({ 
        ...m, 
        source: 'message' as const, 
        similarity: Number(m.similarity),
        scope: 'user'
      })),
      ...memoryResults.map(m => ({ 
        ...m, 
        source: 'long_term_memory' as const, 
        similarity: Number(m.similarity),
        scope: 'workspace' // Defaulting to workspace scope for now based on where clause
      }))
    ];

    // Hybrid Ranking
    const finalResults = this.performHybridRanking(combined).slice(0, limit);

    TelemetryRepository.logMemoryOperation({
      workspaceId: scope.workspaceId,
      operation: "retrieve_context",
      durationMs: Math.round(performance.now() - startTime),
      itemsProcessed: finalResults.length,
      successful: true,
    });

    return finalResults;
  }

  /**
   * Applies a hybrid ranking algorithm merging Similarity, Recency, Importance, and Access Frequency.
   */
  private static performHybridRanking(results: SemanticSearchResult[]): HybridRankedResult[] {
    const now = Date.now();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    return results.map(result => {
      let score = result.similarity; // Base score (0-1)

      // Recency Boost (Max +0.2)
      const ageMs = now - result.createdAt.getTime();
      const recencyBoost = Math.max(0, 1 - (ageMs / THIRTY_DAYS_MS)) * 0.2;
      score += recencyBoost;

      if (result.source === "long_term_memory") {
        // Importance Boost (Max +0.15 for importance 10)
        const importance = result.importance || 5;
        score += (importance / 10) * 0.15;

        // Frequency Boost (Max +0.1 for high access counts)
        const accesses = result.accessCount || 0;
        const frequencyBoost = Math.min(accesses / 100, 1) * 0.1;
        score += frequencyBoost;
      }

      const provenance: MemoryReference = {
        memoryId: result.id,
        conversationId: result.conversationId,
        source: result.source,
        similarityScore: result.similarity,
        scope: result.scope || 'user'
      };

      return {
        ...result,
        finalScore: score,
        provenance
      };
    }).sort((a, b) => b.finalScore - a.finalScore);
  }

  public static async createConversation(
    userId: string,
    workspaceId: string,
    title: string,
    projectId?: string,
    brandId?: string
  ) {
    const [conv] = await db!.insert(conversations).values({
      userId,
      workspaceId,
      projectId,
      brandId,
      title
    }).returning();
    return conv;
  }

  public static async getConversation(conversationId: string) {
    const [conv] = await db!.select().from(conversations).where(eq(conversations.id, conversationId));
    return conv;
  }

  public static async storeMessage(
    conversationId: string,
    role: string,
    content: string,
    toolCalls?: any,
    toolResult?: any
  ) {
    const [msg] = await db!.insert(messages).values({
      conversationId,
      role,
      content,
      toolCalls,
      toolResult,
      embeddingStatus: 'Pending'
    }).returning();

    // Async embedding generation
    this.processMessageEmbedding(msg.id, content, conversationId).catch(err => {
      console.error(`Failed to generate embedding for message ${msg.id}:`, err);
    });

    // Background compression & extraction
    // Using setTimeout to completely decouple from the request flow
    setTimeout(async () => {
      CompressionEngine.evaluateAndCompress(conversationId).catch(err => {
        console.error(`[MemoryService] Background compression failed for ${conversationId}:`, err);
      });
      
      const userId = (await this.getConversation(conversationId))?.userId;
      if (userId) {
        ExtractionPipeline.evaluateAndExtract(conversationId, userId).catch(err => {
          console.error(`[MemoryService] Background extraction failed for ${conversationId}:`, err);
        });
      }
    }, 0);

    return msg;
  }

  private static async processMessageEmbedding(messageId: string, content: string, conversationId: string) {
    if (!content.trim()) return;
    
    const startTime = performance.now();
    try {
      const provider = embeddingRegistry.getProvider();
      const embedding = await provider.generateEmbedding(content);
      
      await db!.update(messages)
        .set({ embedding, embeddingStatus: 'Completed' })
        .where(eq(messages.id, messageId));

      const conv = await this.getConversation(conversationId);
      if (conv?.workspaceId) {
        TelemetryRepository.logMemoryOperation({
          workspaceId: conv.workspaceId,
          operation: "message_embedding",
          durationMs: Math.round(performance.now() - startTime),
          itemsProcessed: 1,
          successful: true,
        });
      }
    } catch (err: any) {
      await db!.update(messages)
        .set({ embeddingStatus: 'Failed' })
        .where(eq(messages.id, messageId));

      const conv = await this.getConversation(conversationId);
      if (conv?.workspaceId) {
        TelemetryRepository.logMemoryOperation({
          workspaceId: conv.workspaceId,
          operation: "message_embedding",
          durationMs: Math.round(performance.now() - startTime),
          itemsProcessed: 0,
          successful: false,
          errorMessage: err.message,
        });
      }
      throw err;
    }
  }
}
