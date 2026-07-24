import { NextRequest, NextResponse } from 'next/server';
import { blueprintRequestSchema } from '../schemas';
import { aiosOrchestrator } from '@/services/aios/orchestrator.service';
import { workflowStateManager } from '@/services/aios/workflow-state.manager';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = blueprintRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const { workflowId, selectedConceptId } = result.data;

    // Retrieve state to verify the workflow exists and fetch concepts
    const state = await workflowStateManager.getWorkflow(workflowId);
    
    // Extract the selected concept from the ideation array
    const ideationOutput = state.contextStore['ideate_hook'];
    if (!ideationOutput || !Array.isArray(ideationOutput)) {
      return NextResponse.json({ error: 'Ideation phase not completed for this workflow.' }, { status: 400 });
    }

    const selectedConcept = ideationOutput.find((c: any) => c.id === selectedConceptId);
    if (!selectedConcept) {
      return NextResponse.json({ error: 'Selected concept not found.' }, { status: 400 });
    }

    // Inject the selected concept back into the context store so BlueprintAgent can read it
    await workflowStateManager.writeToContextStore(workflowId, 'selected_concept', selectedConcept);

    // AIOS Execution (Stage 2 - Blueprint)
    // The resume capability will automatically skip the already-completed Intelligence and Ideation nodes.
    const response = await aiosOrchestrator.run({
      userMessage: `Proceeding with selected concept: ${selectedConcept.title}`,
      profileContext: { profileId: 'unknown' }, // Will be sourced from state ideally
      resumeWorkflowId: workflowId,
      forcedClassification: {
        // Run full DAG. Already-completed nodes are automatically skipped.
        requiredTaskTypes: ['generate_intelligence', 'ideate_hook', 'generate_blueprint', 'generate_discovery'],
        complexity: 'complex',
      }
    });

    return NextResponse.json({
      workflowId: response.workflowId,
      status: 'Completed',
      currentStage: 'Blueprint',
      data: response.composed,
      metadata: { traceId: response.traceId }
    });
  } catch (error: any) {
    console.error('[API] Blueprint error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
