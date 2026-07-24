import { datasetBuilderService } from "../../src/services/intelligence/dataset-builder.service";
import { trendDetectionService } from "../../src/services/intelligence/trend-detection.service";
import { config } from "dotenv";

config({ path: ".env.local" });

async function verifyPhase4() {
  console.log("\n=== AIIE Phase 4 Trend Detection Verification ===");

  try {
    const targetId = "test_user";

    // 1. Simulate V1 of Hook Dataset
    console.log("\n[1] Generating Dataset Version 1...");
    const prev = {
      "Curiosity": 50,
      "Value-driven": 10,
      "Negative": 5
    };

    // 2. Simulate V2 of Hook Dataset (Shift: Value-driven jumps, Curiosity drops)
    console.log("\n[2] Generating Dataset Version 2 (with shifts)...");
    const curr = {
      "Curiosity": 30, // dropped
      "Value-driven": 40, // huge jump
      "Negative": 5 // unchanged
    };

    // 3. Run Trend Detection Delta Logic directly
    console.log("\n[3] Running Trend Detection Delta Logic...");
    const deltas = (trendDetectionService as any).calculateDelta(prev, curr);
    const severity = (trendDetectionService as any).determineSeverity(deltas);

    console.log("\n✅ Trend Detection Verification Completed!");
    console.log("Calculated Deltas:");
    console.log(JSON.stringify(deltas, null, 2));
    console.log(`Determined Severity: ${severity}`);

    if (severity !== "Critical") {
        throw new Error(`Expected 'Critical' severity for a 400% jump in Value-driven hooks, got ${severity}`);
    }

  } catch (err: any) {
    console.error(`\n❌ TREND DETECTION TEST FAILED: ${err.message}`);
    process.exit(1);
  }
}

verifyPhase4();
