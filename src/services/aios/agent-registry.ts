/**
 * AIOS Agent Registry
 *
 * Plug-and-play registry that maps TaskTypes to Agent classes.
 * The Orchestrator uses this to find the correct agent for each subtask.
 * New agents are registered here — the Orchestrator itself never changes.
 *
 * Rule: Agents are self-contained. They are discovered via the registry. Never hardcoded.
 */

import type { CapabilityName } from './capability-registry';

export type AgentName =
  | 'AuditAgent'
  | 'CompetitorAgent'
  | 'StrategyAgent'
  | 'ScriptAgent'
  | 'CaptionAgent'
  | 'HookAgent'
  | 'HashtagAgent'
  | 'SEOAgent'
  | 'ValidatorAgent'
  | 'ContentPlannerAgent'
  // Phase 2: Blueprint Architecture
  | 'IntelligenceAgent'
  | 'IdeationAgent'
  | 'BlueprintAgent'
  | 'DiscoveryAgent';

export type TaskType =
  | 'audit'
  | 'competitor_analysis'
  | 'strategy'
  | 'generate_script'
  | 'generate_caption'
  | 'generate_hook'
  | 'generate_hashtags'
  | 'seo_analysis'
  | 'validate'
  | 'content_planning'
  // Phase 2: Blueprint Architecture
  | 'generate_intelligence'
  | 'ideate_hook'
  | 'generate_blueprint'
  | 'generate_discovery';

export type MemoryLayer = 
  | 'L0' 
  | 'L1' 
  | 'L2' 
  | 'L3' 
  | 'L4' 
  | 'L5-Brand' 
  | 'L5-Competitor' 
  | 'L5-Audience' 
  | 'L5-ContentDNA';

export interface AgentRegistration {
  name: AgentName;
  taskTypes: TaskType[];
  capabilities: CapabilityName[];
  description: string;
  /** Can this agent run in parallel with others? */
  parallelizable: boolean;
  /** Phase 3: Selective Context Injection */
  requiredLayers?: MemoryLayer[];
}

const AGENT_REGISTRY_DEFINITIONS: AgentRegistration[] = [
  {
    name: 'AuditAgent',
    taskTypes: ['audit'],
    capabilities: ['audit_analysis', 'summarize'],
    description: 'Performs a comprehensive strategic audit of an Instagram profile',
    parallelizable: false,
  },
  {
    name: 'CompetitorAgent',
    taskTypes: ['competitor_analysis'],
    capabilities: ['competitor_analysis', 'summarize'],
    description: 'Analyzes competitor profiles and extracts strategic insights',
    parallelizable: true,
  },
  {
    name: 'StrategyAgent',
    taskTypes: ['strategy'],
    capabilities: ['strategy_generation', 'reason'],
    description: 'Generates content strategies grounded in audit and competitor data',
    parallelizable: false,
  },
  {
    name: 'ScriptAgent',
    taskTypes: ['generate_script'],
    capabilities: ['generate_script'],
    description: 'Generates full video scripts with hook, body, CTA',
    parallelizable: true,
  },
  {
    name: 'CaptionAgent',
    taskTypes: ['generate_caption'],
    capabilities: ['generate_caption'],
    description: 'Generates optimized Instagram captions',
    parallelizable: true,
  },
  {
    name: 'HookAgent',
    taskTypes: ['generate_hook'],
    capabilities: ['generate_hook'],
    description: 'Generates attention-grabbing video hooks',
    parallelizable: true,
  },
  {
    name: 'HashtagAgent',
    taskTypes: ['generate_hashtags'],
    capabilities: ['generate_hashtags', 'seo_analysis'],
    description: 'Generates targeted hashtag sets for maximum reach',
    parallelizable: true,
  },
  {
    name: 'SEOAgent',
    taskTypes: ['seo_analysis'],
    capabilities: ['seo_analysis'],
    description: 'Analyzes and optimizes content for discoverability',
    parallelizable: true,
  },
  {
    name: 'ValidatorAgent',
    taskTypes: ['validate'],
    capabilities: ['validate'],
    description: 'Validates outputs against schemas and business rules',
    parallelizable: false,
  },
  {
    name: 'ContentPlannerAgent',
    taskTypes: ['content_planning'],
    capabilities: ['content_planning', 'reason'],
    description: 'Plans content calendars and campaigns',
    parallelizable: false,
  },
  // ============================================================================
  // Phase 2: Blueprint Architecture Agents
  // ============================================================================
  {
    name: 'IntelligenceAgent',
    taskTypes: ['generate_intelligence'],
    capabilities: ['strategy_generation', 'reason'],
    description: 'Generates BlueprintStrategy by merging Brand, Competitor, and Content DNA contexts.',
    parallelizable: false,
    requiredLayers: ['L0', 'L5-Brand', 'L5-Competitor', 'L5-ContentDNA', 'L4', 'L2'],
  },
  {
    name: 'IdeationAgent',
    taskTypes: ['ideate_hook'],
    capabilities: ['generate_hook', 'reason'],
    description: 'Generates an array of CreativeConcepts (Stage 1 Hook Ideation).',
    parallelizable: false,
    requiredLayers: ['L0', 'L5-Brand', 'L5-Audience', 'L4'],
  },
  {
    name: 'BlueprintAgent',
    taskTypes: ['generate_blueprint'],
    capabilities: ['generate_script', 'reason'],
    description: 'Consumes approved Hook Concept and generates Production, Visual, Dialogue, Retention, and CTA sections.',
    parallelizable: false,
    requiredLayers: ['L0', 'L5-Brand', 'L5-Audience', 'L4'],
  },
  {
    name: 'DiscoveryAgent',
    taskTypes: ['generate_discovery'],
    capabilities: ['seo_analysis', 'generate_hashtags'],
    description: 'Generates Caption and SEO Discovery sections for the Blueprint.',
    parallelizable: true,
    requiredLayers: ['L0', 'L5-Brand', 'L5-Audience'],
  },
];

export class AgentRegistry {
  private static instance: AgentRegistry;
  private readonly registrations: AgentRegistration[];

  private constructor() {
    this.registrations = AGENT_REGISTRY_DEFINITIONS;
  }

  static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  getAgentForTask(taskType: TaskType): AgentRegistration {
    const agent = this.registrations.find(a => a.taskTypes.includes(taskType));
    if (!agent) throw new Error(`[AgentRegistry] No agent registered for task type: ${taskType}`);
    return agent;
  }

  getAgentByName(name: AgentName): AgentRegistration {
    const agent = this.registrations.find(a => a.name === name);
    if (!agent) throw new Error(`[AgentRegistry] No agent found with name: ${name}`);
    return agent;
  }

  getAllAgents(): AgentRegistration[] {
    return this.registrations;
  }
}

export const agentRegistry = AgentRegistry.getInstance();
