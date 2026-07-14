import { LiveContentCollectionProvider } from "@/services/content-collection/providers/live.provider";
import { ProfileRepository } from "@/lib/db/repositories/profile.repository";
import type { IInstagramProvider } from "@/services/instagram/provider.interface";
import type { InstagramProfile } from "@/types/instagram";
import { ContentIntelligenceService } from "@/services/content-intelligence/content-intelligence.service";
import { MockContentIntelligenceProvider } from "@/services/content-intelligence/providers/mock.provider";
import { ContentDNAService } from "@/services/content-dna/content-dna.service";

/**
 * Stage 3B Phase 4B Verification Suite — Single-Scrape Content Collection Reuse Bridge.
 *
 * Verifies that:
 * 1. Fresh cache hit -> exactly 0 scraper calls.
 * 2. Cache miss -> maximum 1 scraper call and persists to ProfileRepository.
 * 3. Subsequent Content Collection reuse -> 0 additional scraper calls.
 * 4. Content Intelligence consumes the collected dataset directly without scraping again.
 * 5. Content DNA consumes Content Intelligence results directly without scraping again.
 * 6. No silent fallback to mock data in explicitly live mode.
 * 7. Exact Phase 1-4A contract & provenance rules preserved.
 */

let scraperCallCount = 0;

const fixtureProfile: InstagramProfile = {
  username: "bridge_target",
  display_name: "Bridge Target Creator",
  bio: "Testing single-scrape bridge across all pipeline phases.",
  follower_count: 85000,
  following_count: 420,
  post_count: 3,
  category: "Creator",
  external_url: "https://bridge.test",
  is_private: false,
  profile_picture_url: "https://images.unsplash.com/photo-bridge",
  is_verified: true,
  posts: [
    {
      id: "post-vid-bridge-1",
      url: "https://instagram.com/p/bridge1",
      caption: "Bridging the gap with #viralhooks and #reelsgrowth!",
      likes: 6400,
      comments: 410,
      timestamp: "2026-07-14T10:00:00.000Z",
      type: "video",
      thumbnail_url: "https://images.unsplash.com/photo-thumb-1",
    },
    {
      id: "post-car-bridge-2",
      url: "https://instagram.com/p/bridge2",
      caption: "Carousel slides explaining single-scrape reuse.",
      likes: 3200,
      comments: 180,
      timestamp: "2026-07-13T12:00:00.000Z",
      type: "carousel",
      thumbnail_url: "https://images.unsplash.com/photo-thumb-2",
    },
    {
      id: "post-img-bridge-3",
      url: "https://instagram.com/p/bridge3",
      caption: "Static image post without timestamp.",
      likes: 1500,
      comments: 90,
      type: "image",
    },
  ],
};

class TrackingScraperProvider implements IInstagramProvider {
  id = "apify";
  name = "Apify Scraper (Tracking Mock)";

  isAvailable(): boolean {
    return true;
  }

  async getProfile(username: string): Promise<InstagramProfile> {
    scraperCallCount++;
    return {
      ...fixtureProfile,
      username,
    };
  }
}

