/**
 * AIOS Task Planner — DAG-based
 *
 * Takes a ClassificationResult and produces a Directed Acyclic Graph (DAG)
 * of subtasks for the Orchestrator to execute.
 *
 * Key Properties:
 * - Independent subtasks are tagged `parallel: true` and can be executed concurrently.
 * - Dependent tasks carry a `dependsOn` array listing which subtask IDs must complete first.
 * - The Orchestrator respects this graph; it never reorders tasks itself.
 *
 * Rule: The Planner builds the plan. The Orchestrator executes it. Never mixed.
 */

import type { TaskType } from './agent-registry';
import type { ClassificationResult } from './classifier.service';

export interface DAGNode {
  id: string;
  taskType: TaskType;
  /** Node IDs that must complete before this node can start */
  dependsOn: string[];
  /** Can this be run in parallel with sibling nodes that share the same dependencies? */
  parallel: boolean;
  /** Human-readable label for observability */
  label: string;
}

export interface TaskDAG {
  workflowId: string;
  nodes: DAGNode[];
  /** Topological execution order (respects dependencies) */
  executionLayers: DAGNode[][];
}

// Pre-defined DAG templates for common multi-step workflows
const DAG_TEMPLATES: Record<string, DAGNode[]> = {
  'generate_hook+generate_script': [
    { id: 'hook', taskType: 'generate_hook', dependsOn: [], parallel: false, label: 'Generate Hook' },
    { id: 'script', taskType: 'generate_script', dependsOn: ['hook'], parallel: false, label: 'Generate Script' },
  ],
  'generate_script+generate_caption': [
    { id: 'script', taskType: 'generate_script', dependsOn: [], parallel: false, label: 'Generate Script' },
    { id: 'caption', taskType: 'generate_caption', dependsOn: ['script'], parallel: false, label: 'Generate Caption' },
  ],
  'generate_hook+generate_script+generate_caption': [
    { id: 'hook', taskType: 'generate_hook', dependsOn: [], parallel: false, label: 'Generate Hook' },
    { id: 'script', taskType: 'generate_script', dependsOn: ['hook'], parallel: false, label: 'Generate Script' },
    { id: 'caption', taskType: 'generate_caption', dependsOn: ['script'], parallel: false, label: 'Generate Caption' },
    { id: 'hashtags', taskType: 'generate_hashtags', dependsOn: ['script'], parallel: true, label: 'Generate Hashtags' },
  ],
  'competitor_analysis+strategy': [
    { id: 'competitor', taskType: 'competitor_analysis', dependsOn: [], parallel: false, label: 'Competitor Analysis' },
    { id: 'strategy', taskType: 'strategy', dependsOn: ['competitor'], parallel: false, label: 'Strategy Generation' },
  ],
  'strategy+generate_script': [
    { id: 'strategy', taskType: 'strategy', dependsOn: [], parallel: false, label: 'Strategy Generation' },
    { id: 'hook', taskType: 'generate_hook', dependsOn: ['strategy'], parallel: false, label: 'Generate Hook' },
    { id: 'script', taskType: 'generate_script', dependsOn: ['hook'], parallel: false, label: 'Generate Script' },
    { id: 'caption', taskType: 'generate_caption', dependsOn: ['script'], parallel: true, label: 'Generate Caption' },
    { id: 'hashtags', taskType: 'generate_hashtags', dependsOn: ['script'], parallel: true, label: 'Generate Hashtags' },
  ],
};

function buildTopologicalLayers(nodes: DAGNode[]): DAGNode[][] {
  const layers: DAGNode[][] = [];
  const remaining = [...nodes];
  const completed = new Set<string>();

  while (remaining.length > 0) {
    const readyNow = remaining.filter(n => n.dependsOn.every(dep => completed.has(dep)));
    if (readyNow.length === 0) {
      console.error('[Planner] Cycle detected in DAG or unresolvable dependencies');
      break;
    }
    layers.push(readyNow);
    readyNow.forEach(n => completed.add(n.id));
    readyNow.forEach(n => remaining.splice(remaining.indexOf(n), 1));
  }

  return layers;
}

export class PlannerService {
  private static instance: PlannerService;

  static getInstance(): PlannerService {
    if (!PlannerService.instance) {
      PlannerService.instance = new PlannerService();
    }
    return PlannerService.instance;
  }

  plan(classification: ClassificationResult): TaskDAG {
    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const { requiredTaskTypes, isMultiStep } = classification;

    let nodes: DAGNode[];

    if (isMultiStep && requiredTaskTypes.length > 1) {
      // Find a matching DAG template
      const templateKey = [...requiredTaskTypes].sort().join('+');
      const alternateKey = requiredTaskTypes.join('+');

      nodes = DAG_TEMPLATES[alternateKey]
        || DAG_TEMPLATES[templateKey]
        || this.buildDefaultDAG(requiredTaskTypes);
    } else {
      // Single task — trivial DAG
      nodes = [{
        id: requiredTaskTypes[0],
        taskType: requiredTaskTypes[0],
        dependsOn: [],
        parallel: false,
        label: this.toLabel(requiredTaskTypes[0]),
      }];
    }

    const executionLayers = buildTopologicalLayers(nodes);

    return { workflowId, nodes, executionLayers };
  }

  private buildDefaultDAG(taskTypes: TaskType[]): DAGNode[] {
    // Sequential fallback when no template exists
    return taskTypes.map((t, i) => ({
      id: t,
      taskType: t,
      dependsOn: i === 0 ? [] : [taskTypes[i - 1]],
      parallel: false,
      label: this.toLabel(t),
    }));
  }

  private toLabel(taskType: TaskType): string {
    return taskType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}

export const plannerService = PlannerService.getInstance();
