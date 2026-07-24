/**
 * AIOS Blueprint Agents (Phase 2)
 *
 * This file contains the new agent definitions for the Production Blueprint architecture.
 * They enforce strictly typed schemas and immutable inputs.
 */

import { BaseAgent, type AgentContext, type AgentResult } from './base-agent';

function buildMetadata(context: AgentContext, confidence: number = 85, reasoning: string = 'Generated based on aggregated market and brand intelligence.') {
  return {
    confidence,
    reasoning,
    generatedAt: new Date().toISOString(),
    model: 'primary-groq', // Extracted from result in higher layers ideally
    version: '1.0'
  };
}

// ============================================================
// Intelligence Agent
// ============================================================
export class IntelligenceAgent extends BaseAgent {
  readonly name = 'IntelligenceAgent';
  readonly taskType = 'generate_intelligence' as const;
  readonly primaryCapability = 'strategy_generation' as const;

  async execute(context: AgentContext): Promise<AgentResult> {
    this.log(`Executing IntelligenceAgent for workflow: ${context.workflowId}`);
    
    // Check if section already exists to fulfill immutability/resume requirement (orchestrator also checks at node level)
    const existing = this.readUpstreamOutput(context.contextStore, this.taskType);
    if (existing) return { success: true, output: existing, tokensUsed: 0, capabilityUsed: this.primaryCapability };

    const systemPrompt = `You are the ReelForge Intelligence Agent. You synthesize Brand Intelligence and Competitor Insights into a precise strategic objective.
${context.enrichedContext ? `\n\n${context.enrichedContext}` : ''}`;
    const userPrompt = `Generate the BlueprintStrategy based on: "${context.userMessage}".
Output strictly as JSON matching this schema:
{
  "objective": "string",
  "targetAudience": "string",
  "desiredEmotion": "string",
  "competitorInsight": "string"
}`;

    const res = await this.executeWithGovernance(context, systemPrompt, userPrompt);
    
    if (res.success && res.output) {
      res.output.metadata = buildMetadata(context, 90, 'Synthesized from profile Brand Intelligence');
    }
    return res;
  }
}

// ============================================================
// Ideation Agent (Stage 1 Hook Ideation)
// ============================================================
export class IdeationAgent extends BaseAgent {
  readonly name = 'IdeationAgent';
  readonly taskType = 'ideate_hook' as const;
  readonly primaryCapability = 'generate_hook' as const;

  async execute(context: AgentContext): Promise<AgentResult> {
    this.log(`Executing IdeationAgent for workflow: ${context.workflowId}`);

    const existing = this.readUpstreamOutput(context.contextStore, this.taskType);
    if (existing) return { success: true, output: existing, tokensUsed: 0, capabilityUsed: this.primaryCapability };

    const strategy = this.readUpstreamOutput(context.contextStore, 'generate_intelligence');

    const systemPrompt = `You are a viral Hook Ideation expert. You generate distinct, highly engaging hook concepts.
${context.enrichedContext ? `\n\n${context.enrichedContext}` : ''}`;
    const userPrompt = `Generate 3 distinct creative concepts for: "${context.userMessage}".
${strategy ? `\nUse this strategy: ${JSON.stringify(strategy)}` : ''}

Output strictly as JSON matching this schema:
{
  "concepts": [
    {
      "id": "string (unique)",
      "title": "string",
      "hook": "string",
      "coreIdea": "string",
      "audienceEmotion": "string",
      "visualHook": "string",
      "whyItWorks": "string"
    }
  ]
}`;

    return this.executeWithGovernance(context, systemPrompt, userPrompt);
  }
}

// ============================================================
// Blueprint Agent (Consumes Concept, Outputs Production/Dialogue/Visual/Retention/CTA)
// ============================================================
export class BlueprintAgent extends BaseAgent {
  readonly name = 'BlueprintAgent';
  readonly taskType = 'generate_blueprint' as const;
  readonly primaryCapability = 'generate_script' as const;

