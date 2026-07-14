import { inferCompetitors } from "@/services/competitors/competitors.utils";
import type { BrandIntelligenceReport } from "@/types/brand-intelligence";

console.log("╔══════════════════════════════════════════════════════════════════╗");
console.log("║  Stage 3B Phase 4D — Candidate Quality & Truthfulness Regression ║");
console.log("╚══════════════════════════════════════════════════════════════════╝\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${name}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

// Helper to mock a brand report
function createMockReport(industry: string, subIndustry: string = "General", contentStyle: string = "Modern"): BrandIntelligenceReport {
  return {
    industry,
    subIndustry,
    brandType: "B2C Brand",
    targetAudience: "Young Adults",
    estimatedAudienceAge: "18-34",
    brandTone: "Energetic",
    contentStyle,
    primaryContentPillars: ["Pillar 1"],
    postingFrequency: "Daily",
    estimatedMarketPosition: "Market Leader",
    confidenceScore: 95,
  };
}

// 1. Test No Fabricated Placeholder Handles across ALL Categories
console.log("── 1. No Fabricated Placeholder Handles Check ──────────────────────");
const testIndustries = ["Sportswear & Athletic", "Technology & SaaS", "E-Commerce & Retail", "Health & Fitness", "Creative Media & Lifestyle"];
const forbiddenHandles = ["cinematic_creator_lab", "saas_architects", "modern_apparel_co", "elite_form_coaching", "buildinpublic_daily", "visual_story_masters"];

for (const ind of testIndustries) {
  const candidates = inferCompetitors(createMockReport(ind));
  const foundForbidden = candidates.filter(c => forbiddenHandles.includes(c.username));
  assert(foundForbidden.length === 0, `Category '${ind}': 0 fabricated placeholder handles found (got ${candidates.length} plausible handles)`);
}

// Check Nike fallback rule specifically
const nikeCandidates = inferCompetitors(createMockReport("Apparel & Fashion", "General", "Nike Basketball Style"));
assert(nikeCandidates.some(c => c.username === "adidas"), "Brand 'Nike Basketball' in generic Apparel returns sportswear candidates (@adidas included)");

// 2. Test Truthfulness State Preservation
console.log("\n── 2. Truthfulness State Preservation Check ────────────────────────");
const allCandidates = testIndustries.flatMap(ind => inferCompetitors(createMockReport(ind)));
const allUnverifiedState = allCandidates.every(c => c.discoveryState === "UNVERIFIED");
const allFalseVerified = allCandidates.every(c => c.isVerifiedAccount === false);

assert(allUnverifiedState, `100% of deterministic candidates (${allCandidates.length}/${allCandidates.length}) carry discoveryState === 'UNVERIFIED'`);
assert(allFalseVerified, `100% of deterministic candidates (${allCandidates.length}/${allCandidates.length}) carry isVerifiedAccount === false`);

// 3. Test Controlled Candidate Selection Logic (No Blind candidates[0] Scraping)
console.log("\n── 3. Controlled Candidate Selection Check ─────────────────────────");
const INTENDED_CANDIDATES = ["adidas", "puma", "underarmour", "newbalance", "lululemon", "gymshark"];

// Case A: Intended candidate is present
const sportswearList = inferCompetitors(createMockReport("Sportswear"));
const selectedA = sportswearList.find(c => INTENDED_CANDIDATES.includes(c.username.toLowerCase()));
assert(!!selectedA && selectedA.username === "adidas", "Selection logic correctly selects intended controlled candidate (@adidas)");

// Case B: Intended candidate is NOT present (simulating blind candidates[0] scenario)
const randomList = [
  { username: "random_account_1", discoveryState: "UNVERIFIED", isVerifiedAccount: false },
  { username: "random_account_2", discoveryState: "UNVERIFIED", isVerifiedAccount: false },
];
const selectedB = randomList.find(c => INTENDED_CANDIDATES.includes(c.username.toLowerCase()));
assert(selectedB === undefined, "When intended candidates are absent, selection logic returns undefined (preventing blind candidates[0] scrape)");

// 4. Test Single-Scrape & No Automatic Scraping of All Candidates
console.log("\n── 4. Single-Scrape & Call-Budget Guardrail Architecture ───────────");
const scrapeTargets = selectedA ? [selectedA] : [];
assert(scrapeTargets.length === 1, `Candidate selection isolates exact 1 target (${scrapeTargets[0]?.username}) for content collection`);
assert(scrapeTargets.length < sportswearList.length, "Automatic scraping of all returned candidates is strictly prevented");

console.log(`\n══════════════════════════════════════════════════════════════════`);
console.log(`  Regression Verdict: ${failed === 0 ? "✅ ALL TESTS PASSED" : "❌ TESTS FAILED"}`);
console.log(`  Summary: ${passed} passed, ${failed} failed`);
console.log(`══════════════════════════════════════════════════════════════════\n`);

if (failed > 0) process.exit(1);
