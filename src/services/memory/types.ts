export interface IEmbeddingProvider {
  readonly id: string;
  readonly modelName: string;
  readonly dimensions: number;
  
  /**
   * Generate an embedding for a single piece of text.
   */
  generateEmbedding(text: string): Promise<number[]>;
  
  /**
   * Batch generation of embeddings.
   */
  generateEmbeddings(texts: string[]): Promise<number[][]>;
}

export interface RetrievalScope {
  userId: string;
  workspaceId: string;
  projectId?: string;
  brandId?: string;
}

export interface MemoryReference {
  memoryId: string;
  conversationId?: string;
  source: 'message' | 'long_term_memory';
  similarityScore: number;
  scope: string;
}

export interface SemanticSearchResult {
  id: string;
  content: string;
  similarity: number;
  createdAt: Date;
  role?: string;
  memoryType?: string;
  importance?: number;
  accessCount?: number;
  lastAccessedAt?: Date | null;
  source: 'message' | 'long_term_memory';
  conversationId?: string;
  scope?: string;
}

export interface HybridRankedResult extends SemanticSearchResult {
  finalScore: number;
  provenance: MemoryReference;
}

export interface MemoryTelemetry {
  retrievalLatencyMs: number;
  embeddingLatencyMs: number;
  retrievedMessages: number;
  retrievedMemories: number;
  rankingDurationMs: number;
  embeddingProvider: string;
  compressionTriggered?: boolean;
}
