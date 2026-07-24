import type { IAIProvider } from "../provider.interface";
import { AIOrchestratorProvider } from "./orchestrator.provider";
import { GeminiProvider } from "./gemini.provider";
import { OpenAIProvider } from "./openai.provider";
import { ClaudeProvider } from "./claude.provider";
import { GroqProvider } from "./groq.provider";
import { OpenRouterProvider } from "./openrouter.provider";
import { aiProviderRegistry } from "./provider.registry";

export { GeminiProvider, OpenAIProvider, ClaudeProvider, GroqProvider, OpenRouterProvider, AIOrchestratorProvider };

/**
 * Initializes and registers all providers into the registry.
 */
export function bootstrapAIProviders() {
  aiProviderRegistry.register(new GeminiProvider());
  aiProviderRegistry.register(new OpenAIProvider());
  aiProviderRegistry.register(new ClaudeProvider());
  aiProviderRegistry.register(new GroqProvider());
  aiProviderRegistry.register(new OpenRouterProvider());
  // The Orchestrator itself might not need to be registered as a leaf node, but we can register it
  aiProviderRegistry.register(new AIOrchestratorProvider());
}

/**
 * AI Provider Factory — ReelForge AI v2.0 Phase 5.
 *
 * Single point of switch returning the configured AIOrchestratorProvider.
 */
export function getAIOrchestrator(preferredProvider?: string, modelPreference?: string): IAIProvider {
  return new AIOrchestratorProvider(preferredProvider, modelPreference);
}
