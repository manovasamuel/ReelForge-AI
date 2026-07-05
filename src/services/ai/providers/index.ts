import type { IAIProvider } from "../provider.interface";
import { AIOrchestratorProvider } from "./orchestrator.provider";

/**
 * AI Provider Factory — ReelForge AI v2.0 Phase 5.
 *
 * Single point of switch returning the configured AIOrchestratorProvider.
 */
export function getAIOrchestrator(preferredProvider?: string, modelPreference?: string): IAIProvider {
  return new AIOrchestratorProvider(preferredProvider, modelPreference);
}
