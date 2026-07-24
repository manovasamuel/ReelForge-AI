import { test, expect } from "@playwright/test";
import { PromptBuilder } from "@/services/ai/prompt.builder";
import { ResponseNormalizer } from "@/services/ai/response.normalizer";
import { AIQualityTester } from "@/services/ai/testing/quality.tester";
import { DevPromptLogger } from "@/services/ai/logger/dev-prompt.logger";
import type { InstagramProfile } from "@/types/instagram";
import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { ContentDNAReport } from "@/types/content-dna";
import type { ReelContentPackage } from "@/types/script-generation";

test.describe("Phase 8 — AI Quality Testing & Evaluation Suite", () => {
  const sampleProfile: InstagramProfile = {
    username: "viral_fitness_coach",
    display_name: "Coach Alex | Fitness & Fat Loss",
    bio: "Helping busy professionals lose fat & build muscle without giving up carbs. Link below 👇",
    follower_count: 145000,
    following_count: 320,
    post_count: 540,
    is_verified: true,
    profile_picture_url: "",
    category: "",
    external_url: "",
    is_private: false,
    posts: [
      { id: "1", caption: "3 biggest mistakes you make when cutting fat... #fitness", likes: 4500, comments: 320, timestamp: "2026-07-01", type: "video", thumbnail_url: "", url: "" },
    ],
  };

  const sampleBrandFallback: BrandIntelligenceReport = {
    industry: "Fitness & Health",
    subIndustry: "Online Coaching",
    brandType: "Personal Brand",
    targetAudience: "Busy professionals aged 25-40 looking for sustainable fat loss",
    estimatedAudienceAge: "25-40",
    brandTone: "Authoritative yet accessible",
    contentStyle: "Fast-paced, high-energy talking head Reels",
    primaryContentPillars: ["Fat Loss Science", "Workout Tutorials", "Nutrition Myths"],
    postingFrequency: "Daily",
    estimatedMarketPosition: "Niche Authority",
    confidenceScore: 92,
  };

  const sampleDNA = {
    id: "viral_fitness_coach",
    snapshot: {
      overallDNAScore: 94,
      sampleSize: 10,
      avgVirality: 90,
      avgReusability: 80,
      dominantCTA: "Follow for more",
      dominantHook: "Contrarian Myth-Busting",
      dominantPsychology: "Curiosity Gap & Authority",
    },
    winningHooks: {
      topHooks: [
        { hookType: "Contrarian Statement", avgVirality: 98, frequency: 1 },
      ],
      confidenceMeta: { confidence: 90, sampleCount: 10, reliability: "High" }
    },
  } as unknown as ContentDNAReport;

  const sampleScriptFallback: ReelContentPackage = {
    id: "test-script-123",
    createdAt: new Date().toISOString(),
    strategy: {
      contentGoal: "High Retention & Comment Lead Capture",
      targetAudience: "Busy professionals",
      emotion: "Curiosity & Empowerment",
      contentPillar: "Fat Loss Science",
      hookStyle: "Contrarian Statement",
      ctaStyle: "Keyword Comment DM",
      difficulty: "Low",
      estimatedPerformance: "Viral Potential",
      confidence: 95,
    },
    reelIdea: {
      title: "The 3-Step Fat Loss Cheat Code",
      summary: "How to drop 5 lbs this month without cutting carbs.",
      uniqueAngle: "Focusing on NEAT instead of HIIT cardio.",
      expectedOutcome: "Immediate lead generation via 'SHRED' keyword.",
    },
    hook: {
      firstSentence: "Stop doing HIIT cardio if you want to lose belly fat.",
      openingVisual: "Coach walking towards camera looking serious.",
      openingShot: "Medium closeup",
      textOverlay: "STOP DOING CARDIO FOR FAT LOSS 🛑",
      voiceover: "Stop doing HIIT cardio if you want to lose belly fat.",
    },
    scenes: [
      {
        sceneNumber: 1,
        title: "The Cardio Trap",
        visual: "B-roll of someone exhausted on a treadmill.",
        camera: "Static zoom",
        voiceover: "Cardio burns calories while you do it, but it spikes your hunger hormones.",
        textOverlay: "Cardio spikes hunger hormones 📈",
        duration: "0:00-0:05",
        transition: "Quick cut",
      },
    ],
    caption: {
      fullCaption: "Comment 'SHRED' and I'll send you my free 7-Day Fat Loss Protocol! 👇 #fatloss #fitness",
    },
    cta: {
      primaryCTA: "Comment 'SHRED' for free guide",
      alternativeCTA: "Link in bio",
      pinnedComment: "Drop 'SHRED' below! 👇",
    },
    hashtags: {
      groups: [{ category: "High Reach", tags: ["#fatloss", "#fitness", "#gym"] }],
      allTagsString: "#fatloss #fitness #gym",
    },
    postingRecommendation: {
      bestTime: "6:00 PM EST",
      bestDay: "Tuesday",
      coverStyle: "High contrast text overlay",
      firstComment: "Drop 'SHRED' below! 👇",
    },
    checklist: {
      hookReady: true,
      captionReady: true,
      ctaReady: true,
      hashtagsReady: true,
      coverReady: true,
      postReady: true,
    },
    productionSummary: {
      estimatedShootTime: "15 mins",
      estimatedReelDuration: "30 secs",
      editingDifficulty: "Low",
      equipmentNeeded: ["Phone", "Wireless Mic"],
      bRollCount: 2,
    },
    productionScore: {
      overallScore: 94,
      confidence: 95,
      difficulty: "Low",
      estimatedPerformance: "High",
    },
  };

  test("should verify Prompt Score >= 80 for Brand Intelligence and Script Generation", () => {
    const brandPayload = PromptBuilder.buildBrandIntelligencePrompt(sampleProfile, sampleBrandFallback);
    const scriptPayload = PromptBuilder.buildScriptGenerationPrompt(sampleDNA, sampleScriptFallback);

    const brandScore = brandPayload.compiledResult?.evaluation?.overallScore || 0;
    const scriptScore = scriptPayload.compiledResult?.evaluation?.overallScore || 0;

    expect(brandScore).toBeGreaterThanOrEqual(80);
    expect(scriptScore).toBeGreaterThanOrEqual(80);
  });

  test("should validate response completeness and output length in AIQualityTester", () => {
    const brandPayload = PromptBuilder.buildBrandIntelligencePrompt(sampleProfile, sampleBrandFallback);
    const validJson = JSON.stringify(sampleBrandFallback);

    const normalized = ResponseNormalizer.normalize(validJson, brandPayload);
    const report = AIQualityTester.evaluateBrandIntelligence(
      brandPayload.compiledResult?.evaluation?.overallScore || 85,
      validJson,
      normalized
    );

    expect(report.promptScorePassed).toBe(true);
    expect(report.outputLengthPassed).toBe(true);
    expect(report.validationSuccess).toBe(true);
    expect(report.responseCompletenessScore).toBe(100);
    expect(report.missingFields).toHaveLength(0);
    expect(report.overallPassed).toBe(true);
  });

  test("should throw validation error on empty or oversized LLM output", () => {
    const brandPayload = PromptBuilder.buildBrandIntelligencePrompt(sampleProfile, sampleBrandFallback);

    expect(() => ResponseNormalizer.normalize("", brandPayload)).toThrow(/empty/i);
    expect(() => ResponseNormalizer.normalize("   ", brandPayload)).toThrow(/empty/i);

    const oversizedText = "a".repeat(100_005);
    expect(() => ResponseNormalizer.normalize(oversizedText, brandPayload)).toThrow(/oversized/i);
  });

  test("should throw validation error when required domain fields are missing", () => {
    const brandPayload = PromptBuilder.buildBrandIntelligencePrompt(sampleProfile, sampleBrandFallback);
    const incompleteJson = JSON.stringify({
      industry: "Fitness",
      // missing brandType, targetAudience, brandTone, primaryContentPillars
    });

    expect(() => ResponseNormalizer.normalize(incompleteJson, brandPayload)).toThrow(/Missing required fields/i);
  });

  test("should record and retrieve dev prompt logs during development", () => {
    DevPromptLogger.clearLogs();
    DevPromptLogger.log({
      domain: "Brand Intelligence",
      providerId: "gemini",
      model: "gemini-2.5-flash",
      compiledPrompt: "System prompt... User prompt...",
      aiResponse: sampleBrandFallback,
      promptScore: 88,
      latencyMs: 450,
      tokenUsage: { promptTokens: 150, completionTokens: 80, totalTokens: 230 },
    });

    const logs = DevPromptLogger.getLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].domain).toBe("Brand Intelligence");
    expect(logs[0].providerId).toBe("gemini");
    expect(logs[0].promptScore).toBe(88);
    expect(logs[0].tokenUsage?.totalTokens).toBe(230);
  });
});
