import { providerOrchestrator } from "../../src/services/intelligence/orchestrator";

async function verifyOrchestrator() {
  console.log("\n=== AIIE Provider Orchestrator Verification ===");

  if (!process.env.APIFY_API_TOKEN) {
    console.log("⚠️ APIFY_API_TOKEN is missing. Skipping live orchestrator test.");
    return;
  }

  try {
    const username = "zuck";
    console.log(`\nFetching profile for @${username}...`);
    
    // Test fetchProfile
    const profile = await providerOrchestrator.fetchProfile(username);
    if (!profile || profile.username !== username) {
      throw new Error("Failed to fetch correct profile.");
    }
    console.log("✅ fetchProfile returned successfully.");
    console.log(`   Followers: ${profile.follower_count}`);
    console.log(`   Posts: ${profile.post_count}`);

    // Test fetchPosts
    const posts = await providerOrchestrator.fetchPosts(username);
    if (!Array.isArray(posts)) {
      throw new Error("fetchPosts did not return an array.");
    }
    console.log(`✅ fetchPosts returned ${posts.length} posts successfully.`);

    // Test missing method warnings (should resolve to empty array)
    const hashtags = await providerOrchestrator.fetchHashtags("meta");
    if (!Array.isArray(hashtags) || hashtags.length !== 0) {
      throw new Error("fetchHashtags failed expected fallback behavior.");
    }
    console.log("✅ Unimplemented methods fallback safely.");

    console.log("\n✅ ALL ORCHESTRATOR TESTS PASSED.");
  } catch (err: any) {
    console.error(`\n❌ ORCHESTRATOR TEST FAILED: ${err.message}`);
    process.exit(1);
  }
}

verifyOrchestrator();
