/**
 * AIOS Model Performance Manager
 *
 * Tracks the historical success and failure rates of models per capability.
 * This data is used by the Model Router to dynamically adjust model scoring.
 * E.g., Groq might be 95% successful for scripts, but only 80% for captions.
 */

export interface CapabilityPerformance {
  successes: number;
  failures: number;
  totalRuns: number;
}

export class ModelPerformanceManager {
  private static instance: ModelPerformanceManager;
  
  // Map: ModelID -> Capability -> Performance
  private performanceData: Map<string, Map<string, CapabilityPerformance>> = new Map();

  static getInstance(): ModelPerformanceManager {
    if (!ModelPerformanceManager.instance) {
      ModelPerformanceManager.instance = new ModelPerformanceManager();
    }
    return ModelPerformanceManager.instance;
  }

  /**
   * Record a successful orchestration run for a model/capability.
   */
  recordSuccess(modelId: string, capability: string): void {
    const perf = this.getOrCreatePerformance(modelId, capability);
    perf.successes += 1;
    perf.totalRuns += 1;
  }

  /**
   * Record a failed orchestration run for a model/capability.
   */
  recordFailure(modelId: string, capability: string): void {
    const perf = this.getOrCreatePerformance(modelId, capability);
    perf.failures += 1;
    perf.totalRuns += 1;
  }

  /**
   * Get the historical success rate (0.0 to 1.0) for a model/capability.
   * If insufficient data, defaults to 0.95 (assume good until proven otherwise).
   */
  getSuccessRate(modelId: string, capability: string): number {
    const perf = this.getOrCreatePerformance(modelId, capability);
    if (perf.totalRuns < 5) return 0.95; // Not enough data, optimistic default
    return perf.successes / perf.totalRuns;
  }

  private getOrCreatePerformance(modelId: string, capability: string): CapabilityPerformance {
    if (!this.performanceData.has(modelId)) {
      this.performanceData.set(modelId, new Map());
    }
    
    const capMap = this.performanceData.get(modelId)!;
    
    if (!capMap.has(capability)) {
      capMap.set(capability, {
        successes: 0,
        failures: 0,
        totalRuns: 0
      });
    }
    
    return capMap.get(capability)!;
  }
}

export const modelPerformanceManager = ModelPerformanceManager.getInstance();
