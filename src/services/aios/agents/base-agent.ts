/**
 * AIOS Base Agent
 *
 * Abstract base class all specialized agents must extend.
 *
 * Enforced Architecture Rules:
 * 1. An agent NEVER calls another agent directly.
 *    It returns its output to the Orchestrator via context store.
 * 2. An agent NEVER references a model name.
 *    It requests a capability via executeCapability().
 * 3. An agent reads prior context exclusively from the workflowState.contextStore (L0).
 * 4. An agent writes its output via context.completeNode() — never directly.
 */

import type { CapabilityName } from '../capability-registry';
import type { TaskType } from '../agent-registry';
import { promptRegistry } from '../governance/prompt-registry';
import { modelRouter } from '../governance/model-router';
import { providerHealthManager } from '../governance/provider-health.manager';
import { modelPerformanceManager } from '../observability/model-performance.manager';
import { costOptimizer } from '../observability/cost-optimizer';
import { AIClientFactory } from '../governance/ai-client.factory';
import type { AIPromptPayload } from '../../ai/provider.interface';

export interface AgentContext {
  workflowId: string;
  nodeId: string;
  taskType: TaskType;
  /** Raw user message */
  userMessage: string;
  /** Profile context (username, niche, etc.) */
  profileContext: Record<string, any>;
  /** L0 Context Store — outputs from previously completed nodes */
  contextStore: Record<string, any>;
  /**
   * Enriched context from the AIOS Memory Pipeline (Retriever → Ranker → Compressor → Builder).
   * Contains AKP patterns, profile intelligence, workspace content, conversation history.
   * Agents should inject this into their prompts for AKP-powered generation.
   */
  enrichedContext?: string;
  /** Extracted AKP patterns for direct use */
  akpPatterns?: string[];
  /** Optional: Failure injection for E2E testing */
  testInjection?: {
    failureMode?: 'timeout' | 'rate_limit' | '500';
    failOnNodeId?: string;
  };
}

export interface AgentResult {
  success: boolean;
  output: any;
  capabilityUsed: CapabilityName;
  tokensUsed?: number;
  latencyMs?: number;
  modelUsed?: string;
  providerUsed?: string;
  error?: string;
}

export abstract class BaseAgent {
  abstract readonly name: string;
  abstract readonly taskType: TaskType;
  abstract readonly primaryCapability: CapabilityName;

  /**
   * Execute the agent's task.
   * Each agent implements this with full context available from the store.
   */
  abstract execute(context: AgentContext): Promise<AgentResult>;

  /**
   * Helper: Read an upstream agent's output from context store.
   * This is the ONLY sanctioned way for an agent to receive data from another agent.
   */
  protected readUpstreamOutput(contextStore: Record<string, any>, nodeId: string): any {
    const result = contextStore[nodeId];
    if (!result) {
      console.warn(`[${this.name}] Upstream output for node '${nodeId}' not found in context store.`);
    }
    return result;
  }

  /**
   * AIOS Sprint 3: Governance & Observability wrapper for execution.
   * Handles model routing, prompt fetching, provider health tracking, and performance logging.
   */
  protected async executeWithGovernance(
    context: AgentContext,
    fallbackSystemPrompt: string,
    userPrompt: string
  ): Promise<AgentResult> {
    const start = Date.now();
    
    // 1. Prompt Registry: Try to fetch versioned prompt
    let systemPrompt = fallbackSystemPrompt;
    try {
      // name map: ScriptAgent -> script
      const promptName = this.name.replace('Agent', '').toLowerCase();
      const template = promptRegistry.getPrompt(promptName);
      systemPrompt = template.content + (context.enrichedContext ? `\n\n${context.enrichedContext}` : '');
      this.log(`Loaded prompt from registry: ${promptName} v${template.metadata.version}`);
    } catch {
      // Use fallback if not registered yet
    }

    // 2. Model Router: Select optimal model
    let routingResult;
    try {
       routingResult = modelRouter.route(this.primaryCapability);
    } catch (e: any) {
       this.error(`Model Routing Failed: ${e.message}`);
       return { success: false, output: null, capabilityUsed: this.primaryCapability, error: e.message };
    }
    
    const { model } = routingResult;

    // 3. Execute against Provider
    try {
      const providerClient = AIClientFactory.createClient(model);
      
      // -- FAILURE INJECTION FOR E2E TESTING --
      if (context.testInjection && context.testInjection.failureMode) {
        if (!context.testInjection.failOnNodeId || context.testInjection.failOnNodeId === context.nodeId) {
           if (context.testInjection.failureMode === 'timeout') {
              throw new Error("Provider request timed out.");
           } else if (context.testInjection.failureMode === 'rate_limit') {
              throw new Error("429 Too Many Requests");
           } else if (context.testInjection.failureMode === '500') {
              throw new Error("500 Internal Server Error");
           }
        }
      }
      // ---------------------------------------

      const payload: AIPromptPayload<any> = {
        systemPrompt,
        userPrompt,
        schemaType: "json",
        expectedSchemaDescription: 'See specific instructions in prompt.',
        fallbackData: {} as any,
        maxOutputTokens: 2048,
        temperature: 0.3
      };

      const response = await providerClient.generateStructured<any>(payload);
      const latencyMs = Date.now() - start;
      const tokens = response.telemetry.usage?.totalTokens || 0;

      // 4. Governance & Observability Logging (Success)
      providerHealthManager.recordSuccess(model.provider, latencyMs);
      modelPerformanceManager.recordSuccess(model.id, this.primaryCapability);
      costOptimizer.calculateExecutionCost({
        modelCostPer1kTokens: model.costPer1kTokens,
        tokensUsed: tokens,
        originalContextTokens: tokens, // simplified for MVP
        wasCached: false
      });

      return {
        success: true,
        output: response.data,
        capabilityUsed: this.primaryCapability,
        tokensUsed: tokens,
        latencyMs,
        modelUsed: model.id,
        providerUsed: model.provider,
      };
    } catch (e: any) {
      const latencyMs = Date.now() - start;
      
      // 4. Governance & Observability Logging (Failure)
      providerHealthManager.recordFailure(model.provider);
      modelPerformanceManager.recordFailure(model.id, this.primaryCapability);
      
      this.error(e.message);
      return { 
        success: false, 
        output: null, 
        capabilityUsed: this.primaryCapability, 
        modelUsed: model.id,
        providerUsed: model.provider,
        latencyMs,
        error: e.message 
      };
    }
  }

  /**
   * Helper: Build prompt with upstream context injected.
   * Encourages consistent context injection patterns.
   */
  protected buildContextualPrompt(
    basePrompt: string,
    contextStore: Record<string, any>,
    relevantNodeIds: string[]
  ): string {
    const upstreamContext = relevantNodeIds
      .map(id => contextStore[id])
      .filter(Boolean)
      .map(output => `\n\n--- Context from upstream agent ---\n${typeof output === 'string' ? output : JSON.stringify(output, null, 2)}`)
      .join('');

    return `${basePrompt}${upstreamContext}`;
  }

  protected log(message: string): void {
    console.log(`[${this.name}] ${message}`);
  }

  protected error(message: string): void {
    console.error(`[${this.name}] ERROR: ${message}`);
  }
}
