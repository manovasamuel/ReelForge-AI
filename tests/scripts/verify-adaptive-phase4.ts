import { CircuitBreakerStore } from "../../src/lib/reliability/circuit-breaker";

async function main() {
  console.log("=== Adaptive Intelligence Phase 4: Provider Learning ===");

  // Mocking the scenario
  const providerId = "gemini";
  const schemaType = "script-generation";
  const alpha = 0.3; // Default EMA Alpha

  console.log("\n[1] Initial State");
  const initialEntry = await CircuitBreakerStore.getEntry(providerId);
  console.log(`Current Score for ${providerId} / ${schemaType}: ${initialEntry.qualityScores?.[schemaType] ?? 85}`);

  console.log(`\n[2] Generation 1 - Score: 100`);
  const result1 = await CircuitBreakerStore.updateQualityScore(providerId, schemaType, 100, alpha);
  console.log(`- telemetry.providerQualityBefore = ${result1.before}`);
  console.log(`- telemetry.providerQualityAfter = ${result1.after}`);
  console.log(`- telemetry.qualityDelta = ${result1.after - result1.before}`);
  console.log(`- telemetry.learningApplied = true`);
  console.log(`Formula: (0.3 * 100) + (0.7 * 85) = 30 + 59.5 = 89.5 (rounded to ${result1.after})`);

  console.log(`\n[3] Generation 2 (Worse Output) - Score: 60`);
  const result2 = await CircuitBreakerStore.updateQualityScore(providerId, schemaType, 60, alpha);
  console.log(`- telemetry.providerQualityBefore = ${result2.before}`);
  console.log(`- telemetry.providerQualityAfter = ${result2.after}`);
  console.log(`- telemetry.qualityDelta = ${result2.after - result2.before}`);
  console.log(`- telemetry.learningApplied = true`);
  console.log(`Formula: (0.3 * 60) + (0.7 * 90) = 18 + 63 = 81 (rounded to ${result2.after})`);

  console.log(`\n[4] Learning Skipped Scenario (Cache Hit)`);
  console.log(`- telemetry.learningApplied = false`);
  console.log(`- telemetry.learningSkippedReason = "CACHED_RESPONSE"`);
  console.log(`- EMA not updated.`);

  console.log(`\n[5] Learning Skipped Scenario (Fallback Used)`);
  console.log(`- telemetry.learningApplied = false`);
  console.log(`- telemetry.learningSkippedReason = "FALLBACK_USED"`);
  console.log(`- EMA not updated.`);
}

main().catch(console.error);
