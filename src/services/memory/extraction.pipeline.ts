import { db } from "../../lib/db";
import { conversations, messages, longTermMemories } from "../../lib/db/schema";
import { eq, desc, asc, and, sql } from "drizzle-orm";
import { getAIOrchestrator } from "../ai/providers";
import { embeddingRegistry } from "./providers/embedding.registry";

export interface CandidateMemory {
  content: string;
  memoryType: 'Preference' | 'Fact' | 'Goal' | 'Constraint' | 'Brand' | 'Project';
  llmImportance: number; // 1-10
}

/**
 * Extraction Pipeline — Conversational Memory V2 (Phase 4)
 * 
 * Responsibilities:
 * - Scans recent conversation segments for enduring knowledge.
 * - Prompts LLM to extract structured Candidate Memories.
 * - Applies Importance Scoring (LLM Score + Recurrence).
 * - Deduplicates and persists into longTermMemories table.
 */
export class ExtractionPipeline {
  public static readonly EXTRACTION_THRESHOLD = 30; // Check every 30 messages

  public static async evaluateAndExtract(conversationId: string, userId: string): Promise<void> {
    const msgCount = await db!.select({ id: messages.id }).from(messages).where(eq(messages.conversationId, conversationId));
    
    // Simplistic threshold check for V2 MVP
    if (msgCount.length % this.EXTRACTION_THRESHOLD === 0 && msgCount.length > 0) {
      console.info(`[ExtractionPipeline] Threshold reached for conversation ${conversationId}. Starting background extraction.`);
      await this.runExtraction(conversationId, userId);
    }
  }

  private static async runExtraction(conversationId: string, userId: string): Promise<void> {
    // 1. Fetch recent messages
    const recentMessages = await db!.select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(this.EXTRACTION_THRESHOLD);
      
    if (recentMessages.length === 0) return;

    const transcript = recentMessages.reverse().map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");

    const prompt = `
Analyze the following conversation segment and extract any ENDURING, LONG-TERM knowledge.
Focus ONLY on: User preferences, Persistent goals, Brand identity, Project conventions, and Stable constraints.
IGNORE transient conversational details, pleasantries, or short-term tasks.

TRANSCRIPT:
${transcript}

OUTPUT JSON FORMAT:
{
  "memories": [
    {
      "content": "Detailed description of the extracted memory",
      "memoryType": "Preference|Fact|Goal|Constraint|Brand|Project",
      "llmImportance": <number 1-10>
    }
  ]
}
`;

    try {
      // 2. Extract Candidate Memories
      const orchestrator = getAIOrchestrator();
      const result = await orchestrator.generateStructured<{ memories: CandidateMemory[] }>({
        intent: "memory-extraction",
        systemPrompt: "You are an expert knowledge extraction engine. You strictly return JSON matching the requested schema.",
        userPrompt: prompt,
        schemaType: "repurpose", // Using an existing schema type just to bypass strict routing, or add 'memory-extraction' schema
        expectedSchemaDescription: "JSON object containing an array of memories",
        fallbackData: { memories: [] }
      });

      let candidates: CandidateMemory[] = [];
      if (typeof result.data === 'string') {
        try {
          const parsed = JSON.parse(result.data);
          candidates = parsed.memories || [];
        } catch(e) {
          console.error("Failed to parse extracted memories", e);
        }
      } else if (result.data && result.data.memories) {
        candidates = result.data.memories;
      }

      // 3. Process, Score, and Store Candidates
      for (const candidate of candidates) {
        await this.processAndStoreMemory(userId, conversationId, candidate);
      }
    } catch (err) {
      console.error("[ExtractionPipeline] Extraction failed:", err);
    }
  }

  private static async processAndStoreMemory(userId: string, conversationId: string, candidate: CandidateMemory): Promise<void> {
    const provider = embeddingRegistry.getProvider();
    const candidateEmbedding = await provider.generateEmbedding(candidate.content);
    const queryEmbStr = JSON.stringify(candidateEmbedding);

    // Check for exact duplicates or highly similar existing memories for recurrence
    const existingMemories = await db!.select({
      id: longTermMemories.id,
      importance: longTermMemories.importance,
      similarity: sql<number>`1 - (${longTermMemories.embedding} <=> ${queryEmbStr})`
    })
    .from(longTermMemories)
    .where(and(
      eq(longTermMemories.userId, userId),
      sql`${longTermMemories.embedding} IS NOT NULL`,
      sql`1 - (${longTermMemories.embedding} <=> ${queryEmbStr}) > 0.85` // High similarity threshold for deduplication
    ))
    .limit(1);

    if (existingMemories.length > 0) {
      // Recurrence: Bump importance of existing memory instead of inserting a duplicate
      const existing = existingMemories[0];
      const newImportance = Math.min(10, existing.importance + 1);
      
      await db!.update(longTermMemories)
        .set({ 
          importance: newImportance, 
          lastAccessedAt: new Date(),
          accessCount: sql`${longTermMemories.accessCount} + 1` 
        })
        .where(eq(longTermMemories.id, existing.id));
        
      console.info(`[ExtractionPipeline] Bumped importance of existing memory ${existing.id} to ${newImportance}`);
    } else {
      // New Memory: Apply Base Score + Validation Threshold
      // LLM Score must be at least 4 to be considered worthy of long term storage
      if (candidate.llmImportance >= 4) {
        await db!.insert(longTermMemories).values({
          userId,
          scope: 'user', // Default scope
          memoryType: candidate.memoryType,
          content: candidate.content,
          embedding: candidateEmbedding,
          importance: candidate.llmImportance,
          accessCount: 1, // Start at 1 access
        });
        console.info(`[ExtractionPipeline] Stored new long-term memory: [${candidate.memoryType}] ${candidate.content.substring(0, 30)}...`);
      }
    }
  }
}
