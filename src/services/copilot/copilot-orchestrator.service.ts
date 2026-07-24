import { contextBuilderService } from "./context-builder.service";
import { skillRouterService } from "./skill-router.service";
import { streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { aiosOrchestrator, classifierService } from '@/services/aios';
import { CopilotResponseSchema } from './schema';

export class CopilotOrchestrator {

  /**
   * Orchestrates the incoming chat request.
   *
   * Routing Logic (AIOS Integration):
   * - If the request is classified as 'complex' or 'multi_step':
   *   → Routes through AIOS (Classifier → Planner → Agent Orchestrator → Composer)
   * - Otherwise (simple single-turn):
   *   → Falls through to the existing streaming path (fast, low-latency)
   */
  async streamCopilotResponse(profileId: string, messages: any[]) {
    console.log(`[CopilotOrchestrator] Processing request for profile: ${profileId}`);

    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || "";

    // 1. Classify the request via AIOS
    const classification = classifierService.classify(lastUserMessage);
    console.log(`[CopilotOrchestrator] AIOS Classification: ${classification.taskType} | complexity: ${classification.complexity} | isMultiStep: ${classification.isMultiStep}`);

    // 2. Route complex / multi-step requests through the full AIOS pipeline
    if (classification.isMultiStep || classification.complexity === 'complex') {
      console.log(`[CopilotOrchestrator] → Routing to AIOS multi-agent pipeline`);
      return this.runAIOSPipeline(lastUserMessage, profileId);
    }

    // 3. Simple requests: use the existing fast streaming path
    console.log(`[CopilotOrchestrator] → Routing to streaming path (simple request)`);
    return this.streamSimpleResponse(profileId, messages, lastUserMessage);
  }

  private async runAIOSPipeline(userMessage: string, profileId: string): Promise<Response> {
    try {
      const result = await aiosOrchestrator.run({
        userMessage,
        profileContext: { profileId },
      });

      const { composed } = result;

      const copilotResponse = {
        summary: composed.summary,
        recommendations: [],
        quickWins: [],
        contentDrafts: this.buildContentDrafts(composed),
        nextQuestions: [],
        confidence: composed.success ? 85 : 30,
      };

      return new Response(JSON.stringify(copilotResponse), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      console.error('[CopilotOrchestrator] AIOS pipeline error:', error);
      return new Response(JSON.stringify({ error: 'AIOS pipeline failed', detail: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  private buildContentDrafts(composed: any): any[] {
    const drafts: any[] = [];

    if (composed.primary?.hook || composed.primary?.body) {
      drafts.push({ title: 'Generated Script', contentType: 'Reels', contentData: composed.primary });
    }

    if (composed.supplementary?.caption) {
      drafts.push({ title: 'Generated Caption', contentType: 'Captions', contentData: composed.supplementary.caption });
    }

    return drafts;
  }

  private async streamSimpleResponse(profileId: string, messages: any[], lastUserMessage: string) {
    const context = await contextBuilderService.buildContext(profileId);
    const selectedSkill = skillRouterService.detectIntent(lastUserMessage);
    console.log(`[CopilotOrchestrator] Selected Skill: ${selectedSkill}`);
    const systemPrompt = skillRouterService.getSystemPrompt(selectedSkill, context);

    const result = await streamObject({
      model: google('gemini-1.5-pro'),
      system: systemPrompt,
      messages: messages,
      schema: CopilotResponseSchema,
    });

    return result.toTextStreamResponse();
  }
}

export const copilotOrchestrator = new CopilotOrchestrator();
