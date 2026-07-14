import { inferContentIntelligence } from "../../src/services/content-intelligence/content-intelligence.utils";
import { PromptBuilder } from "../../src/services/ai/prompt.builder";
import type { CollectedContentItem } from "../../src/types/content-collection";

async function verifyStage3BPhase2Metrics() {
  console.log("=== Stage 3B Phase 2 Verification: Metric Availability & Content Intelligence Safety ===\n");

  let passed = 0;
  let failed = 0;

  function check(testName: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${details || "Condition not met"}`);
      failed++;
    }
  }

  // Fixture Items covering all cases
  const item1RealViews: CollectedContentItem = {
    id: "item-real-views-1",
    competitorUsername: "natgeo",
    thumbnailUrl: "https://example.com/thumb1.jpg",
    type: "reel",
    views: 120_000,
    viewsAvailable: true,
    likes: 8_500,
    comments: 420,
    publishDate: "2026-07-10T12:00:00Z",
    caption: "Incredible wildlife clip with #nature and #adventure insights.",
    hashtags: ["#nature", "#adventure"],
    isPinned: false,
  };

  const item2NoViewsHighEng: CollectedContentItem = {
    id: "item-no-views-higheng-2",
    competitorUsername: "natgeo",
    thumbnailUrl: "https://example.com/thumb2.jpg",
    type: "carousel",
    views: 0,
    viewsAvailable: false,
    likes: 45_000,
    comments: 3_200,
    publishDate: "2026-07-11T14:30:00Z",
    caption: "Swipe through our latest deep dive into ocean conservation #ocean #conservation",
    hashtags: ["#ocean", "#conservation"],
    isPinned: true,
  };

  const item3MissingTimestamp: CollectedContentItem = {
    id: "item-missing-ts-3",
    competitorUsername: "natgeo",
    thumbnailUrl: "https://example.com/thumb3.jpg",
    type: "post",
    views: 0,
    viewsAvailable: false,
    likes: 1_200,
    comments: 85,
    publishDate: "", // Case 5: Missing timestamp
    caption: "A quiet moment captured in the desert.",
    hashtags: [],
    isPinned: false,
  };

  const item4ZeroEngNoViews: CollectedContentItem = {
    id: "item-zero-eng-4",
    competitorUsername: "natgeo",
    thumbnailUrl: "https://example.com/thumb4.jpg",
    type: "image",
    views: 0,
    viewsAvailable: false,
    likes: 0, // Case 6: Zero likes
    comments: 0, // Case 6: Zero comments
    publishDate: "2026-07-12T09:00:00Z",
    caption: "Zero engagement fixture test.",
    hashtags: [],
    isPinned: false,
  };

  const mixedCollection = [item1RealViews, item2NoViewsHighEng, item3MissingTimestamp, item4ZeroEngNoViews];

  console.log("--- Testing inferContentIntelligence() with Mixed Availability Fixture ---");
  const reports = inferContentIntelligence(mixedCollection);

  // Case 1: Real views available
  const report1 = reports.find((r) => r.contentItemId === item1RealViews.id)!;
  check(
    "Case 1: Real views preserved and marked available",
    report1.engagement.views === 120_000 && report1.engagement.viewsAvailable === true,
    `Got views=${report1.engagement.views}, available=${report1.engagement.viewsAvailable}`
  );

  // Case 2 & 7: Views unavailable & no fabricated views/reach
  const report2 = reports.find((r) => r.contentItemId === item2NoViewsHighEng.id)!;
  check(
    "Case 2 & 7: Unavailable views remain exactly 0 with viewsAvailable=false (No reach fabrication)",
    report2.engagement.views === 0 && report2.engagement.viewsAvailable === false,
    `Got views=${report2.engagement.views}, available=${report2.engagement.viewsAvailable}`
  );

  // Case 4 & 8: High likes/comments without views does NOT assign fake virality score or synthetic conversion rates
  check(
    "Case 4 & 8: High engagement without views returns 0 for measured virality/conversion rates and viralityAvailable=false",
    report2.virality.viralityScore === 0 &&
      report2.virality.viralityAvailable === false &&
      report2.engagement.estimatedSaveRate === 0 &&
      report2.engagement.estimatedShareRate === 0,
    `Got viralityScore=${report2.virality.viralityScore}, viralityAvailable=${report2.virality.viralityAvailable}, estSaveRate=${report2.engagement.estimatedSaveRate}%, estShareRate=${report2.engagement.estimatedShareRate}%`
  );

  check(
    "Case 4b: High engagement without views isolates relative comparison purely to explicit interaction proxies",
    report2.virality.interactionProxyScore! >= 70 &&
      report2.virality.interactionProxyScore! <= 96 &&
      report2.engagement.interactionProxyRate === 48_200,
    `Got interactionProxyScore=${report2.virality.interactionProxyScore}, interactionProxyRate=${report2.engagement.interactionProxyRate}`
  );

  // Case 5: Missing timestamp explicitly preserved
  const report3 = reports.find((r) => r.contentItemId === item3MissingTimestamp.id)!;
  check(
    "Case 5: Missing timestamp preserved as empty string without recency fabrication",
    report3.publishDate === "" && report3.engagement.viewsAvailable === false,
    `Got publishDate='${report3.publishDate}'`
  );

  // Case 6: Zero likes and zero comments safely handled
  const report4 = reports.find((r) => r.contentItemId === item4ZeroEngNoViews.id)!;
  check(
    "Case 6: Zero likes, zero comments, zero views safely handled returning 0 without NaN or errors",
    report4.virality.viralityScore === 0 &&
      report4.engagement.estimatedSaveRate === 0 &&
      report4.engagement.estimatedShareRate === 0 &&
      !isNaN(report4.virality.interactionProxyScore || 0) &&
      report4.engagement.views === 0 &&
      report4.engagement.viewsAvailable === false,
    `Got viralityScore=${report4.virality.viralityScore}, estSaveRate=${report4.engagement.estimatedSaveRate}`
  );

  // Case 3: Mixed collection output integrity
  check(
    "Case 3: Mixed collection returns 1-to-1 exact report array size",
    reports.length === 4 && reports.map((r) => r.contentItemId).join(",") === mixedCollection.map((i) => i.id).join(",")
  );

  console.log("\n--- Testing AI Prompt Serialization (PromptBuilder.buildContentIntelligencePrompt) ---");
  const promptPayload = PromptBuilder.buildContentIntelligencePrompt(mixedCollection, reports);

  // Case 9: AI Prompt formatting & provenance instructions
  const promptText = promptPayload.userPrompt;
  check(
    "Case 9a: Prompt serializes real views clearly",
    promptText.includes("Item 1 (reel):") && promptText.includes("Views: 120000, Likes: 8500, Comments: 420")
  );

  check(
    "Case 9b: Prompt serializes unavailable views with explicit '(profile scraper)' label instead of '0 views'",
    promptText.includes("Item 2 (carousel):") && promptText.includes("Views: unavailable (profile scraper), Likes: 45000, Comments: 3200")
  );

  check(
    "Case 9c: Prompt includes strict IMPORTANT METRIC PROVENANCE instructions against view/reach/save/share hallucination",
    promptText.includes("IMPORTANT METRIC PROVENANCE:") &&
      promptText.includes("Do not interpret unavailable views as zero views or zero reach") &&
      promptText.includes("Do not invent or fabricate missing view counts") &&
      promptText.includes("Do not claim a precise view-based engagement rate, virality score, save rate, or share rate") &&
      promptText.includes("Treat save counts, share counts, view counts, and total reach as unavailable unless explicitly provided")
  );

  console.log(`\n=== Verification Results: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

verifyStage3BPhase2Metrics().catch((err) => {
  console.error("Verification script crashed:", err);
  process.exit(1);
});
