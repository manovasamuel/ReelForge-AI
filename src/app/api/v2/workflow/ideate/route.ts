import { NextRequest, NextResponse } from 'next/server';
import { ideateRequestSchema } from '../schemas';
import { aiosOrchestrator } from '@/services/aios/orchestrator.service';
import { workflowStateManager } from '@/services/aios/workflow-state.manager';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = ideateRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const { profileId, userMessage } = result.data;

    // AIOS Execution (Stage 1 only)
    const response = await aiosOrchestrator.run({
      userMessage,
      profileContext: { profileId },
      forcedClassification: {
        // We only want the Ideation phase to run.
        requiredTaskTypes: ['generate_intelligence', 'ideate_hook'],
        complexity: 'moderate',
      }
    });

    // We pause the workflow to wait for user concept selection
    await workflowStateManager.setWorkflowStatus(response.workflowId, 'Paused');

    // Extract the Ideation array to return directly to the UI
    const concepts = response.composed.supplementary['ideate_hook'] || (Array.isArray(response.composed.primary) ? response.composed.primary : []);

    return NextResponse.json({
      workflowId: response.workflowId,
      status: 'Paused',
      currentStage: 'Ideation',
      data: concepts,
      metadata: { traceId: response.traceId }
    });
  } catch (error: any) {
    console.error('[API] Ideate error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
