/**
 * AIOS Agent Orchestrator
 *
 * The central coordinator of the AI Operating System.
 *
 * Responsibilities:
 * 1. Accept a classified & planned Task DAG from the Planner.
 * 2. Initialize Workflow State.
 * 3. Execute DAG layers in sequence; within each layer, dispatch parallelizable nodes concurrently.
 * 4. Route ALL inter-agent communication through the Workflow State's L0 Context Store.
 *    Agents NEVER communicate directly.
 * 5. Handle node-level retries and workflow-level failure recovery.
 * 6. Pass completed workflow state to the Response Composer.
 *
 * Architecture rules enforced here:
 * - Orchestrator uses AgentRegistry to find agents. It never instantiates them directly by class name.
 * - Orchestrator uses CapabilityRegistry to validate what each agent can do.
 * - Orchestrator manages ALL state transitions via WorkflowStateManager.
 */

import { classifierService, type ClassificationResult } from './classifier.service';
import { plannerService, type TaskDAG } from './planner.service';
import { workflowStateManager } from './workflow-state.manager';
import { agentRegistry } from './agent-registry';
import { responseComposer, type ComposedResponse } from './response-composer';
import { AGENT_CLASSES } from './agents/specialized-agents';
import { aiosContextBuilder } from './memory/context.builder';
import { observabilityManager, type OrchestrationTrace, type AgentExecutionTimeline } from './observability/observability.manager';
import { executionPolicyManager } from './execution-policy.manager';
import type { BaseAgent, AgentContext } from './agents/base-agent';
import type { DAGNode } from './planner.service';

export interface OrchestratorRequest {
  userMessage: string;
  profileContext: Record<string, any>;
  /** Optional: override classification for direct routing */
  forcedClassification?: Partial<ClassificationResult>;
  /** Optional: inject simulated failures for End-to-End testing */
  testInjection?: {
    failureMode?: 'timeout' | 'rate_limit' | '500';
    failOnNodeId?: string; // Only fail a specific node
  };
  /** Phase 4: Resume Capability */
  resumeWorkflowId?: string;
}

export interface OrchestratorResponse {
  composed: ComposedResponse;
  workflowId: string;
  dag: TaskDAG;
  classification: ClassificationResult;
  traceId: string;
}

export class AIOSOrchestrator {
  private static instance: AIOSOrchestrator;

  static getInstance(): AIOSOrchestrator {
    if (!AIOSOrchestrator.instance) {
      AIOSOrchestrator.instance = new AIOSOrchestrator();
    }
    return AIOSOrchestrator.instance;
  }

  async run(request: OrchestratorRequest): Promise<OrchestratorResponse> {
    console.log(`[AIOS Orchestrator] Starting pipeline for: "${request.userMessage.slice(0, 80)}..."`);

    // 1. Classify
    const classification: ClassificationResult = {
      ...classifierService.classify(request.userMessage),
      ...request.forcedClassification,
    };
    console.log(`[AIOS Orchestrator] Classification:`, classification);

    // 2. Plan (DAG)
    const dag = plannerService.plan(classification);
    if (request.resumeWorkflowId) {
      dag.workflowId = request.resumeWorkflowId;
    }
    console.log(`[AIOS Orchestrator] DAG has ${dag.nodes.length} nodes in ${dag.executionLayers.length} layers. WorkflowID: ${dag.workflowId}`);

    // 3. Initialize or Resume Workflow State
    let wfState;
    if (request.resumeWorkflowId) {
      wfState = await workflowStateManager.getWorkflow(dag.workflowId);
      await workflowStateManager.setWorkflowStatus(dag.workflowId, 'Running');
      console.log(`[AIOS Orchestrator] Resuming existing workflow: ${dag.workflowId}`);
    } else {
      wfState = await workflowStateManager.initWorkflow(
        dag.workflowId,
        dag.nodes.map(n => n.id),
        dag.nodes.map(n => n.taskType)
      );
    }

    // Initialize Trace
    const traceId = observabilityManager.generateTraceId();
    const trace: OrchestrationTrace = {
      traceId,
      workflowId: dag.workflowId,
      startTime: Date.now(),
      endTime: 0,
      totalDurationMs: 0,
      totalTokens: 0,
      timeline: [],
      success: false
    };

    // 4. Execute DAG layer by layer
    try {
      for (const layer of dag.executionLayers) {
        const parallelLayer = layer.filter(n => n.parallel);
        const sequentialLayer = layer.filter(n => !n.parallel);

        // Execute parallel nodes concurrently
        if (parallelLayer.length > 0) {
          await Promise.allSettled(parallelLayer.map(node => this.executeNode(node, dag.workflowId, request, trace)));
        }

        // Execute sequential nodes one by one
        for (const node of sequentialLayer) {
          await this.executeNode(node, dag.workflowId, request, trace);
        }
      }

      await workflowStateManager.setWorkflowStatus(dag.workflowId, 'Completed');
      trace.success = true;
    } catch (fatalError: any) {
      console.error(`[AIOS Orchestrator] Fatal workflow error:`, fatalError);
      await workflowStateManager.failWorkflow(dag.workflowId, fatalError.message);
      trace.success = false;
    }

    trace.endTime = Date.now();
    trace.totalDurationMs = trace.endTime - trace.startTime;

    // 5. Compose final response
    const finalState = await workflowStateManager.getWorkflow(dag.workflowId);
    const composed = responseComposer.compose(dag.workflowId, finalState.nodeStates, finalState.contextStore);

    await workflowStateManager.completeWorkflow(dag.workflowId, composed);

    // Finalize Observability Logging
    observabilityManager.logTrace(trace);

    return { composed, workflowId: dag.workflowId, dag, classification, traceId };
  }

