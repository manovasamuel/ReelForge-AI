import { NextRequest, NextResponse } from 'next/server';
import { regenerateRequestSchema } from '../schemas';
import { aiosOrchestrator } from '@/services/aios/orchestrator.service';
import { workflowStateManager } from '@/services/aios/workflow-state.manager';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = regenerateRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const { workflowId, nodeId, userMessage } = result.data;

    // Clear the specific node state (Idempotent deletion)
    await workflowStateManager.clearNodeState(workflowId, nodeId);

    // AIOS Execution (Regenerate)
    // Runs the full DAG again, but since only ONE node was cleared, 
    // ALL OTHER NODES are skipped via Resume Capability.
    const response = await aiosOrchestrator.run({
      userMessage: userMessage || `Regenerating section: ${nodeId}`,
      profileContext: { profileId: 'unknown' },
      resumeWorkflowId: workflowId,
      forcedClassification: {
        requiredTaskTypes: ['generate_intelligence', 'ideate_hook', 'generate_blueprint', 'generate_discovery'],
        complexity: 'complex',
      }
    });

    return NextResponse.json({
      workflowId: response.workflowId,
      status: 'Completed',
      currentStage: 'Regenerated',
      data: response.composed,
      metadata: { traceId: response.traceId, regeneratedNode: nodeId }
    });
  } catch (error: any) {
    console.error('[API] Regenerate error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
