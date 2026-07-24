import { z } from 'zod';

export const ideateRequestSchema = z.object({
  profileId: z.string().uuid(),
  userMessage: z.string().min(1),
});

export const blueprintRequestSchema = z.object({
  workflowId: z.string(),
  selectedConceptId: z.string(),
});

export const regenerateRequestSchema = z.object({
  workflowId: z.string(),
  nodeId: z.enum(['generate_blueprint', 'generate_discovery']), // Supports future section-level generation
  userMessage: z.string().optional(),
});

export const workflowResponseSchema = z.object({
  workflowId: z.string(),
  status: z.string(),
  currentStage: z.string(),
  data: z.any().optional(),
  metadata: z.any().optional(),
});