  private async executeNode(node: DAGNode, workflowId: string, request: OrchestratorRequest, trace: OrchestrationTrace): Promise<void> {
    const wfState = await workflowStateManager.getWorkflow(workflowId);
    
    // Phase 2: Resume Capability - If the node's output already exists in the context store, skip execution
    if (wfState.contextStore[node.id] !== undefined) {
      await workflowStateManager.setNodeStatus(workflowId, node.id, 'Completed');
      console.log(`[AIOS Orchestrator] Node '${node.id}' skipped (Resume Capability - output already exists).`);
      return;
    }

    let retries = 0;
    
    const policy = executionPolicyManager.getPolicy(node.taskType);
    const maxRetries = policy.maxRetries;

    while (retries <= maxRetries) {
      const nodeStartTime = Date.now();
      try {
        await workflowStateManager.setNodeStatus(workflowId, node.id, 'Running');

        // Find agent via Registry (never hardcoded)
        const registration = agentRegistry.getAgentForTask(node.taskType);
        const AgentClass = AGENT_CLASSES[registration.name];

        if (!AgentClass) {
          throw new Error(`Agent class '${registration.name}' not implemented.`);
        }

        const agent: BaseAgent = new AgentClass();

        // Build enriched memory context via the full pipeline:
        // Memory Manager (L0-L5) → Retriever → Ranker → Compressor → Context Builder
        let enrichedContext: string | undefined;
        let akpPatterns: string[] | undefined;
        let memCtx: any;
        try {
          memCtx = await aiosContextBuilder.buildForAgent(
            {
              workflowId,
              profileId: request.profileContext.profileId || '',
              query: request.userMessage,
              sessionContextStore: { ...wfState.contextStore },
              conversationHistory: request.profileContext.conversationHistory,
              requiredLayers: registration.requiredLayers, // Phase 3: Selective Context Injection
            },
            registration.capabilities[0] // Use primary capability for budget selection
          );
          enrichedContext = memCtx.contextString;
          akpPatterns = memCtx.akpPatterns;
        } catch (memError) {
          console.warn(`[AIOS Orchestrator] Memory pipeline error for node '${node.id}' — proceeding without enriched context:`, memError);
        }

        // Build agent context — reading from L0 context store for upstream outputs
        const context: AgentContext = {
          workflowId,
          nodeId: node.id,
          taskType: node.taskType,
          userMessage: request.userMessage,
          profileContext: request.profileContext,
          contextStore: { ...wfState.contextStore },
          enrichedContext,
          akpPatterns,
          testInjection: request.testInjection,
        };

        const result = await agent.execute(context);
        const nodeEndTime = Date.now();
        const durationMs = nodeEndTime - nodeStartTime;

        if (result.success) {
          await workflowStateManager.completeNode(workflowId, node.id, result.output, {
            duration: durationMs,
            llmProvider: result.providerUsed || 'unknown',
            model: result.modelUsed || 'unknown',
            tokenUsage: result.tokensUsed || 0,
          });
          console.log(`[AIOS Orchestrator] Node '${node.id}' completed successfully in ${durationMs}ms.`);
          
          trace.timeline.push({
            nodeId: node.id,
            agentName: registration.name,
            startTime: nodeStartTime,
            endTime: nodeEndTime,
            durationMs,
            tokensUsed: result.tokensUsed || 0,
            modelId: result.modelUsed || 'unknown',
            provider: result.providerUsed || 'unknown',
            success: true,
            retrievalCount: Object.keys(memCtx?.layerSummary || {}).length,
            compressionRatio: 0 // Track actuals if available via agent result
          });
          trace.totalTokens += (result.tokensUsed || 0);

          return;
        } else {
          throw new Error(result.error || 'Agent returned failure without error message');
        }
      } catch (err: any) {
        retries++;
        await workflowStateManager.failNode(workflowId, node.id, err.message);
        console.warn(`[AIOS Orchestrator] Node '${node.id}' failed (attempt ${retries}): ${err.message}`);

        if (retries <= maxRetries) {
          await workflowStateManager.setWorkflowStatus(workflowId, 'Retrying' as any); // Or just don't set Retrying if not in strict state machine, 'Running' handles it
          await new Promise(r => setTimeout(r, 500 * retries)); // Exponential back-off
        } else {
          // Log failed timeline entry
          trace.timeline.push({
            nodeId: node.id,
            agentName: agentRegistry.getAgentForTask(node.taskType).name,
            startTime: nodeStartTime,
            endTime: Date.now(),
            durationMs: Date.now() - nodeStartTime,
            tokensUsed: 0,
            modelId: 'unknown',
            provider: 'unknown',
            success: false,
            error: err.message,
            retrievalCount: 0,
            compressionRatio: 0
          });
        }
      }
    }

    console.error(`[AIOS Orchestrator] Node '${node.id}' exhausted all retries.`);
  }
}

export const aiosOrchestrator = AIOSOrchestrator.getInstance();
