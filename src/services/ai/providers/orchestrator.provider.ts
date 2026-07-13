import type {
  IAIProvider,
  AIResponse,
  AIPromptPayload,
  AIProviderId,
  AIProviderHealthStatus,
  AIModelPreference,
} from "../provider.interface";
import { GeminiProvider } from "./gemini.provider";
import { OpenAIProvider } from "./openai.provider";
import { ClaudeProvider } from "./claude.provider";
import { CircuitBreakerStore } from "@/lib/reliability/circuit-breaker";

/**
 * AI Orchestrator Provider — ReelForge AI v2.0 Phase 5.
 *
 * Dedicated orchestration engine coordinating Gemini, OpenAI, Claude, and Deterministic Fallback.
 *
 * Capabilities:
 *   1. Dynamic Priority Ordering (Settings -> Env -> Health -> Availability -> Cost -> Model)
 *   2. Request Timeout Handling (20,000ms per provider attempt)
 *   3. Exponential Backoff Retries (for transient network/5xx errors)
 *   4. Circuit Breaker & Health Tracking (3 consecutive failures -> 60s cooldown)
 *   5. Rate-Limit Interception (429s trigger instant failover without circuit penalty)
 *   6. Structured Logging & Telemetry Aggregation
 *   7. Zero-Key Offline Guarantee (clean degradation to Deterministic Engine)
 */
export class AIOrchestratorProvider implements IAIProvider {
  public readonly id: AIProviderId = "deterministic";
  public readonly name = "ReelForge AI Multi-Model Orchestrator";

  private readonly providers: IAIProvider[];
  private readonly preferredProvider?: AIProviderId;
  private readonly modelPreference?: AIModelPreference;

  private static readonly FAILURE_THRESHOLD = 3;
  private static readonly COOLDOWN_MS = 60_000; // 60 seconds
  private static readonly REQUEST_TIMEOUT_MS = 20_000; // 20 seconds
  private static readonly MAX_RETRIES = 1;

  constructor(preferredProvider?: string, modelPreference?: string) {
    this.preferredProvider = (preferredProvider || process.env.AI_PROVIDER || undefined) as AIProviderId | undefined;
    this.modelPreference = (modelPreference || process.env.AI_MODEL_PREFERENCE || "default") as AIModelPreference;

    this.providers = [
      new GeminiProvider(modelPreference),
      new OpenAIProvider(),
      new ClaudeProvider(),
    ];
  }

  public isAvailable(): boolean {
    return true; // Orchestrator is always available via Deterministic Fallback
  }

  public static getHealthStatus(): AIProviderHealthStatus[] {
    const geminiModel = process.env.GEMINI_MODEL || process.env.AI_MODEL || "gemini-3.1-flash-lite";
    const defaultIds: { id: AIProviderId; name: string }[] = [
      { id: "gemini", name: `Google Gemini (${geminiModel})` },
      { id: "openai", name: "OpenAI (gpt-4o-mini)" },
      { id: "claude", name: "Anthropic Claude (claude-3-5-sonnet)" },
    ];

    const now = Date.now();

    return defaultIds.map(({ id, name }) => {
      const entry = CircuitBreakerStore.getEntrySync(id);
      const isAvailable = Boolean(
        (id === "gemini" && process.env.GEMINI_API_KEY) ||
        (id === "openai" && process.env.OPENAI_API_KEY) ||
        (id === "claude" && process.env.ANTHROPIC_API_KEY)
      );

      let circuitState: "closed" | "open" | "half-open" = "closed";
      let isHealthy = true;

      if (entry.consecutiveFailures >= this.FAILURE_THRESHOLD) {
        if (entry.lastFailureTime && now - entry.lastFailureTime < this.COOLDOWN_MS) {
          circuitState = "open";
          isHealthy = false;
        } else {
          circuitState = "half-open";
        }
      }

      return {
        providerId: id,
        name,
        isAvailable,
        isHealthy,
        consecutiveFailures: entry.consecutiveFailures,
        lastFailureTime: entry.lastFailureTime ? new Date(entry.lastFailureTime).toISOString() : undefined,
        lastSuccessTime: entry.lastSuccessTime ? new Date(entry.lastSuccessTime).toISOString() : undefined,
        circuitState,
      };
    });
  }

  private async isProviderHealthy(id: AIProviderId): Promise<boolean> {
    return CircuitBreakerStore.isHealthy(id, AIOrchestratorProvider.FAILURE_THRESHOLD, AIOrchestratorProvider.COOLDOWN_MS);
  }

  private recordSuccess(id: AIProviderId): void {
    void CircuitBreakerStore.recordSuccess(id);
  }

