import type { CapabilityCriteria, IAIProvider, ProviderCapability, AIProviderId, RoutingDecision } from "../provider.interface";
import { aiProviderRegistry } from "./provider.registry";
import { CircuitBreakerStore } from "@/lib/reliability/circuit-breaker";

export const RoutingWeights = {
  capabilityMatch: 40,
  latency: 25,
  reasoning: 20,
  cost: 10,
  reliability: 5,
};

export interface RoutedProvider {
  provider: IAIProvider;
  decision: RoutingDecision;
}

/**
 * Capability Router — AI Platform Infrastructure V2
 *
 * Scores and orders AI providers dynamically based on requested capability criteria,
 * cost preferences, latency, reasoning levels, and real-time reliability metrics.
 */
export class CapabilityRouter {
  /**
   * Evaluates registered providers against the provided criteria and returns
   * an ordered list (fallback chain) of providers from best fit to worst fit.
   */
  public static route(criteria: CapabilityCriteria = {}): RoutedProvider[] {
    const providers = aiProviderRegistry.getAvailableProviders();

    const rejectedProviders: { id: AIProviderId; reason: string }[] = [];
    const validProviders: RoutedProvider[] = [];

    for (const provider of providers) {
      const evaluation = this.scoreProvider(provider, criteria);
      if (evaluation.score <= 0) {
        rejectedProviders.push({ id: provider.id, reason: evaluation.reason });
      } else {
        validProviders.push({
          provider,
          decision: {
            selectedProvider: provider.id,
            score: evaluation.score,
            matchedCapabilities: evaluation.matchedCapabilities,
            rejectedProviders, // will be populated correctly later
            routingReason: evaluation.reason,
          }
        });
      }
    }

    // Sort descending by score
    validProviders.sort((a, b) => b.decision.score - a.decision.score);

    // Attach the common rejected providers list to all valid providers
    for (const vp of validProviders) {
      vp.decision.rejectedProviders = rejectedProviders;
    }

    return validProviders;
  }

  /**
   * Calculates a numeric score for a provider based on criteria match.
   * Returns score 0 and a rejection reason if strict capability requirements are not met.
   */
  private static scoreProvider(provider: IAIProvider, criteria: CapabilityCriteria): { score: number, reason: string, matchedCapabilities: string[] } {
    const capabilities = provider.capabilities;
    const metadata = provider.metadata;
    let score = RoutingWeights.capabilityMatch; // Base capability score
    const matchedCapabilities: string[] = [];

    // --- Hard Capability Matches (if missing, score = 0) ---
    if (criteria.requiresStreaming && !capabilities.streaming) return { score: 0, reason: "Requires streaming", matchedCapabilities: [] };
    if (criteria.requiresStreaming && capabilities.streaming) matchedCapabilities.push("streaming");

    if (criteria.requiresVision && !capabilities.vision) return { score: 0, reason: "Requires vision", matchedCapabilities: [] };
    if (criteria.requiresVision && capabilities.vision) matchedCapabilities.push("vision");

    if (criteria.requiresJson && !capabilities.json) return { score: 0, reason: "Requires JSON output", matchedCapabilities: [] };
    if (criteria.requiresJson && capabilities.json) matchedCapabilities.push("json");

    if (criteria.requiresToolCalling && !capabilities.toolCalling) return { score: 0, reason: "Requires tool calling", matchedCapabilities: [] };
    if (criteria.requiresToolCalling && capabilities.toolCalling) matchedCapabilities.push("toolCalling");

    if (criteria.minimumContextWindow && capabilities.contextWindow < criteria.minimumContextWindow) return { score: 0, reason: "Insufficient context window", matchedCapabilities: [] };
    if (criteria.minimumContextWindow) matchedCapabilities.push("contextWindow");

    // --- Latency Scoring ---
    if (criteria.latency) {
      score += this.calculateLatencyScore(criteria.latency, capabilities.latency) * (RoutingWeights.latency / 20);
    } else {
      // Default preference for faster models slightly
      if (capabilities.latency === "ultra-low") score += RoutingWeights.latency * 0.4;
      if (capabilities.latency === "low") score += RoutingWeights.latency * 0.2;
    }

    // --- Reasoning Scoring ---
    if (criteria.reasoning) {
      score += this.calculateReasoningScore(criteria.reasoning, capabilities.reasoning) * (RoutingWeights.reasoning / 20);
    } else {
      // Default preference for higher reasoning
      if (capabilities.reasoning === "complex") score += RoutingWeights.reasoning * 0.75;
      if (capabilities.reasoning === "high") score += RoutingWeights.reasoning * 0.5;
    }

    // --- Cost Scoring ---
    const cost = metadata?.costPer1kOutputTokensMilliCents || 1000; 
    if (criteria.costPreference === "lowest") {
      score += Math.max(0, RoutingWeights.cost - (cost / 100)); // lower cost = more points
    } else if (criteria.costPreference === "balanced") {
      score += Math.max(0, (RoutingWeights.cost * 0.5) - (cost / 200));
    }

    // --- Reliability Scoring ---
    const circuitEntry = CircuitBreakerStore.getEntrySync(provider.id);
    if (circuitEntry) {
      const now = Date.now();
      const FAILURE_THRESHOLD = 3;
      const COOLDOWN_MS = 60_000;
      
      if (circuitEntry.consecutiveFailures >= FAILURE_THRESHOLD) {
        if (circuitEntry.lastFailureTime && now - circuitEntry.lastFailureTime < COOLDOWN_MS) {
          return { score: 0, reason: "Circuit breaker open", matchedCapabilities };
        }
        score -= RoutingWeights.reliability * 4; // Penalize half-open heavily
      }
      
      score -= (circuitEntry.consecutiveFailures * (RoutingWeights.reliability * 2));
    } else {
      score += RoutingWeights.reliability; // Reward healthy circuit
    }

    return { score: Math.round(score), reason: "Capabilities matched", matchedCapabilities };
  }

  /**
   * Helper to score latency matching.
   */
  private static calculateLatencyScore(requested: string, actual: string): number {
    const levels = { "high": 1, "medium": 2, "low": 3, "ultra-low": 4 };
    const reqValue = levels[requested as keyof typeof levels] || 2;
    const actValue = levels[actual as keyof typeof levels] || 2;

    if (actValue >= reqValue) {
      // Met or exceeded
      return (actValue - reqValue) * 10 + 20; // Reward exceeding latency requirements
    } else {
      // Missed latency requirement (not a hard fail, but penalized)
      return (actValue - reqValue) * 15; 
    }
  }

  /**
   * Helper to score reasoning matching.
   */
  private static calculateReasoningScore(requested: string, actual: string): number {
    const levels = { "low": 1, "medium": 2, "high": 3, "complex": 4 };
    const reqValue = levels[requested as keyof typeof levels] || 2;
    const actValue = levels[actual as keyof typeof levels] || 2;

    if (actValue >= reqValue) {
      return (actValue - reqValue) * 5 + 20; // Met or exceeded
    } else {
      // Missed reasoning requirement. Severe penalty because dumb models hallucinate on complex tasks.
      return (actValue - reqValue) * 30; 
    }
  }
}
