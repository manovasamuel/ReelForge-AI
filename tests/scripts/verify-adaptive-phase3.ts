import { PromptBuilder } from "../../src/services/ai/prompt.builder";
import type { AIPromptPayload } from "../../src/services/ai/provider.interface";

async function main() {
  console.log("=== Adaptive Intelligence Phase 3: Adaptive Revision ===");

  const originalPayload: AIPromptPayload<any> = {
    systemPrompt: "You are a ReelForge script writer.",
    userPrompt: "Write a script about software engineering.",
    expectedSchemaDescription: '{"hook": {"voiceover": "string"}, "scenes": [], "cta": {"primaryCTA": "string"}}',
    schemaType: "script-generation",
    fallbackData: {},
  };

  const flawedOutput = {
    hook: { voiceover: "" },
    scenes: [
      { visual: "Me talking", voiceover: "Hello world.", duration: "2s" }
    ],
    cta: { primaryCTA: "" }
  };

  const failedRules = [
    "MISSING_HOOK: The script is missing a compelling hook.",
    "MISSING_CTA: The script is missing a Call to Action (CTA)."
  ];

  console.log("\n[1] Constructing Adaptive Revision Prompt...");
  const revisionPrompt = PromptBuilder.buildAdaptiveRevisionPrompt(
    originalPayload,
    flawedOutput,
    failedRules
  );

  console.log("\n[Revision Prompt Content]\n");
  console.log("--- SYSTEM ---");
  console.log(revisionPrompt.systemPrompt);
  console.log("--- USER ---");
  console.log(revisionPrompt.userPrompt);

  console.log("\n[2] Success Scenario");
  console.log("If the new score (100) - original score (70) >= 10:");
  console.log(`- telemetry.revisionSucceeded = true`);
  console.log(`- telemetry.revisionRejectedReason = 'ACCEPTED'`);
  console.log(`- telemetry.adaptiveRevisionsCount = 1`);
  console.log(`- telemetry.scoreImprovement = 30`);
  console.log(`- data = new_revision_payload`);

  console.log("\n[3] Failure Scenario (Below Threshold)");
  console.log("If the new score (75) - original score (70) < 10:");
  console.log(`- telemetry.revisionSucceeded = false`);
  console.log(`- telemetry.revisionRejectedReason = 'BELOW_THRESHOLD'`);
  console.log(`- telemetry.adaptiveRevisionsCount = 0`);
  console.log(`- data = original_flawed_output`);

  console.log("\n[4] Failure Scenario (Worse output)");
  console.log("If the new score (60) - original score (70) <= 0:");
  console.log(`- telemetry.revisionSucceeded = false`);
  console.log(`- telemetry.revisionRejectedReason = 'NO_IMPROVEMENT'`);
  console.log(`- telemetry.adaptiveRevisionsCount = 0`);
  console.log(`- data = original_flawed_output`);

  console.log("\n[5] Failure Scenario (Timeout / Crash)");
  console.log("If the revision LLM call throws an error:");
  console.log(`- telemetry.revisionSucceeded = false`);
  console.log(`- telemetry.revisionRejectedReason = 'REVISION_FAILED'`);
  console.log(`- Catch block swallows error.`);
  console.log(`- data = original_flawed_output`);
}

main().catch(console.error);
