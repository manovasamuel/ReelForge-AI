import { normalizationService } from "../../src/services/intelligence/normalization.service";

const staticApifyPayload = {
  username: "zuck",
  fullName: "Mark Zuckerberg",
  biography: "Founder and CEO at Meta",
  profilePicUrlHD: "https://example.com/zuck.jpg",
  followersCount: 14000000,
  followsCount: 50,
  postsCount: 300,
  isPrivate: false,
  isVerified: true,
  latestPosts: [
    {
      id: "12345",
      shortCode: "CzX1",
      displayUrl: "https://example.com/post1.jpg",
      caption: "Building the metaverse",
      likesCount: 500000,
      commentsCount: 12000,
      timestamp: "2023-01-01T12:00:00.000Z",
      type: "Image",
    },
    {
      id: "67890",
      shortCode: "DaY2",
      displayUrl: "https://example.com/post2.jpg",
      caption: "New VR headset",
      likesCount: 800000,
      commentsCount: 25000,
      timestamp: "2023-02-01T15:30:00.000Z",
      type: "Video",
    }
  ]
};

async function verifyNormalization() {
  console.log("\n=== AIIE Normalization Service Verification ===");

  try {
    const profile = normalizationService.mapApifyProfile("zuck", staticApifyPayload);

    if (profile.username !== "zuck") throw new Error("Username mismatch");
    if (profile.display_name !== "Mark Zuckerberg") throw new Error("Display name mismatch");
    if (profile.follower_count !== 14000000) throw new Error("Follower count mismatch");
    if (profile.is_verified !== true) throw new Error("Verified status mismatch");
    if (profile.posts.length !== 2) throw new Error("Posts length mismatch");
    
    const firstPost = profile.posts[0];
    if (firstPost.likes !== 500000) throw new Error("Post likes mismatch");
    if (firstPost.type !== "image") throw new Error("Post type mismatch");

    const secondPost = profile.posts[1];
    if (secondPost.type !== "video") throw new Error("Post type mismatch 2");

    console.log("✅ All normalization tests passed successfully!");
  } catch (err: any) {
    console.error(`\n❌ NORMALIZATION TEST FAILED: ${err.message}`);
    process.exit(1);
  }
}

verifyNormalization();
