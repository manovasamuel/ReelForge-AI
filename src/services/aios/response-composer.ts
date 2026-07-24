/**
 * AIOS Response Composer
 *
 * Takes raw outputs from all agent runs in a workflow, validates them,
 * and merges them into a single, consistently-formatted unified response.
 *
 * Rule: No product feature ever assembles agent outputs directly.
 *       All merging happens here, ensuring consistent formatting.
 */

import type { NodeState } from './workflow-state.manager';

export interface ComposedResponse {
  success: boolean;
  workflowId: string;
  /** Primary output for the UI */
  primary: any;
  /** Secondary outputs (e.g., hashtags alongside a script) */
  supplementary: Record<string, any>;
  /** Summary of what was generated */
  summary: string;
  /** Total tokens used across all agents */
  totalTokensUsed: number;
  /** Total latency ms (critical path, not sum) */
  criticalPathLatencyMs: number;
  /** Any nodes that failed */
  failures: { nodeId: string; error: string }[];
}

export class ResponseComposer {
  private static instance: ResponseComposer;

  static getInstance(): ResponseComposer {
    if (!ResponseComposer.instance) {
      ResponseComposer.instance = new ResponseComposer();
    }
    return ResponseComposer.instance;
  }

  compose(
    workflowId: string,
    nodeStates: Record<string, NodeState>,
    contextStore: Record<string, any>
  ): ComposedResponse {
    const completedNodes = Object.values(nodeStates).filter(n => n.status === 'Completed');
    const failedNodes = Object.values(nodeStates).filter(n => n.status === 'Failed');

    // Identify primary output (the most "content-rich" completed node)
    const PRIMARY_ORDER = ['script', 'generate_script', 'strategy', 'audit', 'hook', 'generate_hook', 'caption', 'generate_caption'];
    let primaryNode = completedNodes.find(n => PRIMARY_ORDER.includes(n.nodeId))
      || completedNodes[0];

    const primary = primaryNode ? contextStore[primaryNode.nodeId] : null;

    // Supplementary outputs (everything that isn't primary)
    const supplementary: Record<string, any> = {};
    for (const node of completedNodes) {
      if (node.nodeId !== primaryNode?.nodeId) {
        supplementary[node.nodeId] = contextStore[node.nodeId];
      }
    }

    // Generate summary
    const completedLabels = completedNodes.map(n => n.taskType.replace(/_/g, ' ')).join(', ');
    const summary = completedNodes.length > 0
      ? `Generated: ${completedLabels}.`
      : 'No content was successfully generated.';

    // Aggregate failures
    const failures = failedNodes.map(n => ({ nodeId: n.nodeId, error: n.error || 'Unknown error' }));

    return {
      success: completedNodes.length > 0,
      workflowId,
      primary,
      supplementary,
      summary,
      totalTokensUsed: 0, // Will be populated by Observability in Sprint 3
      criticalPathLatencyMs: 0,
      failures,
    };
  }
}

export const responseComposer = ResponseComposer.getInstance();
