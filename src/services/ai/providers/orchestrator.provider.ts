import type {
  IAIProvider,
  AIResponse,
  AIPromptPayload,
  AIProviderId,
  AIProviderHealthStatus,
  AIModelPreference,
} from "../provider.interface";
import { CapabilityRouter, type RoutedProvider } from "./capability.router";
import { aiProviderRegistry } from "./provider.registry";
import { CircuitBreakerStore } from "@/lib/reliability/circuit-breaker";
import { HermesGateway, initHermes } from "../../hermes";
import { MemoryService } from "../../memory/memory.service";
import { intelligenceRetrievalService } from "../../intelligence/retrieval.service";
import { CompressionEngine } from "../../memory/compression.engine";
import { ContextBudgetManager } from "../context.budget";
import type { ExecutionContext, HermesTelemetry } from "../../hermes/types";
import type { MemoryTelemetry } from "../../memory/types";
import { TelemetryRepository } from "../../telemetry/telemetry.repository";

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
  public readonly id: AIProviderId = "mock"; // Technically not used as a leaf node
  public readonly name = "AI Orchestrator Engine";

  public readonly capabilities = {
    reasoning: "complex" as const,
    latency: "medium" as const,
    streaming: true,
    vision: true,
    json: true,
    toolCalling: true,
    embeddings: true,
    contextWindow: 200000,
    maxOutputTokens: 16384,
    supportsImages: true,
    supportsAudio: true,
    supportsThinking: true,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
  };

  public readonly metadata = {
    providerId: "mock" as AIProviderId,
    defaultModel: "orchestrator",
    fastModel: "orchestrator",
  };

  private readonly preferredProvider?: string;
  private readonly modelPreference?: AIModelPreference;

  private static readonly FAILURE_THRESHOLD = 3;
  private static readonly COOLDOWN_MS = 60_000; // 60 seconds
  private static readonly REQUEST_TIMEOUT_MS = 20_000; // 20 seconds
  private static readonly MAX_RETRIES = 1;
  private static readonly MAX_TOOL_ITERATIONS = 5;

  private hermesGateway: HermesGateway;

  constructor(preferredProvider?: string, modelPreference?: string) {
    this.preferredProvider = preferredProvider || process.env.AI_PROVIDER || undefined;
    this.modelPreference = (modelPreference || process.env.AI_MODEL_PREFERENCE || "default") as AIModelPreference;
    initHermes();
    this.hermesGateway = new HermesGateway();
  }

  public isAvailable(): boolean {
    return true; // Orchestrator is always available via Deterministic Fallback
  }

  public static getHealthStatus(): AIProviderHealthStatus[] {
    const defaultIds = aiProviderRegistry.getAllProviders().map(p => ({ id: p.id, name: p.name, provider: p }));

    const now = Date.now();

    return defaultIds.map(({ id, name, provider }) => {
      const entry = CircuitBreakerStore.getEntrySync(id);
      const isAvailable = provider.isAvailable();

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

  private async buildPriorityQueue(payload?: AIPromptPayload<any>): Promise<RoutedProvider[]> {
    if (this.preferredProvider === "disabled" || this.preferredProvider === "deterministic" || this.preferredProvider === "mock") {
      return [];
    }

    const queue: RoutedProvider[] = [];
    const availablePool: RoutedProvider[] = [];
    
    // 1. Fetch capability-routed providers
    const routedProviders = CapabilityRouter.route(payload?.capabilities);

    // Filter by health
    for (const rp of routedProviders) {
      if (rp.provider.isAvailable() && (await this.isProviderHealthy(rp.provider.id))) {
        availablePool.push(rp);
      }
    }

    // 2. User / Env preference always takes precedence
    if (this.preferredProvider) {
      const match = availablePool.find((rp) => rp.provider.id === this.preferredProvider);
      if (match) {
        queue.push(match);
      }
    }

    const remaining = availablePool.filter((rp) => !queue.includes(rp));

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
    let memoryMetrics: MemoryTelemetry | undefined;

    // --- MEMORY RETRIEVAL & CONTEXT OPTIMIZATION (Phase 3 & 4 Integration) ---
    let summary: string | undefined;
    let memories: string[] = [];

    if (payload.conversationId && payload.executionContext?.userId) {
      const memStartTime = performance.now();
      try {
        const lastUserMessage = payload.conversationHistory?.findLast(m => m.role === 'user')?.content || payload.userPrompt;
        
        // --- PHASE 6: INTELLIGENCE RETRIEVAL LAYER ---
        const comprehensiveContext = await intelligenceRetrievalService.retrieveComprehensiveContext(
          lastUserMessage, 
          { 
            profileId: payload.executionContext.profileId, 
            workspaceId: payload.executionContext.workspaceId 
          }
        );
        
        if (comprehensiveContext && comprehensiveContext.trim().length > 0) {
          memories = [comprehensiveContext];
        }

        const conv = await MemoryService.getConversation(payload.conversationId);
        if (conv?.summary) {
          summary = conv.summary;
        }

        memoryMetrics = {
          retrievalLatencyMs: performance.now() - memStartTime,
          embeddingLatencyMs: 0,
          retrievedMessages: 0,
          retrievedMemories: 1,
          rankingDurationMs: 0,
          embeddingProvider: "gemini"
        };
      } catch (err) {
        console.error("[AIOrchestrator] Memory Retrieval Failed:", err);
      }
    }

    // Context Budget Optimization (assuming 128k max tokens for Gemini, adjust based on active provider queue if possible)
    const contextBudget = ContextBudgetManager.optimizeContext({
      systemPrompt: payload.systemPrompt,
      summary,
      memories,
      recentMessages: payload.conversationHistory || [],
      maxContextTokens: 128000 // Using a generous default, or can be dynamic based on provider
    });

    payload.systemPrompt = contextBudget.systemPrompt;
    payload.conversationHistory = contextBudget.messages;

    if (memoryMetrics) {
      memoryMetrics.compressionTriggered = contextBudget.budgetBreached;
    }

    if (contextBudget.budgetBreached && payload.conversationId) {
      // Emergency compression (synchronous)
      try {
        await CompressionEngine.emergencyCompress(payload.conversationId);
      } catch (e) {
        console.error("[AIOrchestrator] Emergency compression failed", e);
      }
    }

    if (this.preferredProvider === "deterministic" || process.env.AI_PROVIDER === "deterministic") {
      console.info("[AIOrchestrator] Explicit deterministic mode selected. Executing clean Deterministic Fallback.");
      return this.executeDeterministicFallback(payload, startTime, "Explicit deterministic mode selected");
    }

    const queue = await this.buildPriorityQueue(payload);

    let lastErrorReason = "No live AI providers available or healthy.";
    if (queue.length === 0) {
      console.info("[AIOrchestrator] No live AI providers available or healthy. Executing clean Deterministic Fallback.");
      return this.executeDeterministicFallback(payload, startTime, lastErrorReason);
    }

    let fallbackDepth = 0;
    for (const rp of queue) {
      const provider = rp.provider;
      const decision = rp.decision;
      let attempts = 0;
      while (attempts <= AIOrchestratorProvider.MAX_RETRIES) {
        try {
          console.info(`[AIOrchestrator] Attempting generation via provider: [${provider.id}] (Attempt ${attempts + 1})`);
          
          const currentPayload = { ...payload, conversationHistory: payload.conversationHistory || [] };
          let iteration = 0;
          let totalLatency = 0;
          const hermesExecutions: HermesTelemetry[] = [];
          
          while (iteration < AIOrchestratorProvider.MAX_TOOL_ITERATIONS) {
            const response = await this.executeWithTimeout(provider, currentPayload);
            totalLatency += response.telemetry.latencyMs;

            if (response.data !== null || (response.toolCalls && response.toolCalls.length === 0) || !response.toolCalls) {
              this.recordSuccess(provider.id);
              
              response.telemetry.routingReason = decision.routingReason;
              response.telemetry.selectedScore = decision.score;
              response.telemetry.fallbackDepth = fallbackDepth;
              response.telemetry.retryCount = attempts;
              response.telemetry.latencyMs = totalLatency;
              
              if (hermesExecutions.length > 0) {
                response.telemetry.hermesExecutions = hermesExecutions;
              }
              if (memoryMetrics) {
                response.telemetry.memoryMetrics = memoryMetrics;
              }
              
              // --- MEMORY PERSISTENCE (Phase 3 Integration) ---
              if (payload.conversationId && payload.executionContext?.userId) {
                // Ensure we persist the last user message and the generated assistant response
                const lastUserMessage = payload.conversationHistory?.findLast(m => m.role === 'user');
                if (lastUserMessage && !lastUserMessage.toolCalls) {
                  MemoryService.storeMessage(payload.conversationId, 'user', lastUserMessage.content).catch(console.error);
                }
                
                let assistantContent = "";
                if (typeof response.data === 'string') {
                  assistantContent = response.data;
                } else if (response.data) {
                  assistantContent = JSON.stringify(response.data);
                }
                
                MemoryService.storeMessage(
                  payload.conversationId, 
                  'assistant', 
                  assistantContent, 
                  response.toolCalls
                ).catch(console.error);
              }

              // --- TELEMETRY RECORDING (Phase 2 Integration) ---
              if (payload.executionContext?.workspaceId) {
                TelemetryRepository.logAIExecution({
                  workspaceId: payload.executionContext.workspaceId,
                  providerId: response.telemetry.providerId,
                  modelUsed: response.telemetry.modelUsed,
                  requestedModel: payload.executionContext?.correlationId, // Optional mapping
                  latencyMs: response.telemetry.latencyMs,
                  promptTokens: response.telemetry.usage?.promptTokens || 0,
                  completionTokens: response.telemetry.usage?.completionTokens || 0,
                  totalTokens: response.telemetry.usage?.totalTokens || 0,
                  costEstimateUsd: (response.telemetry.costEstimateUsd || 0).toString(),
                  fallbackUsed: response.telemetry.fallbackUsed || false,
                  reason: response.telemetry.routingReason || response.telemetry.reason,
                });
              }

              return response;
            }

            // Provider requested tool calls
            console.info(`[AIOrchestrator] Provider [${provider.id}] requested ${response.toolCalls.length} tool calls (Iteration ${iteration + 1})`);
            
            // Add the assistant's tool call request to the conversation history
            currentPayload.conversationHistory!.push({
              role: "assistant",
              content: "",
              toolCalls: response.toolCalls,
            });

            // Make sure Hermes knows about available tools (populates cache)
            await this.hermesGateway.getAvailableTools();

            // Execute all requested tools sequentially (or in parallel)
            for (const toolCall of response.toolCalls) {
              const executionContext: ExecutionContext = currentPayload.executionContext || {
                userId: "system", // Fallback for dev/unauthenticated flows
                workspaceId: "system-workspace",
                permissions: [],
                correlationId: `tool-${Date.now()}`
              };

              const { result, telemetry } = await this.hermesGateway.executeTool({
                toolName: toolCall.name,
                arguments: toolCall.arguments,
                context: executionContext,
              });

              hermesExecutions.push(telemetry);

              const resultString = JSON.stringify(result);

              // Add the tool execution result to the conversation history
              currentPayload.conversationHistory.push({
                role: "tool",
                content: resultString,
                toolResult: { id: toolCall.id, name: toolCall.name, result: resultString }
              });
              
              // --- MEMORY PERSISTENCE (Phase 3 Integration) ---
              if (payload.conversationId && payload.executionContext?.userId) {
                MemoryService.storeMessage(
                  payload.conversationId, 
                  'tool', 
                  resultString, 
                  undefined, 
                  { id: toolCall.id, name: toolCall.name, result: resultString }
                ).catch(console.error);
              }
            }
            
            iteration++;
          }
          
          throw new Error(`[AIOrchestrator] Exceeded maximum tool iterations (${AIOrchestratorProvider.MAX_TOOL_ITERATIONS}).`);
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
      fallbackDepth++;
    }

    console.warn("[AIOrchestrator] All live AI providers failed in queue. Executing clean Deterministic Fallback.");
    return this.executeDeterministicFallback(payload, startTime, lastErrorReason);
  }

  private executeDeterministicFallback<T>(payload: AIPromptPayload<T>, startTime: number, reason?: string): AIResponse<T> {
    const latencyMs = Math.round(performance.now() - startTime);
    const telemetry = {
      telemetryVersion: 1,
      timestamp: new Date().toISOString(),
      providerId: "deterministic" as const,
      modelUsed: "deterministic-fallback",
      latencyMs,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      costEstimateUsd: 0,
      fallbackUsed: true,
      reason,
    };

    if (payload.executionContext?.workspaceId) {
      TelemetryRepository.logAIExecution({
        workspaceId: payload.executionContext.workspaceId,
        providerId: telemetry.providerId,
        modelUsed: telemetry.modelUsed,
        latencyMs: telemetry.latencyMs,
        promptTokens: telemetry.usage.promptTokens,
        completionTokens: telemetry.usage.completionTokens,
        totalTokens: telemetry.usage.totalTokens,
        costEstimateUsd: telemetry.costEstimateUsd.toString(),
        fallbackUsed: telemetry.fallbackUsed,
        reason: telemetry.reason,
      });
    }

    return {
      data: payload.fallbackData,
      telemetry,
    };
  }
}
