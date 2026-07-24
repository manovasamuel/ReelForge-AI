import './setup-env';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runValidation() {
  const { db } = await import('../lib/db');
  const { instagramProfiles, aiExecutions } = await import('../lib/db/schema');
  const { aiosOrchestrator } = await import('../services/aios/orchestrator.service');
  const { workflowStateManager } = await import('../services/aios/workflow-state.manager');

  if (!db) {
    console.error("❌ Database client is null. DATABASE_URL was not loaded correctly.");
    process.exit(1);
  }

  console.log("🚀 Starting ReelForge E2E Validation Harness\n");

  const startTime = Date.now();
  let marks: Record<string, number> = {};
  
  const markTime = (name: string) => {
    marks[name] = Date.now();
  };
  
  const getTime = (startName: string, endName: string) => {
    return ((marks[endName] - marks[startName]) / 1000).toFixed(2) + "s";
  };

  try {
    // 1. Setup Mock Data
    console.log("📦 Step 1: Seeding Mock Profile");
    const testUsername = `test_profile_${Date.now()}`;
    const [profile] = await db.insert(instagramProfiles).values({
      username: testUsername,
      displayName: "Test Profile",
      bio: "I teach founders how to scale their SaaS using AI. #buildinpublic #saas",
      isVerified: false,
    }).returning();
    
    console.log(`✅ Created profile: @${profile.username} (ID: ${profile.id})\n`);

    // 2. Intelligence Generation (L5 & L6)
    console.log("🧠 Step 2: Generating Intelligence (Ideation - Paused Workflow)");
    markTime('intel_start');
    
    const intelResponse = await aiosOrchestrator.run({
      userMessage: "Generate a hook and script based on my profile.",
      profileContext: { profileId: profile.id },
      testInjection: {
        failOnNodeId: 'script',
        failureMode: '500'
      }
    });

    markTime('intel_end');
    
    if (!intelResponse.composed.failures.some(f => f.nodeId === 'script')) {
      throw new Error(`Expected workflow to fail at script node. Got failures: ${JSON.stringify(intelResponse.composed.failures)}`);
    }
    console.log(`✅ Hook generated successfully, but script failed as expected (injected error).`);
    console.log(`⏱️  Time: ${getTime('intel_start', 'intel_end')}`);
    console.log(`🔄 Workflow ID: ${intelResponse.workflowId}\n`);
    console.log(`✅ Intelligence & Ideation generated successfully.`);
    console.log(`⏱️  Time: ${getTime('intel_start', 'intel_end')}`);
    console.log(`🔄 Workflow ID: ${intelResponse.workflowId}\n`);
    
    const workflowId = intelResponse.workflowId!;

    // 3. Resume Workflow
    console.log("\n▶️ Step 3: Resuming Workflow (Script Generation)");
    markTime('resume_start');
    
    const resumeResponse = await aiosOrchestrator.run({
      userMessage: "Generate a hook and script based on my profile.",
      profileContext: { profileId: profile.id },
      resumeWorkflowId: workflowId
    });

    markTime('resume_end');

    if (!resumeResponse.composed.success) {
      throw new Error(`Expected workflow to complete successfully. Got: failed`);
    }
    console.log(`✅ Workflow resumed and completed successfully.`);
    console.log(`⏱️  Time: ${getTime('resume_start', 'resume_end')}\n`);

    // 4. Single Node Regeneration
    console.log("♻️ Step 4: Testing Single Node Regeneration");
    console.log("Clearing 'hook' state...");
    await workflowStateManager.clearNodeState(workflowId, 'hook');
    
    markTime('regen_start');
    const regenResponse = await aiosOrchestrator.run({
      userMessage: "Generate a hook and script based on my profile.",
      profileContext: { profileId: profile.id },
      resumeWorkflowId: workflowId,
    });
    markTime('regen_end');

    if (!regenResponse.composed.success) {
       throw new Error(`Expected workflow to complete after regeneration. Got: failed`);
    }
    console.log(`✅ Regeneration successful.`);
    console.log(`⏱️  Time: ${getTime('regen_start', 'regen_end')}\n`);

    // 6. Gather Performance Benchmarks & Provider Stats
    console.log("📊 Step 6: Telemetry & Performance Benchmarks");
    const executions = await db.select()
      .from(aiExecutions)
      .orderBy(desc(aiExecutions.createdAt))
      .limit(10);

    let totalTokens = 0;
    let totalCost = 0;
    
    console.log(`\n--- Provider Execution Log ---`);
    executions.forEach(exec => {
      console.log(`[${exec.providerId}] Latency: ${exec.latencyMs}ms | Tokens: ${exec.totalTokens} | Prompt: ${exec.promptTokens} | Completion: ${exec.completionTokens}`);
      totalTokens += (exec.totalTokens || 0);
      totalCost += Number(exec.costEstimateUsd || 0);
    });

    console.log(`\n--- Aggregate Metrics ---`);
    console.log(`Total Tokens Used: ${totalTokens}`);
    console.log(`Estimated Cost: $${totalCost.toFixed(4)}`);
    console.log(`Total Validation Time: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);

    console.log("\n✅ E2E Validation Completed Successfully!");

  } catch (error) {
    console.error("\n❌ Validation Failed:");
    console.error(error);
    process.exit(1);
  }
}

runValidation();
