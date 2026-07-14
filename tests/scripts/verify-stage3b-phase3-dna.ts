import { aggregateContentDNA } from "../../src/services/content-dna/content-dna.utils";
import { PromptBuilder } from "../../src/services/ai/prompt.builder";
import type { ContentIntelligenceReport } from "../../src/types/content-intelligence";

console.log("=== Stage 3B Phase 3 Verification: Content DNA Metric Provenance & AI Guardrails ===\n");

// Fixture A: Profile Scraper Reports (viewsAvailable = false, viralityAvailable = false)
const unmeasuredReports: ContentIntelligenceReport[] = [
  {
    id: "ci-1",
    contentItemId: "post-1",
    thumbnailUrl: "https://example.com/thumb1.jpg",
    type: "reel",
    caption: "How to scale your creative agency from $0 to $10k/mo without paid ads #agency #business",
    publishDate: "2026-07-01T12:00:00Z",
    hook: {
      hookType: "Curiosity Gap & Open Loop",
      hookStrength: 88,
      patternInterrupt: "Bold contrarian claim right at 0.5s",
      first3Seconds: "Visual text overlay + fast cut",
    },
    captionIntelligence: {
      length: "145 words",
      cta: "Comment GUIDE for the playbook",
      emojiUsage: "Moderate (4 emojis)",
      storytelling: "PAS framework",
      readability: "Grade 6",
    },
    visual: {
      editingPace: "High velocity (2.2s cuts)",
      cameraStyle: "4K Talking head + screen overlay",
      textOverlay: "Kinetic yellow subtitles",
      colorStyle: "Dark contrast",
    },
    engagement: {
      views: 0,
      viewsAvailable: false,
      likes: 1200,
      comments: 180,
      estimatedSaveRate: 0,
      estimatedShareRate: 0,
      interactionProxyRate: 5.2,
    },
    psychology: {
      curiosity: 90,
      emotion: 75,
      authority: 85,
      socialProof: 80,
      scarcity: 65,
      relatability: 88,
    },
    virality: {
      viralityScore: 0,
      viralityAvailable: false,
      successProbability: "Unavailable (No Reach/View Data)",
      confidence: 0,
      interactionProxyScore: 85,
    },
    winningFactors: ["High interaction density", "Strong curiosity hook"],
    failureFactors: [],
    reusability: {
      score: 92,
      reusabilityLevel: "High",
      confidence: 90,
    },
    whyItWorked: ["Engaging topic + lead magnet CTA"],
  },
  {
    id: "ci-2",
    contentItemId: "post-2",
    thumbnailUrl: "https://example.com/thumb2.jpg",
    type: "reel",
    caption: "3 mistakes killing your short-form video reach in 2026 #creators #video",
    publishDate: "2026-07-02T14:30:00Z",
    hook: {
      hookType: "Negative Warning & Common Mistakes",
      hookStrength: 84,
      patternInterrupt: "Red warning sign graphic",
      first3Seconds: "Direct eye contact + urgent tone",
    },
    captionIntelligence: {
      length: "130 words",
      cta: "Save this for reference",
      emojiUsage: "Moderate (3 emojis)",
      storytelling: "Mistake -> Fix framework",
      readability: "Grade 5",
    },
    visual: {
      editingPace: "Fast (2.4s cuts)",
      cameraStyle: "Talking head + B-roll",
      textOverlay: "White subtitles with red accent",
      colorStyle: "Bright studio",
    },
    engagement: {
      views: 0,
      viewsAvailable: false,
      likes: 950,
      comments: 110,
      estimatedSaveRate: 0,
      estimatedShareRate: 0,
      interactionProxyRate: 4.1,
    },
    psychology: {
      curiosity: 82,
      emotion: 80,
      authority: 88,
      socialProof: 75,
      scarcity: 70,
      relatability: 92,
    },
    virality: {
      viralityScore: 0,
      viralityAvailable: false,
      successProbability: "Unavailable (No Reach/View Data)",
      confidence: 0,
      interactionProxyScore: 78,
    },
    winningFactors: ["Mistake framework holds retention"],
    failureFactors: [],
    reusability: {
      score: 88,
      reusabilityLevel: "High",
      confidence: 88,
    },
    whyItWorked: ["Clear actionable advice"],
  },
];

// Fixture B: Measured Reports (viewsAvailable = true, viralityAvailable = true)
const measuredReports: ContentIntelligenceReport[] = [
  {
    ...unmeasuredReports[0],
    id: "ci-measured-1",
    engagement: {
      views: 50000,
      viewsAvailable: true,
      likes: 3500,
      comments: 420,
      estimatedSaveRate: 2.4,
      estimatedShareRate: 1.8,
    },
    virality: {
      viralityScore: 91,
      viralityAvailable: true,
      successProbability: "Very High (Top 5% Portfolio Benchmark)",
      confidence: 94,
    },
  },
  {
    ...unmeasuredReports[1],
    id: "ci-measured-2",
    engagement: {
      views: 32000,
      viewsAvailable: true,
      likes: 2100,
      comments: 250,
      estimatedSaveRate: 2.1,
      estimatedShareRate: 1.5,
    },
    virality: {
      viralityScore: 86,
      viralityAvailable: true,
      successProbability: "High (Top 15% Portfolio Benchmark)",
      confidence: 90,
    },
  },
];

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, name: string, details?: string) {
  if (condition) {
    console.log(`✅ [PASS] ${name}`);
    passCount++;
  } else {
    console.error(`❌ [FAIL] ${name}`);
    if (details) console.error(`   Details: ${details}`);
    failCount++;
  }
}

