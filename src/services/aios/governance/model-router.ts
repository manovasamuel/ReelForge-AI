/**
 * AIOS Model Router
 *
 * Dynamically selects the optimal model for a given capability request.
 * Moves away from static model assignments to a dynamic, health-aware, 
 * cost-optimized routing strategy.
 */

import { providerHealthManager } from './provider-health.manager';
import { modelPerformanceManager } from '../observability/model-performance.manager';
import { capabilityRegistry, type CapabilityName } from '../capability-registry';

// Configurable Scoring Weights
export const ROUTER_WEIGHTS = {
  health: 0.30,
  quality: 0.25,
  latency: 0.15,
  cost: 0.10,
  json: 0.10,
  history: 0.10
};

export interface CandidateModel {
  id: string;
  provider: string;
  tier: 'Free' | 'Paid';
  baseQualityScore: number;
  baseLatencyMs: number;
  contextWindow: number;
  jsonReliability: number;
  costPer1kTokens: number;
}

// Simulated registry of available models (MVP)
const AVAILABLE_MODELS: CandidateModel[] = [
  { id: 'llama-3.3-70b-versatile', provider: 'groq', tier: 'Free', baseQualityScore: 0.85, baseLatencyMs: 600, contextWindow: 8192, jsonReliability: 0.9, costPer1kTokens: 0 },
  { id: 'llama-3.1-8b-instant', provider: 'groq', tier: 'Free', baseQualityScore: 0.75, baseLatencyMs: 300, contextWindow: 8192, jsonReliability: 0.8, costPer1kTokens: 0 },
  { id: 'gemini-1.5-flash', provider: 'gemini', tier: 'Free', baseQualityScore: 0.88, baseLatencyMs: 1200, contextWindow: 1048576, jsonReliability: 0.95, costPer1kTokens: 0 },
  { id: 'gemini-1.5-pro', provider: 'gemini', tier: 'Free', baseQualityScore: 0.95, baseLatencyMs: 2500, contextWindow: 2097152, jsonReliability: 0.99, costPer1kTokens: 0 },
  // Placeholder paid models (disabled for MVP free-first policy unless forced)
  { id: 'claude-3-5-sonnet', provider: 'anthropic', tier: 'Paid', baseQualityScore: 0.98, baseLatencyMs: 1500, contextWindow: 200000, jsonReliability: 0.99, costPer1kTokens: 3.0 },
];

export interface RoutingResult {
  model: CandidateModel;
  score: number;
  breakdown: Record<string, number>;
}

export class ModelRouter {
  private static instance: ModelRouter;

  static getInstance(): ModelRouter {
    if (!ModelRouter.instance) {
      ModelRouter.instance = new ModelRouter();
    }
    return ModelRouter.instance;
  }

  /**
   * Routes a capability request to the optimal model.
   * Enforces a Free-First Policy.
   */
  route(capabilityName: CapabilityName, requiredContextTokens: number = 0): RoutingResult {
    const capability = capabilityRegistry.getCapability(capabilityName);
    
    // 1. Filter candidates
    const validCandidates = AVAILABLE_MODELS.filter(model => {
      // Must fit the context window
      if (model.contextWindow < requiredContextTokens + capability.minContextWindow) {
        return false;
      }
      
      // Free-First Policy: filter out paid models unless explicitly required (not in MVP)
      if (model.tier === 'Paid') {
        return false;
      }

      // Must be healthy
      const healthState = providerHealthManager.getHealthState(model.provider);
      if (healthState === 'Open') {
        return false; // Circuit is open (blocked)
      }

      return true;
    });

    if (validCandidates.length === 0) {
      throw new Error(`[ModelRouter] No available models for capability: ${capabilityName}.`);
    }

    // 2. Score candidates
    const scoredCandidates = validCandidates.map(model => this.scoreModel(model, capabilityName));
    
    // 3. Sort by descending score
    scoredCandidates.sort((a, b) => b.score - a.score);

    const winner = scoredCandidates[0];
    console.log(`[ModelRouter] Routed '${capabilityName}' -> ${winner.model.id} (Score: ${winner.score.toFixed(2)})`);
    return winner;
  }

  private scoreModel(model: CandidateModel, capabilityName: CapabilityName): RoutingResult {
    const capability = capabilityRegistry.getCapability(capabilityName);
    const healthState = providerHealthManager.getHealthState(model.provider);
    
    // Calculate raw dimension scores (0.0 to 1.0)
    let healthScore = 1.0;
    if (healthState === 'Degraded') healthScore = 0.5;
    if (healthState === 'Half-Open') healthScore = 0.8; // Give it a chance to test

    const qualityScore = model.baseQualityScore;
    
    // Latency scoring (lower is better, cap at 5000ms for score)
    const currentProviderLatency = providerHealthManager.getLatency(model.provider) || model.baseLatencyMs;
    const latencyScore = Math.max(0, 1.0 - (currentProviderLatency / 5000));
    
    // Cost score (free = 1.0)
    const costScore = model.costPer1kTokens === 0 ? 1.0 : Math.max(0, 1.0 - (model.costPer1kTokens / 10));

    // JSON score (if capability requires JSON)
    const jsonScore = capability.requiresJson ? model.jsonReliability : 1.0;

    // History score
    const historyScore = modelPerformanceManager.getSuccessRate(model.id, capabilityName);

    // Apply weights
    const compositeScore = 
      (healthScore * ROUTER_WEIGHTS.health) +
      (qualityScore * ROUTER_WEIGHTS.quality) +
      (latencyScore * ROUTER_WEIGHTS.latency) +
      (costScore * ROUTER_WEIGHTS.cost) +
      (jsonScore * ROUTER_WEIGHTS.json) +
      (historyScore * ROUTER_WEIGHTS.history);

    return {
      model,
      score: compositeScore,
      breakdown: {
        health: healthScore * ROUTER_WEIGHTS.health,
        quality: qualityScore * ROUTER_WEIGHTS.quality,
        latency: latencyScore * ROUTER_WEIGHTS.latency,
        cost: costScore * ROUTER_WEIGHTS.cost,
        json: jsonScore * ROUTER_WEIGHTS.json,
        history: historyScore * ROUTER_WEIGHTS.history
      }
    };
  }
}

export const modelRouter = ModelRouter.getInstance();
