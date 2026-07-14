import { normalizeInstagramUsername, isValidInstagramProfile } from "../../src/services/instagram/instagram.utils";
import { FailoverInstagramProvider } from "../../src/services/instagram/providers/failover.provider";
import { ProfileRepository } from "../../src/lib/db/repositories/profile.repository";
import type { InstagramProfile } from "../../src/types/instagram";

console.log("=== Stage 3B Phase 4A Verification: Username Normalization & Scraper Cache ===\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName}${details ? ` (${details})` : ""}`);
    failed++;
  }
}

// ============================================================================
// 1. Username Normalization Verification
// ============================================================================
console.log("--- 1. Testing normalizeInstagramUsername() ---");
assert(normalizeInstagramUsername("@nike") === "nike", "Strips leading @ correctly (@nike -> nike)");
assert(normalizeInstagramUsername("nike") === "nike", "Handles plain lowercase username (nike -> nike)");
assert(normalizeInstagramUsername("  NIKE  ") === "nike", "Trims whitespace and converts uppercase (  NIKE   -> nike)");
assert(normalizeInstagramUsername("https://www.instagram.com/nike/") === "nike", "Parses standard URL (https://www.instagram.com/nike/ -> nike)");
assert(normalizeInstagramUsername("https://instagram.com/nike?igshid=123") === "nike", "Parses URL with query params (https://instagram.com/nike?igshid=123 -> nike)");
assert(normalizeInstagramUsername("invalid/username/too/long/or/bad") === "", "Returns empty string for invalid username format");

// ============================================================================
// 2. Runtime JSON Validation Verification
// ============================================================================
console.log("\n--- 2. Testing isValidInstagramProfile() Runtime Validation ---");
const validProfile: InstagramProfile = {
  username: "nike",
  display_name: "Nike",
  bio: "Just do it.",
  profile_picture_url: "https://example.com/pic.jpg",
  follower_count: 300000000,
  following_count: 150,
  post_count: 1200,
  category: "Brand",
  external_url: "https://nike.com",
  is_private: false,
  is_verified: true,
  posts: [
    {
      id: "post_1",
      thumbnail_url: "https://example.com/thumb.jpg",
      url: "https://instagram.com/p/123/",
      caption: "Just do it #nike",
      likes: 50000,
      comments: 1200,
      timestamp: "2026-07-14T10:00:00Z",
      type: "video",
    },
  ],
};

assert(isValidInstagramProfile(validProfile) === true, "Validates well-formed InstagramProfile object");
assert(isValidInstagramProfile({ username: "" }) === false, "Rejects profile with empty username");
assert(isValidInstagramProfile({ username: "nike", follower_count: "300m" }) === false, "Rejects profile with non-numerical follower count");
assert(isValidInstagramProfile("just string") === false, "Rejects non-object string payload");
assert(isValidInstagramProfile({ ...validProfile, posts: [{ caption: "Missing ID" }] }) === false, "Rejects posts array containing malformed post items without id");

// ============================================================================
// 3. Cache Integration & Call Count Verification
// ============================================================================
console.log("\n--- 3. Testing Cache Integration & Call Counting ---");