// ---------------------------------------------------------
// Test 1: Aggregation with Unmeasured Reports (viewsAvailable = false)
// ---------------------------------------------------------
console.log("--- Testing aggregateContentDNA() with Unmeasured Reports ---");
const unmeasuredDNA = aggregateContentDNA(unmeasuredReports);

assert(
  unmeasuredDNA.snapshot.viralityAvailable === false,
  "viralityAvailable: false survives Content Intelligence -> Content DNA aggregation"
);

assert(
  unmeasuredDNA.snapshot.avgVirality === 0,
  `avgVirality remains exactly 0 when measured virality is unavailable (got ${unmeasuredDNA.snapshot.avgVirality})`
);

assert(
  !isNaN(unmeasuredDNA.snapshot.overallDNAScore) && isFinite(unmeasuredDNA.snapshot.overallDNAScore),
  "No NaN or Infinity produced in overallDNAScore when virality is unavailable"
);

assert(
  unmeasuredDNA.snapshot.interactionProxyScore === 82 && unmeasuredDNA.snapshot.interactionProxyRate === 4.7,
  `Interaction proxies correctly aggregated and separated from measured virality (proxy score: ${unmeasuredDNA.snapshot.interactionProxyScore}, rate: ${unmeasuredDNA.snapshot.interactionProxyRate})`
);

assert(
  unmeasuredDNA.winningHooks.topHooks.every((h) => h.avgVirality === 0 && h.viralityAvailable === false),
  "Winning hooks maintain avgVirality = 0 and viralityAvailable = false without reach fabrication"
);

// ---------------------------------------------------------
// Test 2: Aggregation with Measured Reports (viewsAvailable = true)
// ---------------------------------------------------------
console.log("\n--- Testing aggregateContentDNA() with Measured Reports ---");
const measuredDNA = aggregateContentDNA(measuredReports);

assert(
  measuredDNA.snapshot.viralityAvailable === true,
  "viralityAvailable: true correctly preserved when genuine reach metrics exist"
);

assert(
  measuredDNA.snapshot.avgVirality === 89,
  `avgVirality correctly computed from empirical scores when available (got ${measuredDNA.snapshot.avgVirality})`
);

assert(
  measuredDNA.winningHooks.topHooks.some((h) => h.avgVirality > 0 && h.viralityAvailable === true),
  "Winning hooks correctly display measured virality when available"
);

// ---------------------------------------------------------
// Test 3: AI Prompt Serialization Guardrails (PromptBuilder.buildContentDNAPrompt)
// ---------------------------------------------------------
console.log("\n--- Testing PromptBuilder.buildContentDNAPrompt() Guardrails ---");
const unmeasuredPrompt = PromptBuilder.buildContentDNAPrompt(unmeasuredReports, unmeasuredDNA);

assert(
  unmeasuredPrompt.userPrompt.includes("IMPORTANT METRIC PROVENANCE:") &&
  unmeasuredPrompt.userPrompt.includes("derived from profile-scraper content where measured reach and view counts are unavailable (viralityAvailable = false)"),
  "Prompt compiler injects strict IMPORTANT METRIC PROVENANCE rules when reach is unavailable"
);

assert(
  unmeasuredPrompt.userPrompt.includes("Virality Score: 0 (Profile Scraper - Unmeasured) | Interaction Proxy Score: 85"),
  "Prompt compiler explicitly labels unmeasured virality and surfaces interaction proxies clearly for the AI"
);

assert(
  unmeasuredPrompt.expectedSchemaDescription.includes('"viralityAvailable": false') &&
  unmeasuredPrompt.expectedSchemaDescription.includes('"avgVirality": 0'),
  "Expected JSON schema description enforces avgVirality=0 and viralityAvailable=false"
);

const measuredPrompt = PromptBuilder.buildContentDNAPrompt(measuredReports, measuredDNA);

assert(
  !measuredPrompt.userPrompt.includes("IMPORTANT METRIC PROVENANCE:"),
  "Prompt compiler excludes negative metric provenance instructions when genuine reach is available"
);

assert(
  measuredPrompt.userPrompt.includes("Virality Score: 91"),
  "Prompt compiler serializes genuine empirical virality scores clearly"
);

console.log(`\n=== Verification Results: ${passCount} Passed, ${failCount} Failed ===`);
if (failCount > 0) {
  process.exit(1);
}
