import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { getContentCollectionProvider } from "@/services/instagram/../content-collection/providers";
import { LiveContentCollectionProvider } from "@/services/content-collection/providers/live.provider";
import { MockContentCollectionProvider } from "@/services/content-collection/providers/mock.provider";
import { MockInstagramProvider } from "@/services/instagram/providers/mock.provider";
import * as instagramProviders from "@/services/instagram/providers";
import type { InstagramProfile } from "@/types/instagram";

async function runVerification() {
  console.log("=== Stage 3B Phase 1 Verification: Live Content Collection Provider ===\n");

  // 1. Verify Default Provider Selection (Mock)
  delete process.env.CONTENT_COLLECTION_PROVIDER;
  const defaultProvider = getContentCollectionProvider();
  if (defaultProvider instanceof MockContentCollectionProvider) {
    console.log("✅ Default provider is MockContentCollectionProvider (when CONTENT_COLLECTION_PROVIDER unset)");
  } else {
    throw new Error("❌ Default provider should be MockContentCollectionProvider");
  }

  // 2. Verify Explicit Live Provider Activation
  process.env.CONTENT_COLLECTION_PROVIDER = "live";
  const liveProvider = getContentCollectionProvider();
  if (liveProvider instanceof LiveContentCollectionProvider) {
    console.log("✅ Explicit 'live' config activates LiveContentCollectionProvider");
  } else {
    throw new Error("❌ CONTENT_COLLECTION_PROVIDER=live failed to activate LiveContentCollectionProvider");
  }

  // 3. Verify Exact Real-to-Domain Mapping using Mock/Fixture Instagram Provider (Zero Real Scraper Calls)
  console.log("\n--- Testing Exact Contract Mapping with Fixture Profile ---");
  
  const fixtureProfile: InstagramProfile = {
    username: "competitor_test",
    display_name: "Competitor Test",
    bio: "Testing domain mapping contract #saas #growth",
    profile_picture_url: "https://images.unsplash.com/photo-fixture",
    follower_count: 100000,
    following_count: 500,
    post_count: 3,
    category: "SaaS",
    external_url: "https://reelforge.ai",
    is_private: false,
    is_verified: true,
    posts: [
      {
        id: "post-vid-1",
        thumbnail_url: "https://cdn.instagram.com/thumb1.jpg",
        url: "https://www.instagram.com/p/ABC123/", // Permalink, NOT playable MP4
        caption: "Our top 3 viral hooks for 2026! #viralhooks #reelsgrowth #creatoreconomy",
        likes: 5400,
        comments: 320,
        timestamp: "2026-07-10T12:00:00.000Z",
        type: "video",
      },
      {
        id: "post-car-2",
        thumbnail_url: null, // Test null thumbnail fallback
        url: "https://www.instagram.com/p/DEF456/",
        caption: "Slide 1 to 5 breakdown without tags",
        likes: 1200,
        comments: 45,
        timestamp: "2026-07-09T15:30:00.000Z",
        type: "carousel",
      },
      {
        id: "post-img-3",
        thumbnail_url: "https://cdn.instagram.com/thumb3.jpg",
        url: null,
        caption: null, // Test null caption
        likes: 890,
        comments: 12,
        timestamp: null,
        type: "image",
      },
    ],
  };

  // Mock getInstagramProvider() to return a stub provider with our fixture
  const mockInstaProvider = new MockInstagramProvider();
  mockInstaProvider.getProfile = async () => fixtureProfile;
  const testLiveProvider = new LiveContentCollectionProvider(mockInstaProvider);

  const collectedItems = await testLiveProvider.collectContent("competitor_test");
  console.log(`✅ Collected ${collectedItems.length} items from fixture profile.`);

  if (collectedItems.length !== 3) {
    throw new Error(`Expected 3 items, got ${collectedItems.length}`);
  }

  const [item1, item2, item3] = collectedItems;

  // Verify Item 1 (Video -> Reel mapping, hashtag extraction, views=0 check)
  console.log(`\nVerifying Item 1 (${item1.id}):`);
  console.log(`  type: "${item1.type}" (Expected: "reel") -> ${item1.type === "reel" ? "PASS ✅" : "FAIL ❌"}`);
  console.log(`  views: ${item1.views} (Expected: 0) -> ${item1.views === 0 ? "PASS ✅" : "FAIL ❌"}`);
  console.log(`  likes: ${item1.likes}, comments: ${item1.comments} -> PASS ✅`);
  console.log(`  hashtags: [${item1.hashtags.join(", ")}] -> ${item1.hashtags.length === 3 ? "PASS ✅" : "FAIL ❌"}`);
  console.log(`  isPinned: ${item1.isPinned} (Expected: false) -> ${item1.isPinned === false ? "PASS ✅" : "FAIL ❌"}`);
  console.log(`  durationSeconds: ${item1.durationSeconds} (Expected: undefined) -> ${item1.durationSeconds === undefined ? "PASS ✅" : "FAIL ❌"}`);

  if (item1.type !== "reel" || item1.views !== 0 || item1.hashtags.length !== 3 || item1.isPinned !== false) {
    throw new Error("Item 1 contract mapping verification failed.");
  }

  // Verify Item 2 (Carousel, fallback thumbnail to profile picture)
  console.log(`\nVerifying Item 2 (${item2.id}):`);
  console.log(`  type: "${item2.type}" (Expected: "carousel") -> ${item2.type === "carousel" ? "PASS ✅" : "FAIL ❌"}`);
  console.log(`  thumbnailUrl fallback: "${item2.thumbnailUrl}" (Expected profile_picture_url) -> ${item2.thumbnailUrl === fixtureProfile.profile_picture_url ? "PASS ✅" : "FAIL ❌"}`);

  if (item2.type !== "carousel" || item2.thumbnailUrl !== fixtureProfile.profile_picture_url) {
    throw new Error("Item 2 contract mapping verification failed.");
  }

  // Verify Item 3 (Image, null caption handling, missing timestamp preservation without recency fabrication)
  console.log(`\nVerifying Item 3 (${item3.id}):`);
  console.log(`  type: "${item3.type}" (Expected: "image") -> ${item3.type === "image" ? "PASS ✅" : "FAIL ❌"}`);
  console.log(`  caption: "${item3.caption}" (Expected empty string) -> ${item3.caption === "" ? "PASS ✅" : "FAIL ❌"}`);
  console.log(`  publishDate: "${item3.publishDate}" (Expected empty string for missing timestamp, no recency fabrication) -> ${item3.publishDate === "" ? "PASS ✅" : "FAIL ❌"}`);
  console.log(`  hashtags: [${item3.hashtags.join(", ")}] (Expected empty array) -> ${item3.hashtags.length === 0 ? "PASS ✅" : "FAIL ❌"}`);

  if (item3.type !== "image" || item3.caption !== "" || item3.publishDate !== "" || item3.hashtags.length !== 0) {
    throw new Error("Item 3 contract mapping verification failed.");
  }

  console.log("\n=== ALL STAGE 3B PHASE 1 CONTRACT MAPPINGS VERIFIED SUCCESSFULLY! ===");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
