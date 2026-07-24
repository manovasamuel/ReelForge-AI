import { 
  ideateRequestSchema, 
  blueprintRequestSchema, 
  regenerateRequestSchema, 
  workflowResponseSchema 
} from '@/app/api/v2/workflow/schemas';
import { z } from 'zod';

type WorkflowResponse = z.infer<typeof workflowResponseSchema>;

export class ApiClient {
  private static async fetchJSON(url: string, body: any): Promise<WorkflowResponse> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.details || `API Error: ${res.status}`);
    }
    return workflowResponseSchema.parse(data);
  }

  static async ideate(profileId: string, userMessage: string): Promise<WorkflowResponse> {
    const payload = ideateRequestSchema.parse({ profileId, userMessage });
    return this.fetchJSON('/api/v2/workflow/ideate', payload);
  }

  static async blueprint(workflowId: string, selectedConceptId: string): Promise<WorkflowResponse> {
    const payload = blueprintRequestSchema.parse({ workflowId, selectedConceptId });
    return this.fetchJSON('/api/v2/workflow/blueprint', payload);
  }

  static async regenerate(workflowId: string, nodeId: 'generate_blueprint' | 'generate_discovery', userMessage?: string): Promise<WorkflowResponse> {
    const payload = regenerateRequestSchema.parse({ workflowId, nodeId, userMessage });
    return this.fetchJSON('/api/v2/workflow/regenerate', payload);
  }
}
