import type { InstagramProfile } from "../../src/types/instagram";
import { GrowthStageClassifier } from "../../src/services/competitors/adaptive/growth-stage.classifier";
import { 
  FollowerScorer, 
  EngagementRateScorer, 
  AverageLikesScorer, 
  EngagementToFollowerRatioScorer, 
  ContentMaturityScorer 
} from "../../src/services/competitors/adaptive/scorers/initial-scorers";

async function main() {
  console.log("=== Adaptive Competitor Intelligence: Phase 2 Verification ===\n");

  const classifier = new GrowthStageClassifier();
  
  // Register the independent scorers
  classifier.registerScorer(new FollowerScorer());
  classifier.registerScorer(new EngagementRateScorer());
  classifier.registerScorer(new AverageLikesScorer());
  classifier.registerScorer(new EngagementToFollowerRatioScorer());
  classifier.registerScorer(new ContentMaturityScorer());

  console.log("[Setup] 5 independent scoring modules registered.\n");

  // Profile A: A brand new account
  const microProfile: InstagramProfile = {
    username: "new_creator_123",
    display_name: "New Creator",
    bio: "Just starting out",
    profile_picture_url: null,
    follower_count: 500,
    following_count: 100,
    post_count: 10,
    category: "creator",
    external_url: null,
    is_private: false,
    is_verified: false,
    posts: [
      { id: "1", thumbnail_url: null, url: null, caption: null, likes: 25, comments: 2, timestamp: null, type: "image" },
      { id: "2", thumbnail_url: null, url: null, caption: null, likes: 30, comments: 1, timestamp: null, type: "image" }
    ] // Average likes: ~27.5, ER: (27.5+1.5)/500 = 5.8%
  };

  // Profile B: An established authority
  const authorityProfile: InstagramProfile = {
    username: "established_brand",
    display_name: "Established Brand",
    bio: "Authority in the space",
    profile_picture_url: null,
    follower_count: 850000,
    following_count: 500,
    post_count: 1200,
    category: "brand",
    external_url: null,
    is_private: false,
    is_verified: true,
    posts: [
      { id: "1", thumbnail_url: null, url: null, caption: null, likes: 65000, comments: 2000, timestamp: null, type: "video" },
      { id: "2", thumbnail_url: null, url: null, caption: null, likes: 75000, comments: 3000, timestamp: null, type: "video" }
    ] // Average likes: 70,000, ER: ~8%
  };

  // Run Classification A
  console.log("--- Test Case A: Micro Creator ---");
  const resultA = await classifier.classify(microProfile);
  console.log(`Growth Stage: ${resultA.growthStage}`);
  console.log(`Total Score: ${resultA.totalScore}`);
  console.log(`Next Objective: ${resultA.nextObjective}`);
  console.log(`Selection Matrix:`, resultA.matrix);
  console.log("Signals:");
  resultA.signals.forEach(s => console.log(` - ${s.name}: ${s.score} (Weight: ${s.weight})`));
  console.log("\n");

  // Run Classification B
  console.log("--- Test Case B: Established Authority ---");
  const resultB = await classifier.classify(authorityProfile);
  console.log(`Growth Stage: ${resultB.growthStage}`);
  console.log(`Total Score: ${resultB.totalScore}`);
  console.log(`Next Objective: ${resultB.nextObjective}`);
  console.log(`Selection Matrix:`, resultB.matrix);
  console.log("Signals:");
  resultB.signals.forEach(s => console.log(` - ${s.name}: ${s.score} (Weight: ${s.weight})`));
  console.log("\n");
}

main().catch(console.error);
