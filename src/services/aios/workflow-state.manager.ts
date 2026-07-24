/**
 * AIOS Workflow State Manager (Phase 4 - Persistent)
 *
 * Maintains durable state for every orchestration run in Postgres.
 * Enables serverless compatibility, incremental workflow, and node-level resumption.
 *
 * State machine:
 *   Pending → Running → Paused → Completed | Failed | Cancelled
 */

import type { TaskType } from './agent-registry';
import { db } from '@/lib/db';
import { workflowStates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export type WorkflowStatus =
  | 'Pending'
  | 'Running'
  | 'Paused'
  | 'Completed'
  | 'Failed'
  | 'Cancelled';

export type NodeStatus = 'Pending' | 'Running' | 'Completed' | 'Failed' | 'Skipped';

export interface NodeState {
  nodeId: string;
  taskType: TaskType;
  status: NodeStatus;
  startedAt?: Date | string;
  completedAt?: Date | string;
  retryCount: number;
  output?: any;
  error?: string;
  // Node Metadata telemetry (Phase 4)
  duration?: number;
  llmProvider?: string;
  model?: string;
  tokenUsage?: number;
}

export interface WorkflowState {
  workflowId: string;
  status: WorkflowStatus;
  createdAt: Date;
  updatedAt: Date;
  nodeStates: Record<string, NodeState>;
  /** L0 Session Memory — stores intermediate outputs for inter-agent context */
  contextStore: Record<string, any>;
  finalOutput?: any;
  error?: string;
}

export class WorkflowStateManager {
  private static instance: WorkflowStateManager;

  static getInstance(): WorkflowStateManager {
    if (!WorkflowStateManager.instance) {
      WorkflowStateManager.instance = new WorkflowStateManager();
    }
    return WorkflowStateManager.instance;
  }

  async initWorkflow(workflowId: string, nodeIds: string[], taskTypes: TaskType[]): Promise<WorkflowState> {
    const nodeStates: Record<string, NodeState> = {};
    nodeIds.forEach((id, i) => {
      nodeStates[id] = {
        nodeId: id,
        taskType: taskTypes[i],
        status: 'Pending',
        retryCount: 0,
      };
    });

    const state: WorkflowState = {
      workflowId,
      status: 'Running',
      createdAt: new Date(),
      updatedAt: new Date(),
      nodeStates,
      contextStore: {},
    };

    // Phase 4: Database Persistence
    await db.insert(workflowStates).values({
      id: workflowId,
      status: state.status,
      nodeStates: state.nodeStates,
      contextStore: state.contextStore,
    });

    return state;
  }

  async getWorkflow(workflowId: string): Promise<WorkflowState> {
    const result = await db.select().from(workflowStates).where(eq(workflowStates.id, workflowId)).limit(1);
    if (!result || result.length === 0) {
      throw new Error(`[WorkflowStateManager] Workflow not found: ${workflowId}`);
    }
    const row = result[0];
    return {
      workflowId: row.id,
      status: row.status as WorkflowStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      nodeStates: row.nodeStates as Record<string, NodeState>,
      contextStore: row.contextStore as Record<string, any>,
      finalOutput: row.finalOutput,
      error: row.error || undefined,
    };
  }

  private async updateWorkflowState(workflowId: string, updates: Partial<WorkflowState>): Promise<void> {
    const payload: any = { updatedAt: new Date() };
    if (updates.status) payload.status = updates.status;
    if (updates.nodeStates) payload.nodeStates = updates.nodeStates;
    if (updates.contextStore) payload.contextStore = updates.contextStore;
    if (updates.finalOutput) payload.finalOutput = updates.finalOutput;
    if (updates.error) payload.error = updates.error;

    await db.update(workflowStates).set(payload).where(eq(workflowStates.id, workflowId));
  }

  async setWorkflowStatus(workflowId: string, status: WorkflowStatus): Promise<void> {
    await this.updateWorkflowState(workflowId, { status });
  }

  async setNodeStatus(workflowId: string, nodeId: string, status: NodeStatus, telemetry?: Partial<NodeState>): Promise<void> {
    const state = await this.getWorkflow(workflowId);
    const node = state.nodeStates[nodeId];
    if (!node) throw new Error(`[WorkflowStateManager] Node not found: ${nodeId}`);

    node.status = status;
    if (status === 'Running') node.startedAt = new Date().toISOString();
    if (status === 'Completed' || status === 'Failed') node.completedAt = new Date().toISOString();
    
    if (telemetry) {
      Object.assign(node, telemetry);
    }
    
    await this.updateWorkflowState(workflowId, { nodeStates: state.nodeStates });
  }

  async writeToContextStore(workflowId: string, key: string, value: any): Promise<void> {
    const state = await this.getWorkflow(workflowId);
    state.contextStore[key] = value;
    await this.updateWorkflowState(workflowId, { contextStore: state.contextStore });
  }

  async completeNode(workflowId: string, nodeId: string, output: any, telemetry?: Partial<NodeState>): Promise<void> {
    const state = await this.getWorkflow(workflowId);
    const node = state.nodeStates[nodeId];
    node.status = 'Completed';
    node.completedAt = new Date().toISOString();
    node.output = output;
    
    if (telemetry) {
      Object.assign(node, telemetry);
    }

    state.contextStore[nodeId] = output;
    await this.updateWorkflowState(workflowId, { nodeStates: state.nodeStates, contextStore: state.contextStore });
  }

  async failNode(workflowId: string, nodeId: string, error: string): Promise<void> {
    const state = await this.getWorkflow(workflowId);
    const node = state.nodeStates[nodeId];
    node.status = 'Failed';
    node.completedAt = new Date().toISOString();
    node.error = error;
    node.retryCount = (node.retryCount || 0) + 1;
    await this.updateWorkflowState(workflowId, { nodeStates: state.nodeStates });
  }
  
  // Phase 4: Resume Capability
  async clearNodeState(workflowId: string, nodeId: string): Promise<void> {
    const state = await this.getWorkflow(workflowId);
    if (state.nodeStates[nodeId]) {
      state.nodeStates[nodeId].status = 'Pending';
      delete state.nodeStates[nodeId].output;
      delete state.nodeStates[nodeId].error;
    }
    if (state.contextStore[nodeId]) {
      delete state.contextStore[nodeId];
    }
    await this.updateWorkflowState(workflowId, { nodeStates: state.nodeStates, contextStore: state.contextStore });
  }

  async completeWorkflow(workflowId: string, finalOutput: any): Promise<void> {
    await this.updateWorkflowState(workflowId, { status: 'Completed', finalOutput });
  }

  async failWorkflow(workflowId: string, error: string): Promise<void> {
    await this.updateWorkflowState(workflowId, { status: 'Failed', error });
  }
}

export const workflowStateManager = WorkflowStateManager.getInstance();
