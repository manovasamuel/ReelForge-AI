/**
 * AIOS Provider Health Manager (Circuit Breaker)
 *
 * Tracks the health of configured AI providers to enable automatic failover
 * before requests fail.
 *
 * Circuit Breaker States:
 * - Healthy: Normal operation.
 * - Degraded: High latency or sporadic errors, but still functioning.
 * - Open (Blocked): Provider is failing. Requests are blocked.
 * - Half-Open: Testing recovery. A single request is allowed through.
 *
 * Cooldown Strategy:
 * Exponential backoff starts at 30s, scaling up to 300s.
 */

export type CircuitBreakerState = 'Healthy' | 'Degraded' | 'Open' | 'Half-Open';

interface ProviderHealth {
  providerId: string;
  state: CircuitBreakerState;
  failureCount: number;
  lastFailureTime: number | null;
  cooldownMs: number;
  averageLatencyMs: number;
}

export class ProviderHealthManager {
  private static instance: ProviderHealthManager;
  private healthRecords: Map<string, ProviderHealth> = new Map();

  // Configuration
  private readonly BASE_COOLDOWN_MS = 30 * 1000; // 30s
  private readonly MAX_COOLDOWN_MS = 300 * 1000; // 300s
  private readonly FAILURE_THRESHOLD = 3; // Consecutive failures before Open
  private readonly DEGRADED_LATENCY_THRESHOLD = 5000; // 5s avg latency = Degraded

  static getInstance(): ProviderHealthManager {
    if (!ProviderHealthManager.instance) {
      ProviderHealthManager.instance = new ProviderHealthManager();
    }
    return ProviderHealthManager.instance;
  }

  /**
   * Resets all provider health states (used for E2E test isolation).
   */
  reset(): void {
    this.healthRecords.clear();
  }

  /**
   * Evaluates if a provider is safe to use right now.
   * Handles state transitions (Open -> Half-Open -> Healthy).
   */
  isProviderHealthy(providerId: string): boolean {
    const health = this.getOrCreateHealth(providerId);

    if (health.state === 'Healthy' || health.state === 'Degraded') {
      return true;
    }

    if (health.state === 'Open') {
      const now = Date.now();
      const timeSinceFailure = now - (health.lastFailureTime || 0);

      if (timeSinceFailure >= health.cooldownMs) {
        // Cooldown expired, transition to Half-Open for testing
        health.state = 'Half-Open';
        console.log(`[ProviderHealth] Circuit for ${providerId} is now Half-Open (Testing recovery)`);
        return true; // Allow one request to test
      }
      return false; // Still cooling down
    }

    if (health.state === 'Half-Open') {
      // In Half-Open, we only let one request through to test.
      // We assume it's already testing, so block others until success/fail is reported.
      return false;
    }

    return false;
  }

  /**
   * Report a successful execution. Heals the circuit breaker.
   */
  recordSuccess(providerId: string, latencyMs: number): void {
    const health = this.getOrCreateHealth(providerId);

    // Update moving average latency
    health.averageLatencyMs = health.averageLatencyMs === 0 
      ? latencyMs 
      : (health.averageLatencyMs * 0.8) + (latencyMs * 0.2);

    health.failureCount = 0;
    health.lastFailureTime = null;
    health.cooldownMs = this.BASE_COOLDOWN_MS;

    if (health.averageLatencyMs > this.DEGRADED_LATENCY_THRESHOLD) {
      if (health.state !== 'Degraded') {
        console.warn(`[ProviderHealth] ${providerId} is Degraded (High Latency: ${Math.round(health.averageLatencyMs)}ms)`);
      }
      health.state = 'Degraded';
    } else {
      if (health.state !== 'Healthy') {
        console.log(`[ProviderHealth] ${providerId} is now Healthy.`);
      }
      health.state = 'Healthy';
    }
  }

  /**
   * Report a failed execution. Triggers circuit breaker if threshold met.
   */
  recordFailure(providerId: string): void {
    const health = this.getOrCreateHealth(providerId);
    health.failureCount += 1;
    health.lastFailureTime = Date.now();

    if (health.state === 'Half-Open' || health.failureCount >= this.FAILURE_THRESHOLD) {
      health.state = 'Open';
      
      // Exponential backoff
      health.cooldownMs = Math.min(
        this.BASE_COOLDOWN_MS * Math.pow(2, health.failureCount - this.FAILURE_THRESHOLD),
        this.MAX_COOLDOWN_MS
      );
      
      console.error(`[ProviderHealth] ${providerId} Circuit OPENED. Cooldown: ${health.cooldownMs / 1000}s`);
    } else if (health.state === 'Healthy') {
      health.state = 'Degraded';
      console.warn(`[ProviderHealth] ${providerId} is Degraded (Failures: ${health.failureCount})`);
    }
  }

  /**
   * Returns current state for routing decisions.
   */
  getHealthState(providerId: string): CircuitBreakerState {
    // Calling isProviderHealthy ensures time-based transitions (Open -> Half-Open) are processed
    this.isProviderHealthy(providerId); 
    return this.getOrCreateHealth(providerId).state;
  }

  getLatency(providerId: string): number {
    return this.getOrCreateHealth(providerId).averageLatencyMs;
  }

  private getOrCreateHealth(providerId: string): ProviderHealth {
    if (!this.healthRecords.has(providerId)) {
      this.healthRecords.set(providerId, {
        providerId,
        state: 'Healthy',
        failureCount: 0,
        lastFailureTime: null,
        cooldownMs: this.BASE_COOLDOWN_MS,
        averageLatencyMs: 0,
      });
    }
    return this.healthRecords.get(providerId)!;
  }
}

export const providerHealthManager = ProviderHealthManager.getInstance();
