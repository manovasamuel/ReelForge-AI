/**
 * AIOS Capability Registry
 *
 * The single source of truth for every AI capability the platform can perform.
 * The Orchestrator NEVER references model names directly — it requests a capability.
 * The Model Router (Sprint 3) will resolve capabilities to optimal models.
 *
 * Rule: Orchestrator knows capabilities. Router knows models. Never the other way.
 */

export type CapabilityName =
  | 'classify'
  | 'reason'
  | 'summarize'
  | 'generate_hook'
  | 'generate_script'
  | 'generate_caption'
  | 'generate_hashtags'
  | 'seo_analysis'
  | 'audit_analysis'
  | 'competitor_analysis'
  | 'strategy_generation'
  | 'translate'
  | 'validate'
  | 'content_planning';

export interface Capability {
  name: CapabilityName;
  description: string;
  /** Rough token cost tier: 'low' | 'medium' | 'high' */
  costTier: 'low' | 'medium' | 'high';
  /** Whether structured JSON output is required */
  requiresJson: boolean;
  /** Min context window size needed */
  minContextWindow: number;
  /** Whether this capability benefits from reasoning/thinking */
  requiresReasoning: boolean;
}

const CAPABILITY_DEFINITIONS: Record<CapabilityName, Capability> = {
  classify: {
    name: 'classify',
    description: 'Classify a user request into a task type',
    costTier: 'low',
    requiresJson: true,
    minContextWindow: 4096,
    requiresReasoning: false,
  },
  reason: {
    name: 'reason',
    description: 'Perform multi-step reasoning on a complex topic',
    costTier: 'high',
    requiresJson: false,
    minContextWindow: 32000,
    requiresReasoning: true,
  },
  summarize: {
    name: 'summarize',
    description: 'Compress a large context into a summary',
    costTier: 'low',
    requiresJson: false,
    minContextWindow: 8000,
    requiresReasoning: false,
  },
  generate_hook: {
    name: 'generate_hook',
    description: 'Generate attention-grabbing opening hooks for video content',
    costTier: 'medium',
    requiresJson: true,
    minContextWindow: 8000,
    requiresReasoning: false,
  },
  generate_script: {
    name: 'generate_script',
    description: 'Generate a full video script with hook, body, and CTA',
    costTier: 'high',
    requiresJson: true,
    minContextWindow: 32000,
    requiresReasoning: false,
  },
  generate_caption: {
    name: 'generate_caption',
    description: 'Generate an optimized post caption',
    costTier: 'medium',
    requiresJson: true,
    minContextWindow: 8000,
    requiresReasoning: false,
  },
  generate_hashtags: {
    name: 'generate_hashtags',
    description: 'Generate a targeted hashtag set',
    costTier: 'low',
    requiresJson: true,
    minContextWindow: 4096,
    requiresReasoning: false,
  },
  seo_analysis: {
    name: 'seo_analysis',
    description: 'Analyze SEO potential and keyword opportunities',
    costTier: 'medium',
    requiresJson: true,
    minContextWindow: 8000,
    requiresReasoning: false,
  },
  audit_analysis: {
    name: 'audit_analysis',
    description: 'Perform a strategic audit of an Instagram profile',
    costTier: 'high',
    requiresJson: true,
    minContextWindow: 64000,
    requiresReasoning: true,
  },
  competitor_analysis: {
    name: 'competitor_analysis',
    description: 'Analyze competitor content strategy and performance',
    costTier: 'high',
    requiresJson: true,
    minContextWindow: 32000,
    requiresReasoning: false,
  },
  strategy_generation: {
    name: 'strategy_generation',
    description: 'Generate a content strategy based on audit and competitors',
    costTier: 'high',
    requiresJson: true,
    minContextWindow: 32000,
    requiresReasoning: true,
  },
  translate: {
    name: 'translate',
    description: 'Translate content to a target language',
    costTier: 'low',
    requiresJson: false,
    minContextWindow: 8000,
    requiresReasoning: false,
  },
  validate: {
    name: 'validate',
    description: 'Validate structured output against a schema',
    costTier: 'low',
    requiresJson: true,
    minContextWindow: 4096,
    requiresReasoning: false,
  },
  content_planning: {
    name: 'content_planning',
    description: 'Plan a content calendar or campaign',
    costTier: 'medium',
    requiresJson: true,
    minContextWindow: 16000,
    requiresReasoning: false,
  },
};

export class CapabilityRegistry {
  private static instance: CapabilityRegistry;

  static getInstance(): CapabilityRegistry {
    if (!CapabilityRegistry.instance) {
      CapabilityRegistry.instance = new CapabilityRegistry();
    }
    return CapabilityRegistry.instance;
  }

  getCapability(name: CapabilityName): Capability {
    const cap = CAPABILITY_DEFINITIONS[name];
    if (!cap) throw new Error(`[CapabilityRegistry] Unknown capability: ${name}`);
    return cap;
  }

  getAllCapabilities(): Capability[] {
    return Object.values(CAPABILITY_DEFINITIONS);
  }

  getCapabilitiesByTier(tier: 'low' | 'medium' | 'high'): Capability[] {
    return this.getAllCapabilities().filter(c => c.costTier === tier);
  }
}

export const capabilityRegistry = CapabilityRegistry.getInstance();
