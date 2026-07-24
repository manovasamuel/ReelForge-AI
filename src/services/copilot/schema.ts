import { z } from "zod";

export const CopilotResponseSchema = z.object({
  summary: z.string(),
  recommendations: z.array(z.object({
    recommendation: z.string(),
    evidence: z.string(),
    expectedImpact: z.string(),
    priority: z.enum(["High", "Medium", "Low"]),
    estimatedEffort: z.string(),
  })),
  quickWins: z.array(z.object({
    task: z.string(),
    effort: z.string(),
    impact: z.string(),
  })),
  contentDrafts: z.array(z.object({
    title: z.string(),
    contentType: z.enum(['Reels', 'Carousels', 'Static', 'Stories', 'Captions', 'Hooks', 'Ideas']),
    contentData: z.any(),
  })).optional(),
  nextQuestions: z.array(z.string()),
  citations: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(100),
});
