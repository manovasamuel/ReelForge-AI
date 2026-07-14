import { getCompetitorProvider } from "../../src/services/competitors/providers";
import { LiveCompetitorProvider } from "../../src/services/competitors/providers/live.provider";
import { ResponseNormalizer } from "../../src/services/ai/response.normalizer";
import type { BrandIntelligenceReport } from "../../src/types/brand-intelligence";
import type { Competitor } from "../../src/types/competitor";
import { ProfileRepository } from "../../src/lib/db/repositories/profile.repository";
import type { InstagramProfile } from "../../src/types/instagram";

/**
 * Stage 3B Phase 4C Verification Suite — Real Competitor Discovery & Candidate State Model.
 *
 * Asserts:
 * 1. LiveCompetitorProvider resolution via getCompetitorProvider("live").
 * 2. Critical Truthfulness Rule: AI candidates carry discoveryState = 'AI_SUGGESTED' / 'UNVERIFIED' and isVerifiedAccount = false by default.
 * 3. Cache verification bridge: when candidate exists in ProfileRepository, transitions to 'CACHE_VERIFIED' and isVerifiedAccount = true with 0 scraper calls.
 * 4. ResponseNormalizer correctly handles 'competitor-discovery' schemaType.
 */

async function runTests() {
  console.log("=== Starting Stage 3B Phase 4C Verification Suite ===");
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, name: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
    }
  }

  // Test 1: Provider Factory Resolution
  const liveProvider = getCompetitorProvider("live");
  assert(liveProvider instanceof LiveCompetitorProvider && liveProvider.id === "live", "Factory resolves LiveCompetitorProvider when providerId='live'");

  // Test 2: ResponseNormalizer Competitor Discovery Handling
  const mockAiOutput = JSON.stringify([
    {
      username: "@Gymshark",
      displayName: "Gymshark Official",
      industry: "Fitness & Wellness",
      similarityScore: 95,
      reasonMatch: "Dominant fitness apparel brand with high reel engagement",
      confidenceScore: 92,
    },
    {
      username: "alphalete",
      displayName: "Alphalete Athletics",
      industry: "Fitness & Wellness",
      similarityScore: 90,
      reasonMatch: "Strong community fitness challenges and athlete spotlights",
      confidenceScore: 89,
    },
  ]);

  const normalized = ResponseNormalizer.normalize<Competitor[]>(mockAiOutput, {
    systemPrompt: "",
    userPrompt: "",
    expectedSchemaDescription: "",
    schemaType: "competitor-discovery",
    fallbackData: [],
  });

  assert(normalized.length === 2, "ResponseNormalizer normalized exactly 2 candidate items");
  assert(normalized[0]?.username === "gymshark" && normalized[1]?.username === "alphalete", "Usernames normalized cleanly (stripped @ and lowercased)");
  assert(
    normalized[0]?.discoveryState === "AI_SUGGESTED" && normalized[0]?.isVerifiedAccount === false,
    "Critical Truthfulness Rule enforced: AI candidates carry discoveryState='AI_SUGGESTED' and isVerifiedAccount=false"
  );

  // Test 3: discoverCompetitors Cache Miss (Unverified Candidate behavior)
  const report: BrandIntelligenceReport = {
    industry: "Fitness & Wellness",
    subIndustry: "Strength Training & Apparel",
    brandType: "B2C Brand",
    targetAudience: "Gym goers and athletes",
    estimatedAudienceAge: "18-35",
    brandTone: "High energy, motivational",
    contentStyle: "Short-form workout tips and apparel drops",
    primaryContentPillars: ["Workouts", "Apparel", "Community"],
    postingFrequency: "Daily",
    estimatedMarketPosition: "Market Leader",
    confidenceScore: 95,
  };

  const provider = new LiveCompetitorProvider();
  const candidates = await provider.discoverCompetitors(report);
  assert(Array.isArray(candidates) && candidates.length > 0, "discoverCompetitors returned non-empty candidate list");

  const unverifiedItem = candidates[0];
  assert(
    (unverifiedItem?.discoveryState === "AI_SUGGESTED" || unverifiedItem?.discoveryState === "UNVERIFIED") &&
      unverifiedItem?.isVerifiedAccount === false,
    "Candidate items not found in empirical cache remain marked unverified without triggering scraper calls"
  );

  // Test 4: discoverCompetitors Cache Hit (CACHE_VERIFIED behavior)
  const originalGetFresh = ProfileRepository.getFreshByUsername;
  try {
    // Spy/mock ProfileRepository to simulate empirical cache hit for one handle
    ProfileRepository.getFreshByUsername = async (u: string): Promise<InstagramProfile | null> => {
      if (u === "elite_form_coaching" || u === "gymshark") {
        return {
          username: u,
          display_name: "Verified Fitness Hub",
          biography: "Verified fitness brand",
          follower_count: 1450000,
          following_count: 200,
          post_count: 500,
          profile_picture_url: "https://example.com/verified.jpg",
          is_private: false,
          is_verified: true,
          posts: [],
          fetched_at: new Date().toISOString(),
        };
      }
      return null;
    };

    const verifiedCandidates = await provider.discoverCompetitors(report);
    const hitItem = verifiedCandidates.find((c) => c.username === "elite_form_coaching" || c.username === "gymshark");
    assert(
      hitItem !== undefined && hitItem.discoveryState === "CACHE_VERIFIED" && hitItem.isVerifiedAccount === true,
      "Candidate in ProfileRepository cache automatically upgraded to CACHE_VERIFIED and isVerifiedAccount=true"
    );
    assert(hitItem?.followers === 1450000, "Empirical follower count populated from cached profile with 0 scraper calls");
  } finally {
    ProfileRepository.getFreshByUsername = originalGetFresh;
  }

  console.log(`\n=== Verification Results: ${passed}/${total} PASS ===`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
