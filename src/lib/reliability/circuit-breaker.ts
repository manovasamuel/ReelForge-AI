export interface CircuitBreakerEntry {
  consecutiveFailures: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  qualityScores?: Record<string, number>;
}

/**
 * Distributed Circuit Breaker Store — ReelForge AI v2.0 Phase 6 Hardening (REL-001).
 *
 * Provides hybrid L1 (in-memory) and L2 (Upstash Redis distributed cache) storage
 * for circuit breaker health states across multi-instance serverless deployments.
 *
 * In Production with Upstash Redis configured: coordinates failures and cooldown
 * timers across all stateless container instances.
 * In Offline / Dev / CI Test mode without Redis: falls back to deterministic L1 in-memory tracking.
 */
export class CircuitBreakerStore {
  // L1 In-Memory Cache (serves synchronous readers and acts as offline/fallback store)
  private static readonly l1Cache = new Map<string, CircuitBreakerEntry>();

  private static isRedisConfigured(): boolean {
    return (
      Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
      Boolean(process.env.UPSTASH_REDIS_REST_TOKEN) &&
      !process.env.UPSTASH_REDIS_REST_URL?.includes("placeholder")
    );
  }

  /**
   * Retrieves circuit breaker state for a provider.
   * Checks L2 distributed cache if available, updating L1.
   */
  public static async getEntry(providerId: string): Promise<CircuitBreakerEntry> {
    if (this.isRedisConfigured()) {
      try {
        const url = `${process.env.UPSTASH_REDIS_REST_URL}/get/cb:${providerId}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.result) {
            const parsed = JSON.parse(json.result) as CircuitBreakerEntry;
            this.l1Cache.set(providerId, parsed);
            return parsed;
          }
        }
      } catch (err) {
        console.warn(`[CircuitBreakerStore] L2 Redis fetch failed for ${providerId}, using L1 fallback:`, err);
      }
    }

    return this.l1Cache.get(providerId) || { consecutiveFailures: 0 };
  }

  /**
   * Synchronous getter reading from L1 cache (for health dashboard endpoints).
   */
  public static getEntrySync(providerId: string): CircuitBreakerEntry {
    return this.l1Cache.get(providerId) || { consecutiveFailures: 0 };
  }

  /**
   * Records a successful execution, resetting failure count.
   */
  public static async recordSuccess(providerId: string): Promise<void> {
    const entry: CircuitBreakerEntry = {
      consecutiveFailures: 0,
      lastSuccessTime: Date.now(),
    };
    this.l1Cache.set(providerId, entry);

    if (this.isRedisConfigured()) {
      try {
        const url = `${process.env.UPSTASH_REDIS_REST_URL}/set/cb:${providerId}`;
        await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
          body: JSON.stringify(JSON.stringify(entry)),
        });
      } catch (err) {
        console.warn(`[CircuitBreakerStore] L2 Redis recordSuccess failed for ${providerId}:`, err);
      }
    }
  }

  /**
   * Records a failed execution and increments failure counter.
   * If threshold is reached, sets Redis TTL to expire after cooldownMs.
   */
  public static async recordFailure(providerId: string, cooldownMs: number = 60000): Promise<void> {
    const current = await this.getEntry(providerId);
    const entry: CircuitBreakerEntry = {
      consecutiveFailures: current.consecutiveFailures + 1,
      lastFailureTime: Date.now(),
      lastSuccessTime: current.lastSuccessTime,
    };
    this.l1Cache.set(providerId, entry);

    if (this.isRedisConfigured()) {
      try {
        // Store with TTL equal to cooldown window * 2 to keep failure history while cooldown is active
        const ttlSeconds = Math.ceil((cooldownMs * 2) / 1000);
        const url = `${process.env.UPSTASH_REDIS_REST_URL}/set/cb:${providerId}?ex=${ttlSeconds}`;
        await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
          body: JSON.stringify(JSON.stringify(entry)),
        });
      } catch (err) {
        console.warn(`[CircuitBreakerStore] L2 Redis recordFailure failed for ${providerId}:`, err);
      }
    }
  }

  /**
   * Evaluates if a provider is healthy and allowed to execute.
   */
  public static async isHealthy(providerId: string, threshold: number, cooldownMs: number): Promise<boolean> {
    if (providerId === "mock" || providerId === "deterministic") return true;

    const entry = await this.getEntry(providerId);
    if (entry.consecutiveFailures < threshold) return true;

    const now = Date.now();
    if (entry.lastFailureTime && now - entry.lastFailureTime > cooldownMs) {
      // Cooldown expired: allow half-open probe attempt
      return true;
    }

    return false;
  }

  /**
   * Updates the EMA quality score for a specific provider and schema domain.
   * Calculates the Exponential Moving Average: (alpha * newScore) + ((1 - alpha) * currentScore)
   */
  public static async updateQualityScore(
    providerId: string,
    schemaType: string,
    newScore: number,
    alpha: number = 0.3
  ): Promise<{ before: number; after: number }> {
    if (providerId === "mock" || providerId === "deterministic") {
      return { before: 100, after: 100 };
    }

    const current = await this.getEntry(providerId);
    const scores = current.qualityScores || {};
    
    // Default starting score is typically considered 85 if no history exists
    const before = scores[schemaType] !== undefined ? scores[schemaType] : 85;
    
    // EMA Formula
    const after = Math.round(alpha * newScore + (1 - alpha) * before);
    
    const entry: CircuitBreakerEntry = {
      ...current,
      qualityScores: {
        ...scores,
        [schemaType]: after
      }
    };
    
    this.l1Cache.set(providerId, entry);

    if (this.isRedisConfigured()) {
      try {
        const url = `${process.env.UPSTASH_REDIS_REST_URL}/set/cb:${providerId}`;
        await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
          body: JSON.stringify(JSON.stringify(entry)),
        });
      } catch (err) {
        console.warn(`[CircuitBreakerStore] L2 Redis updateQualityScore failed for ${providerId}:`, err);
      }
    }
    
    return { before, after };
  }
}
