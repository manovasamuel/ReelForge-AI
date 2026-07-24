/**
 * AIOS Execution Policy Manager
 *
 * Defines execution rules (timeouts, retries, parallelism) for different capabilities.
 * Allows policies to evolve without changing orchestration code.
 */

import { type TaskType } from './agent-registry';

export interface ExecutionPolicy {
  timeoutMs: number;
  maxRetries: number;
  // Can add priority, queue rules, etc. later
}

const DEFAULT_POLICY: ExecutionPolicy = {
  timeoutMs: 30000, // 30s
  maxRetries: 2,
};

// Specific overrides per task type
const POLICY_OVERRIDES: Partial<Record<TaskType, Partial<ExecutionPolicy>>> = {
  generate_intelligence: {
    timeoutMs: 60000, // Strategy takes longer
    maxRetries: 3,
  },
  generate_script: {
    timeoutMs: 45000,
  }
};

export class ExecutionPolicyManager {
  private static instance: ExecutionPolicyManager;

  static getInstance(): ExecutionPolicyManager {
    if (!ExecutionPolicyManager.instance) {
      ExecutionPolicyManager.instance = new ExecutionPolicyManager();
    }
    return ExecutionPolicyManager.instance;
  }

  getPolicy(taskType: TaskType): ExecutionPolicy {
    const override = POLICY_OVERRIDES[taskType] || {};
    return {
      ...DEFAULT_POLICY,
      ...override,
    };
  }
}

export const executionPolicyManager = ExecutionPolicyManager.getInstance();