async function runCacheTests() {
  // Mock internal in-memory cache store for deterministic test simulation without DB mutations
  const inMemoryCache: Record<string, { rawProfile: InstagramProfile; expiresAt: Date }> = {};
  let saveCallCount = 0;

  // Spy on ProfileRepository methods
  const origGetFresh = ProfileRepository.getFreshByUsername;
  const origSave = ProfileRepository.save;

  ProfileRepository.getFreshByUsername = async (username: string): Promise<InstagramProfile | null> => {
    const clean = normalizeInstagramUsername(username);
    const cached = inMemoryCache[clean];
    if (!cached || cached.expiresAt <= new Date()) {
      return null;
    }
    if (!isValidInstagramProfile(cached.rawProfile)) {
      return null;
    }
    return cached.rawProfile;
  };

  ProfileRepository.save = async (profile: InstagramProfile, ttlMinutes: number = 10080): Promise<void> => {
    if (!isValidInstagramProfile(profile)) return;
    const clean = normalizeInstagramUsername(profile.username);
    inMemoryCache[clean] = {
      rawProfile: profile,
      expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
    };
    saveCallCount++;
  };

  try {
    // Test A: Fresh cache hit causes 0 provider calls
    inMemoryCache["cached_account"] = {
      rawProfile: { ...validProfile, username: "cached_account" },
      expiresAt: new Date(Date.now() + 3600000), // 1 hour ahead
    };

    const orchestrator = new FailoverInstagramProvider("mock", true);
    // Track underlying provider calls using mock provider wrapper
    const origMockGetProfile = (orchestrator as any).mockProvider.getProfile;
    let mockProviderCallCount = 0;
    (orchestrator as any).mockProvider.getProfile = async (u: string) => {
      mockProviderCallCount++;
      return origMockGetProfile.call((orchestrator as any).mockProvider, u);
    };

    const hitResult = await orchestrator.getProfile("cached_account");
    assert(hitResult.username === "cached_account", "Fresh cache hit returns correct username");
    assert(mockProviderCallCount === 0, "Fresh cache hit causes exactly 0 provider scraper calls");

    // Test B: Cache miss causes exactly 1 provider call, and successful result is cached
    mockProviderCallCount = 0;
    saveCallCount = 0;
    
    // We create a custom provider that acts as a live empirical provider (e.g. apify/brightdata response) to test caching
    const customOrchestrator = new FailoverInstagramProvider("apify", true);
    let fakeLiveCallCount = 0;
    const fakeLiveProvider = {
      id: "apify",
      name: "Apify Scraper",
      isAvailable: () => true,
      getProfile: async (u: string) => {
        fakeLiveCallCount++;
        return { ...validProfile, username: u };
      },
    };
    (customOrchestrator as any).allProviders = [fakeLiveProvider];

    const missResult = await customOrchestrator.getProfile("new_target");
    assert(missResult.username === "new_target", "Cache miss successfully returns profile from provider");
    assert(fakeLiveCallCount === 1, "Cache miss executes exactly 1 provider call");
    assert(saveCallCount === 1, "Successful live provider result is cached via ProfileRepository.save()");
    assert(inMemoryCache["new_target"] !== undefined, "Profile exists in empirical cache after save");

    // Test C: Second sequential request uses the cache and causes 0 additional provider calls
    fakeLiveCallCount = 0;
    const secondResult = await customOrchestrator.getProfile("new_target");
    assert(secondResult.username === "new_target", "Second request returns cached profile");
    assert(fakeLiveCallCount === 0, "Second request causes exactly 0 additional provider calls");

    // Test D: Expired cache behaves as a miss
    inMemoryCache["expired_target"] = {
      rawProfile: { ...validProfile, username: "expired_target" },
      expiresAt: new Date(Date.now() - 1000), // 1 second in the past
    };
    fakeLiveCallCount = 0;
    await customOrchestrator.getProfile("expired_target");
    assert(fakeLiveCallCount === 1, "Expired cache record behaves safely as a cache miss and triggers 1 provider call");

    // Test E: Malformed cached JSON behaves safely as a miss
    inMemoryCache["corrupted_target"] = {
      rawProfile: { username: "corrupted_target", follower_count: "corrupted_string" as any } as any,
      expiresAt: new Date(Date.now() + 3600000),
    };
    fakeLiveCallCount = 0;
    await customOrchestrator.getProfile("corrupted_target");
    assert(fakeLiveCallCount === 1, "Corrupted cached JSON behaves safely as a cache miss without crashing");

    // Test F: Mock results are not written to the empirical profile cache
    const mockOnlyOrchestrator = new FailoverInstagramProvider("mock", true);
    saveCallCount = 0;
    await mockOnlyOrchestrator.getProfile("mock_only_target");
    assert(saveCallCount === 0 && inMemoryCache["mock_only_target"] === undefined, "Mock provider results are NOT saved to empirical cache table");

    console.log(`\n=== Stage 3B Phase 4A Verification Complete: ${passed} Passed, ${failed} Failed ===\n`);
    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    // Restore original repository methods
    ProfileRepository.getFreshByUsername = origGetFresh;
    ProfileRepository.save = origSave;
  }
}

runCacheTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
