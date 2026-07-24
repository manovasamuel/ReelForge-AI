import type { CompactCopilotContext } from "./context-builder.service";

export type CopilotSkill = "strategy_coach" | "script_writer" | "caption_writer" | "competitor_analyst" | "general_advisor";

export interface SkillPrompt {
  skill: CopilotSkill;
  systemPrompt: string;
}

export class SkillRouterService {
  /**
   * Evaluates the user message to determine intent and selects the optimal skill pack.
   */
  detectIntent(message: string): CopilotSkill {
    const msg = message.toLowerCase();
    
    if (msg.includes("script") || msg.includes("video") || msg.includes("hook")) {
      return "script_writer";
    }
    
    if (msg.includes("caption") || msg.includes("hashtag")) {
      return "caption_writer";
    }
    
    if (msg.includes("competitor") || msg.includes("vs") || msg.includes("compare")) {
      return "competitor_analyst";
    }
    
    if (msg.includes("strategy") || msg.includes("gap") || msg.includes("roadmap") || msg.includes("next step")) {
      return "strategy_coach";
    }

    return "general_advisor";
  }

  /**
   * Assembles the full system prompt using the selected skill and the inherited audit context.
   */
  getSystemPrompt(skill: CopilotSkill, context: CompactCopilotContext): string {
    const baseContext = `
You are the ReelForge Adaptive Copilot, an elite Instagram AI strategist.
You NEVER answer like a generic assistant. You ALWAYS back your advice with evidence.

[INHERITED AUDIT CONTEXT]
Niche: ${context.niche}
Growth Stage: ${context.stage}
Strategic Gap: ${context.mainGap}
Priority Goals: ${context.priorityGoals.join(" | ")}
Tracked Competitors: ${context.topCompetitors.join(", ")}

You MUST ONLY give advice that fits this exact context.
`;

    let skillInstructions = "";

    switch (skill) {
      case "script_writer":
        skillInstructions = `[SKILL: SCRIPT WRITER]
Your job is to generate highly engaging short-form video scripts.
Every script MUST address the user's Strategic Gap and incorporate evidence from how Top Competitors script their hooks.
Output actionable script formats.`;
        break;
      case "caption_writer":
        skillInstructions = `[SKILL: CAPTION WRITER]
Your job is to write high-converting Instagram captions.
Focus on call-to-actions that align with the user's Priority Goals.`;
        break;
      case "competitor_analyst":
        skillInstructions = `[SKILL: COMPETITOR ANALYST]
Your job is to break down why the user's Tracked Competitors are succeeding.
Analyze their content patterns and translate them into actionable steps.`;
        break;
      case "strategy_coach":
        skillInstructions = `[SKILL: STRATEGY COACH]
Your job is to guide the user along their Growth Roadmap.
Focus strictly on closing the Strategic Gap. Provide high-impact tactical steps.`;
        break;
      default:
        skillInstructions = `[SKILL: GENERAL ADVISOR]
Your job is to answer general growth questions while strictly grounding your answers in the user's Niche and Growth Stage.`;
    }

    return `${baseContext}\n\n${skillInstructions}\n\n[RESPONSE RULES]
1. Always include a concise summary.
2. Provide a list of actionable 'recommendations'. Each MUST have 'evidence', 'expectedImpact', 'priority' (High/Medium/Low), and 'estimatedEffort'.
3. Provide a list of 'quickWins' (tasks under 30 mins).
4. If the user asks you to generate content (e.g., a script, caption, or idea), you MUST output it in the 'contentDrafts' array, providing a 'title', 'contentType', and the 'contentData'.
5. Provide 'nextQuestions' to keep the conversation flowing.
6. Provide 'citations' if you reference competitors.
7. Rate your 'confidence' (0-100) based on how well the advice matches the Audit context.`;
  }
}

export const skillRouterService = new SkillRouterService();
