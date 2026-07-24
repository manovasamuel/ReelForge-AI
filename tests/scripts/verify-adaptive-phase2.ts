import { ScriptGenerationEvaluator } from "../../src/services/ai/adaptive/evaluators/script-generation.evaluator";
import type { ReelContentPackage } from "../../src/types/script-generation";

async function main() {
  console.log("=== Adaptive Intelligence Phase 2: Observation Mode ===");
  
  const evaluator = new ScriptGenerationEvaluator();
  
  // 1. Example of a PERFECT output
  const perfectOutput: ReelContentPackage = {
    hook: { voiceover: "Are you struggling to write clean code? Stop doing this one thing." },
    scenes: [
      { visual: "Screen recording", voiceover: "Most developers overcomplicate their architecture.", duration: "3s" },
      { visual: "Code snippet", voiceover: "By applying the Ponytail method, you strip away abstractions.", duration: "4s" }
    ],
    cta: { primaryCTA: "Follow for more lazy developer tips!" }
  } as any;

  console.log("\n[Test 1] Evaluating Perfect Output");
  const perfectEval = evaluator.evaluate(perfectOutput);
  console.log("Score:", perfectEval.score); // Should be 100
  console.log("Failed Rules:", perfectEval.failedRules);

  // 2. Example of a FLAWED output (Missing CTA, Missing Hook, very short)
  const flawedOutput: ReelContentPackage = {
    hook: { voiceover: "" }, // Missing
    scenes: [
      { visual: "Me talking", voiceover: "Hello world.", duration: "2s" }
    ],
    cta: { primaryCTA: "" } // Missing
  } as any;

  console.log("\n[Test 2] Evaluating Flawed Output");
  const flawedEval = evaluator.evaluate(flawedOutput);
  console.log("Score:", flawedEval.score); 
  console.log("Failed Rules:", flawedEval.failedRules);
  
  // 3. Example Telemetry Log (Simulating the output from AIService)
  console.log("\n[Test 3] Example Telemetry Output");
  console.log(`[AIService Telemetry] Domain: [Script Generation] | Provider: [gemini] | Model: [gemini-1.5-flash] | Latency: 4200ms | Tokens: 450 (Prompt: 300, Comp: 150) | Est. Cost: $0.0003 | Fallback Used: false | Score: ${flawedEval.score}`);
}

main().catch(console.error);
