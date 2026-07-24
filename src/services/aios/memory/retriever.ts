/**
 * AIOS Retriever
 *
 * The entry point for all memory access in AIOS.
 * It delegates to the MemoryManager to pull raw documents across all layers,
 * then returns them for ranking.
 *
 * Design principle: The Retriever does NOT filter or sort.
 * It returns everything available. The Ranker decides quality.
 * This separation allows each component to be tested and replaced independently.
 */

import { memoryManager, type MemoryDocument, type MemoryQueryOptions } from './memory.manager';

export class Retriever {
  private static instance: Retriever;

  static getInstance(): Retriever {
    if (!Retriever.instance) {
      Retriever.instance = new Retriever();
    }
    return Retriever.instance;
  }

  /**
   * Retrieves all available memory documents for the current query context.
   * Returns raw, unsorted documents.
   */
  async retrieve(options: MemoryQueryOptions): Promise<MemoryDocument[]> {
    console.log(`[Retriever] Retrieving memory for workflow: ${options.workflowId}`);

    const docs = await memoryManager.retrieve(options);

    console.log(`[Retriever] Retrieved ${docs.length} documents across layers: ${
      [...new Set(docs.map(d => d.layer))].join(', ')
    }`);

    return docs;
  }
}

export const retriever = Retriever.getInstance();
