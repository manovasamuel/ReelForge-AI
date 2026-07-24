/**
 * AIOS Specialized Agents
 * Hook Agent, Script Agent, Caption Agent, Hashtag Agent, Strategy Agent
 *
 * Each agent:
 * - Extends BaseAgent (enforcing no direct agent-to-agent communication)
 * - Requests capabilities via name (never model names)
 * - Reads upstream context from the L0 contextStore
 *
 * For MVP: Each agent calls the existing AI orchestrator with a focused prompt,
 * respecting the capability abstraction. In Sprint 3, this will be routed
 * through the Model Router to select the optimal model per capability.
 */

import { BaseAgent, type AgentContext, type AgentResult } from './base-agent';

// ============================================================
// Hook Agent
// ============================================================
/**
 * @deprecated Use IdeationAgent for Phase 2 workflows.
 */
export class HookAgent extends BaseAgent {
  readonly name = 'HookAgent';
  readonly taskType = 'generate_hook' as const;
  readonly primaryCapability = 'generate_hook' as const;

  async execute(context: AgentContext): Promise<AgentResult> {
    this.log(`Executing for workflow: ${context.workflowId}`);
    const start = Date.now();

    const profile = context.profileContext;
    const systemPrompt = `You are an expert Instagram content creator specializing in high-retention hooks. Your job is to generate 3 powerful video opening hooks. Each hook must stop the scroll in the first 2 seconds.
${context.enrichedContext ? `\n\n${context.enrichedContext}` : ''}`;
    const userPrompt = `Generate 3 powerful hooks for a ${profile.niche || 'general'} Instagram Reel based on this request: "${context.userMessage}".
Output JSON: { "hooks": [{ "text": string, "type": "question|statement|controversy|story" }] }`;

    return this.executeWithGovernance(context, systemPrompt, userPrompt);
  }
}

// ============================================================
// Script Agent
// ============================================================
/**
 * @deprecated Use BlueprintAgent for Phase 2 workflows.
 */
export class ScriptAgent extends BaseAgent {
  readonly name = 'ScriptAgent';
  readonly taskType = 'generate_script' as const;
  readonly primaryCapability = 'generate_script' as const;

  async execute(context: AgentContext): Promise<AgentResult> {
    this.log(`Executing for workflow: ${context.workflowId}`);
    const start = Date.now();

    const profile = context.profileContext;
    const hookContext = this.readUpstreamOutput(context.contextStore, 'hook');
    const bestHook = hookContext?.hooks?.[0]?.text || '';

    const systemPrompt = `You are an expert short-form video scriptwriter. Write compelling, educational, and entertaining Reel scripts that drive real engagement.
${context.enrichedContext ? `\n\n${context.enrichedContext}` : ''}`;
    const userPrompt = `Write a full 30-60 second Instagram Reel script for a ${profile.niche || 'general'} creator.
Request: "${context.userMessage}"
${bestHook ? `Hook to use: "${bestHook}"` : ''}

Output JSON: {
  "hook": string,
  "body": string[],
  "cta": string,
  "estimatedDurationSeconds": number,
  "contentType": string
}`;

    return this.executeWithGovernance(context, systemPrompt, userPrompt);
  }
}

// ============================================================
// Caption Agent
// ============================================================
/**
 * @deprecated Use DiscoveryAgent for Phase 2 workflows.
 */
export class CaptionAgent extends BaseAgent {
  readonly name = 'CaptionAgent';
  readonly taskType = 'generate_caption' as const;
  readonly primaryCapability = 'generate_caption' as const;

  async execute(context: AgentContext): Promise<AgentResult> {
    this.log(`Executing for workflow: ${context.workflowId}`);
    const start = Date.now();

    const scriptContext = this.readUpstreamOutput(context.contextStore, 'script');
    const profile = context.profileContext;

    const systemPrompt = `You are an expert Instagram caption writer. Write captions that complement video content and drive engagement through CTA and storytelling.
${context.enrichedContext ? `\n\n${context.enrichedContext}` : ''}`;
    const userPrompt = `Write an Instagram caption for this Reel.
Request: "${context.userMessage}"
${scriptContext ? `Script CTA: "${scriptContext.cta}"` : ''}
Profile niche: ${profile.niche || 'general'}

Output JSON: {
  "caption": string,
  "cta": string,
  "characterCount": number
}`;

    return this.executeWithGovernance(context, systemPrompt, userPrompt);
  }
}

// ============================================================
// Hashtag Agent
// ============================================================
/**
 * @deprecated Use DiscoveryAgent for Phase 2 workflows.
 */
export class HashtagAgent extends BaseAgent {
  readonly name = 'HashtagAgent';
  readonly taskType = 'generate_hashtags' as const;
  readonly primaryCapability = 'generate_hashtags' as const;

  async execute(context: AgentContext): Promise<AgentResult> {
    this.log(`Executing for workflow: ${context.workflowId}`);
    const start = Date.now();

    const profile = context.profileContext;
    const systemPrompt = `You are an Instagram SEO expert. Generate a targeted hashtag mix (broad, medium, niche) to maximize reach.
${context.enrichedContext ? `\n\n${context.enrichedContext}` : ''}`;
    const userPrompt = `Generate 20 targeted Instagram hashtags for: "${context.userMessage}"
Profile niche: ${profile.niche || 'general'}

Output JSON: { "hashtags": string[], "mix": { "broad": number, "medium": number, "niche": number } }`;

    return this.executeWithGovernance(context, systemPrompt, userPrompt);
  }
}

// ============================================================
// Strategy Agent
// ============================================================
/**
 * @deprecated Use IntelligenceAgent for Phase 2 workflows.
 */
export class StrategyAgent extends BaseAgent {
  readonly name = 'StrategyAgent';
  readonly taskType = 'strategy' as const;
  readonly primaryCapability = 'strategy_generation' as const;

  async execute(context: AgentContext): Promise<AgentResult> {
    this.log(`Executing for workflow: ${context.workflowId}`);
    const start = Date.now();

    const profile = context.profileContext;
    const competitorContext = this.readUpstreamOutput(context.contextStore, 'competitor');
    const systemPrompt = `You are an expert Instagram growth strategist. Generate data-driven content strategies.
${context.enrichedContext ? `\n\n${context.enrichedContext}` : ''}`;
    const userPrompt = `Generate a content strategy for: "${context.userMessage}"
Profile niche: ${profile.niche || 'general'}
${competitorContext ? `Competitor insights: ${JSON.stringify(competitorContext).slice(0, 500)}` : ''}

Output JSON: {
  "strategicGoals": string[],
  "contentMix": { "contentType": string, "percentage": number }[],
  "postingFrequency": string,
  "priority": string
}`;

    return this.executeWithGovernance(context, systemPrompt, userPrompt);
  }
}

// Export all agents
import {
  IntelligenceAgent,
  IdeationAgent,
  BlueprintAgent,
  DiscoveryAgent
} from './blueprint-agents';

export const AGENT_CLASSES: Record<string, new () => BaseAgent> = {
  // Legacy MVP Agents
  HookAgent,
  ScriptAgent,
  CaptionAgent,
  HashtagAgent,
  StrategyAgent,
  
  // Phase 2 Blueprint Architecture Agents
  IntelligenceAgent,
  IdeationAgent,
  BlueprintAgent,
  DiscoveryAgent
};
