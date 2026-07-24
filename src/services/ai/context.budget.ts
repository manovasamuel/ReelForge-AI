import type { AIMessage } from "./provider.interface";

export interface ContextBudgetInput {
  systemPrompt: string;
  summary?: string;
  memories?: string[];
  recentMessages: AIMessage[];
  maxContextTokens: number;
}

export interface ContextBudgetResult {
  systemPrompt: string;
  messages: AIMessage[];
  removedMessages: AIMessage[];
  summaryUsed: boolean;
  memoriesUsed: number;
  estimatedTokens: number;
  budgetBreached: boolean;
}

/**
 * Context Budget Manager — Conversational Memory V2 (Phase 4)
 * 
 * Responsibilities:
 * - Deterministically calculates token estimates using a fast heuristic (Chars / 4).
 * - Trims or drops context starting from oldest messages -> memories if the provider's context window is breached.
 * - Leaves a 15% safety buffer to account for output generation and tokenizer variations.
 */
export class ContextBudgetManager {
  private static readonly TOKEN_RATIO = 4; // Approx 4 chars per token
  private static readonly SAFETY_BUFFER_PERCENT = 0.15; // 15% buffer

  public static estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / this.TOKEN_RATIO);
  }

  public static optimizeContext(input: ContextBudgetInput): ContextBudgetResult {
    const safetyBuffer = Math.floor(input.maxContextTokens * this.SAFETY_BUFFER_PERCENT);
    const effectiveLimit = input.maxContextTokens - safetyBuffer;

    let currentTokens = 0;
    
    // 1. Mandatory base: System prompt
    const systemTokens = this.estimateTokens(input.systemPrompt);
    currentTokens += systemTokens;

    // 2. Summary
    let summaryUsed = false;
    let summaryText = "";
    if (input.summary) {
      const sumTokens = this.estimateTokens(input.summary);
      if (currentTokens + sumTokens <= effectiveLimit) {
        currentTokens += sumTokens;
        summaryUsed = true;
        summaryText = `\n\n=== CONVERSATION SUMMARY ===\n${input.summary}`;
      }
    }

    // 3. Current User Message (Always keep the latest message if possible)
    const messages = [...input.recentMessages];
    const keptMessages: AIMessage[] = [];
    const removedMessages: AIMessage[] = [];
    
    if (messages.length > 0) {
      const latestMsg = messages.pop()!;
      // Need to stringify tool results/calls if present, but for budget estimation we only count content roughly
      const msgContent = latestMsg.content || JSON.stringify(latestMsg.toolCalls || "") || JSON.stringify(latestMsg.toolResult || "");
      const msgTokens = this.estimateTokens(msgContent);
      currentTokens += msgTokens;
      keptMessages.unshift(latestMsg); // Always keep the latest
    }

    // 4. Memories (Prioritize over older messages)
    let memoriesUsed = 0;
    let memoriesText = "";
    if (input.memories && input.memories.length > 0) {
      const keptMemories: string[] = [];
      for (const memory of input.memories) {
        const memTokens = this.estimateTokens(memory);
        if (currentTokens + memTokens <= effectiveLimit) {
          currentTokens += memTokens;
          keptMemories.push(memory);
          memoriesUsed++;
        } else {
          break; // Stop adding memories if we hit the limit
        }
      }
      if (keptMemories.length > 0) {
        memoriesText = `\n\n=== RELEVANT MEMORY CONTEXT ===\n${keptMemories.join('\n\n')}`;
      }
    }

    // 5. Older Messages (Fill remaining budget, newest first)
    while (messages.length > 0) {
      const msg = messages.pop()!; // Pop from end (newest to oldest)
      const msgContent = msg.content || JSON.stringify(msg.toolCalls || "") || JSON.stringify(msg.toolResult || "");
      const msgTokens = this.estimateTokens(msgContent);
      
      if (currentTokens + msgTokens <= effectiveLimit) {
        currentTokens += msgTokens;
        keptMessages.unshift(msg); // Prepend to maintain chronological order
      } else {
        removedMessages.push(msg); // Track what we dropped (oldest ones get dropped)
        // Note: we can keep popping and try to fit smaller old messages, but usually it's contiguous
        break; // Stop adding older messages if we hit the limit to prevent context fragmentation
      }
    }

    // Include the remaining messages in removedMessages
    removedMessages.push(...messages);

    // Construct final system prompt
    const finalSystemPrompt = input.systemPrompt + summaryText + memoriesText;
    
    const budgetBreached = removedMessages.length > 0;

    return {
      systemPrompt: finalSystemPrompt,
      messages: keptMessages,
      removedMessages,
      summaryUsed,
      memoriesUsed,
      estimatedTokens: currentTokens,
      budgetBreached
    };
  }
}