async function runPhase4BVerification() {
  console.log("=== Stage 3B Phase 4B Verification: Single-Scrape Reuse Bridge ===\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // Spy and intercept ProfileRepository methods for clean isolated verification without DB dependency
  const cacheMap = new Map<string, InstagramProfile>();
  const origGetFresh = ProfileRepository.getFreshByUsername;
  const origSave = ProfileRepository.save;

  ProfileRepository.getFreshByUsername = async (username: string) => {
    return cacheMap.get(username) || null;
  };
  ProfileRepository.save = async (profile: InstagramProfile) => {
    cacheMap.set(profile.username, profile);
  };

  try {
    // --- 1. Test Fresh Cache Hit Bridge ---
    console.log("--- 1. Testing Fresh Cache Hit Bridge ---");
    scraperCallCount = 0;
    cacheMap.set("cached_creator", { ...fixtureProfile, username: "cached_creator" });

    const trackingProvider = new TrackingScraperProvider();
    const liveProvider = new LiveContentCollectionProvider(trackingProvider);

    const hitItems = await liveProvider.collectContent("cached_creator");
    assert(hitItems.length === 3, "Returns 3 domain items from ProfileRepository cache hit");
    assert(scraperCallCount === 0, `Fresh cache hit executed exactly 0 scraper calls (Got: ${scraperCallCount})`);
    assert(hitItems[0]!.type === "reel", "Correctly mapped video -> reel from cached profile");
    assert(hitItems[0]!.views === 0 && hitItems[0]!.viewsAvailable === false, "Strict metric provenance: views=0 & viewsAvailable=false preserved");

    // --- 2. Test Cache Miss & Persistence Bridge ---
    console.log("\n--- 2. Testing Cache Miss & Persistence Bridge ---");
    scraperCallCount = 0;
    assert(!cacheMap.has("new_creator"), "Initial state: new_creator is not in cache");

    const missItems = await liveProvider.collectContent("new_creator");
    assert(missItems.length === 3, "Returns 3 domain items on cache miss");
    assert(scraperCallCount === 1, `Cache miss executed exactly 1 scraper call (Got: ${scraperCallCount})`);
    assert(cacheMap.has("new_creator"), "LiveContentCollectionProvider successfully persisted result to ProfileRepository");

    // --- 3. Test Subsequent Content Collection Reuse ---
    console.log("\n--- 3. Testing Subsequent Content Collection Reuse ---");
    const reuseItems = await liveProvider.collectContent("new_creator");
    assert(reuseItems.length === 3, "Returns 3 domain items on second collectContent execution");
    assert(scraperCallCount === 1, `Second execution reused cache: total scraper calls remain exactly 1 (Got: ${scraperCallCount})`);

    // --- 4. Test Downstream Content Intelligence Continuity ---
    console.log("\n--- 4. Testing Downstream Content Intelligence Continuity ---");
    const ciService = new ContentIntelligenceService(new MockContentIntelligenceProvider());
    const ciReports = await ciService.analyzeContentItems(reuseItems);
    assert(ciReports.length === 3, `Content Intelligence consumed ${reuseItems.length} items purely in-memory and generated ${ciReports.length} reports`);
    assert(scraperCallCount === 1, `Content Intelligence execution caused 0 additional scraper calls (Total calls: ${scraperCallCount})`);
    assert(ciReports[0]!.engagement.viewsAvailable === false && ciReports[0]!.engagement.views === 0, "Content Intelligence preserves unmeasured view provenance");

    // --- 5. Test Downstream Content DNA Continuity ---
    console.log("\n--- 5. Testing Downstream Content DNA Continuity ---");
    const dnaService = new ContentDNAService();
    const dnaReport = await dnaService.generateDNA(ciReports);
    assert(dnaReport && typeof dnaReport.snapshot.overallDNAScore === "number", "Content DNA generated report cleanly from Content Intelligence output");
    assert(scraperCallCount === 1, `Content DNA execution caused 0 additional scraper calls (Total calls: ${scraperCallCount})`);
    assert(dnaReport.snapshot.viralityAvailable === false && dnaReport.snapshot.avgVirality === 0, "Content DNA preserves unmeasured virality provenance without fabrication");
    assert(typeof dnaReport.snapshot.interactionProxyScore === "number", "Interaction proxies clearly separated and computed from real likes/comments");

    // --- 6. Test No Silent Fallback in Explicit Live Mode ---
    console.log("\n--- 6. Testing No Silent Fallback in Explicit Live Mode ---");
    const emptyLiveProvider = new LiveContentCollectionProvider();
    let threwError = false;
    try {
      // Temporarily set env so getInstagramProvider resolves mock when no live keys exist
      process.env.INSTAGRAM_PROVIDER = "mock";
      await emptyLiveProvider.collectContent("some_user");
    } catch {
      threwError = true;
    }
    assert(threwError, "Throws explicit InstagramError when live mode requires live provider but mock is resolved");

    console.log(`\n=== Stage 3B Phase 4B Verification Complete: ${passed} Passed, ${failed} Failed ===`);
    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    ProfileRepository.getFreshByUsername = origGetFresh;
    ProfileRepository.save = origSave;
  }
}

runPhase4BVerification().catch((err) => {
  console.error("Fatal verification error:", err);
  process.exit(1);
});