  async execute(context: AgentContext): Promise<AgentResult> {
    this.log(`Executing BlueprintAgent for workflow: ${context.workflowId}`);

    const existing = this.readUpstreamOutput(context.contextStore, this.taskType);
    if (existing) return { success: true, output: existing, tokensUsed: 0, capabilityUsed: this.primaryCapability };

    // The user MUST have selected a concept which was written to contextStore by the API/UI
    const selectedConcept = this.readUpstreamOutput(context.contextStore, 'selected_concept');

    const systemPrompt = `You are an elite Creative Director. You expand an approved concept into a cohesive, modular Production Blueprint.
${context.enrichedContext ? `\n\n${context.enrichedContext}` : ''}`;
    
    const userPrompt = `Expand the following approved creative concept into a full blueprint.
${selectedConcept ? `\nConcept: ${JSON.stringify(selectedConcept)}` : `\nBase Request: "${context.userMessage}"`}

Output strictly as JSON matching this schema:
{
  "production": {
    "openingShot": "string", "cameraAngle": "string", "cameraMovement": "string", "lighting": "string", "background": "string", "actorPosition": "string"
  },
  "dialogue": {
    "tanglishVersion": "string", "englishVersion": "string", "deliveryNotes": "string", "pauseTiming": "string"
  },
  "visualFlow": {
    "sceneBreakdown": ["string"], "bRoll": ["string"], "textOverlays": ["string"], "transitions": ["string"]
  },
  "retention": {
    "curiosityLoops": "string", "patternInterrupts": "string", "engagementMoments": "string"
  },
  "cta": {
    "spokenCTA": "string", "visualCTA": "string", "endScreen": "string"
  }
}`;

    const res = await this.executeWithGovernance(context, systemPrompt, userPrompt);
    
    if (res.success && res.output) {
      res.output.production.metadata = buildMetadata(context);
      res.output.dialogue.metadata = buildMetadata(context);
      res.output.visualFlow.metadata = buildMetadata(context);
      res.output.retention.metadata = buildMetadata(context);
      res.output.cta.metadata = buildMetadata(context);
    }
    return res;
  }
}

// ============================================================
// Discovery Agent (Caption + SEO)
// ============================================================
export class DiscoveryAgent extends BaseAgent {
  readonly name = 'DiscoveryAgent';
  readonly taskType = 'generate_discovery' as const;
  readonly primaryCapability = 'seo_analysis' as const;

  async execute(context: AgentContext): Promise<AgentResult> {
    this.log(`Executing DiscoveryAgent for workflow: ${context.workflowId}`);

    const existing = this.readUpstreamOutput(context.contextStore, this.taskType);
    if (existing) return { success: true, output: existing, tokensUsed: 0, capabilityUsed: this.primaryCapability };

    const blueprintCore = this.readUpstreamOutput(context.contextStore, 'generate_blueprint');
    const selectedConcept = this.readUpstreamOutput(context.contextStore, 'selected_concept');

    const systemPrompt = `You are a viral Instagram SEO expert. Generate high-reach captions and discovery optimization based on the final video script.
${context.enrichedContext ? `\n\n${context.enrichedContext}` : ''}`;
    
    const userPrompt = `Write the caption and SEO metadata for this video blueprint.
${selectedConcept ? `\nHook: ${selectedConcept.hook}` : ''}
${blueprintCore ? `\nDialogue: ${JSON.stringify(blueprintCore.dialogue)}` : ''}

Output strictly as JSON matching this schema:
{
  "caption": {
    "captionText": "string", "emojiStrategy": "string", "keywords": ["string"]
  },
  "discovery": {
    "hashtags": ["string"], "seoKeywords": ["string"], "postingSuggestions": "string"
  }
}`;

    const res = await this.executeWithGovernance(context, systemPrompt, userPrompt);
    
    if (res.success && res.output) {
      res.output.caption.metadata = buildMetadata(context);
      res.output.discovery.metadata = buildMetadata(context);
    }
    return res;
  }
}