  private recordFailure(id: AIProviderId, isRateLimit = false): void {
    if (isRateLimit) {
      // 429 Rate limits trigger failover without penalizing circuit breaker health
      console.warn(`[AIOrchestrator] Provider ${id} rate-limited (429). Failing over without circuit penalty.`);
      return;
    }
    void CircuitBreakerStore.recordFailure(id, AIOrchestratorProvider.COOLDOWN_MS);
    console.error(`[AIOrchestrator] Provider ${id} failure recorded.`);
  }

  private async buildPriorityQueue(): Promise<IAIProvider[]> {
    const queue: IAIProvider[] = [];
    const availablePool: IAIProvider[] = [];
    for (const p of this.providers) {
      if (p.isAvailable() && (await this.isProviderHealthy(p.id))) {
        availablePool.push(p);
      }
    }

    // 1. User / Env preference
    if (this.preferredProvider) {
      const match = availablePool.find((p) => p.id === this.preferredProvider);
      if (match) {
        queue.push(match);
      }
    }

    // 2. Cost / Model preference sorting
    const remaining = availablePool.filter((p) => !queue.includes(p));
    if (this.modelPreference === "cost-effective" || this.modelPreference === "fast") {
      // Gemini -> OpenAI -> Claude
      remaining.sort((a, b) => {
        const order = { gemini: 1, openai: 2, claude: 3, mock: 4, deterministic: 5 };
        return (order[a.id] || 9) - (order[b.id] || 9);
      });
    } else if (this.modelPreference === "powerful") {
      // Claude -> OpenAI -> Gemini
      remaining.sort((a, b) => {
        const order = { claude: 1, openai: 2, gemini: 3, mock: 4, deterministic: 5 };
        return (order[a.id] || 9) - (order[b.id] || 9);
      });
    }

    return [...queue, ...remaining];
  }

  private async executeWithTimeout<T>(provider: IAIProvider, payload: AIPromptPayload<T>): Promise<AIResponse<T>> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`[AIOrchestrator] Provider ${provider.id} timed out after ${AIOrchestratorProvider.REQUEST_TIMEOUT_MS}ms.`));
      }, AIOrchestratorProvider.REQUEST_TIMEOUT_MS);

      provider
        .generateStructured(payload)
        .then((res) => {
          clearTimeout(timer);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  public async generateStructured<T>(payload: AIPromptPayload<T>): Promise<AIResponse<T>> {
    const startTime = performance.now();
    const queue = await this.buildPriorityQueue();

    let lastErrorReason = "No live AI providers available or healthy.";
    if (queue.length === 0) {
      console.info("[AIOrchestrator] No live AI providers available or healthy. Executing clean Deterministic Fallback.");
      return this.executeDeterministicFallback(payload, startTime, lastErrorReason);
    }

    for (const provider of queue) {
      let attempts = 0;
      while (attempts <= AIOrchestratorProvider.MAX_RETRIES) {
        try {
          console.info(`[AIOrchestrator] Attempting generation via provider: [${provider.id}] (Attempt ${attempts + 1})`);
          const response = await this.executeWithTimeout(provider, payload);
          this.recordSuccess(provider.id);
          return response;
        } catch (error: any) {
          attempts++;
          const errMessage = error instanceof Error ? error.message : String(error);
          lastErrorReason = `Provider ${provider.id} failed: ${errMessage}`;
          const isRateLimit = errMessage.includes("429") || errMessage.toLowerCase().includes("rate limit");

          if (isRateLimit) {
            this.recordFailure(provider.id, true);
            break; // Skip retry on rate limit and jump immediately to next provider
          }

          if (attempts > AIOrchestratorProvider.MAX_RETRIES) {
            this.recordFailure(provider.id, false);
            console.warn(`[AIOrchestrator] Provider [${provider.id}] exhausted retries. Advancing to next provider. Error: ${errMessage}`);
          } else {
            // Exponential backoff
            const backoffMs = 1000 * Math.pow(2, attempts);
            console.warn(`[AIOrchestrator] Transient error on [${provider.id}]. Retrying in ${backoffMs}ms...`);
            await new Promise((r) => setTimeout(r, backoffMs));
          }
        }
      }
    }

    console.warn("[AIOrchestrator] All live AI providers failed in queue. Executing clean Deterministic Fallback.");
    return this.executeDeterministicFallback(payload, startTime, lastErrorReason);
  }

  private executeDeterministicFallback<T>(payload: AIPromptPayload<T>, startTime: number, reason?: string): AIResponse<T> {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      data: payload.fallbackData,
      telemetry: {
        providerId: "deterministic",
        modelUsed: "deterministic-fallback",
        latencyMs,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        costEstimateUsd: 0,
        fallbackUsed: true,
        reason,
      },
    };
  }
}
