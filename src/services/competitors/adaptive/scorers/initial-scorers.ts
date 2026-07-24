import type { InstagramProfile } from "@/types/instagram";
import type { IClassificationSignalScorer, ClassificationSignal } from "@/types/competitor-intelligence";

/**
 * Normalizes a value between a min and max threshold to a 0-100 score.
 */
function normalizeScore(value: number, min: number, max: number): number {
  if (value <= min) return 0;
  if (value >= max) return 100;
  return Math.round(((value - min) / (max - min)) * 100);
}

export class FollowerScorer implements IClassificationSignalScorer {
  name = "FollowerScorer";
  weight = 0.4; // 40% importance

  async score(profile: InstagramProfile): Promise<ClassificationSignal> {
    // 0 = 0 followers, 100 = 1,000,000 followers
    const followers = profile.follower_count || 0;
    const computedScore = normalizeScore(followers, 0, 1_000_000);
    
    return {
      name: this.name,
      score: computedScore,
      weight: this.weight,
      confidence: 100, // Hard follower count is a highly confident metric
    };
  }
}

export class EngagementRateScorer implements IClassificationSignalScorer {
  name = "EngagementRateScorer";
  weight = 0.2; // 20% importance

  async score(profile: InstagramProfile): Promise<ClassificationSignal> {
    const followers = profile.follower_count || 1;
    let totalEngagements = 0;
    
    if (profile.posts && profile.posts.length > 0) {
      profile.posts.forEach(p => {
        totalEngagements += (p.likes || 0) + (p.comments || 0);
      });
      totalEngagements = totalEngagements / profile.posts.length;
    }

    const er = totalEngagements / followers; 
    const computedScore = normalizeScore(er, 0, 0.10);

    return {
      name: this.name,
      score: computedScore,
      weight: this.weight,
      confidence: profile.posts && profile.posts.length > 0 ? 90 : 20,
    };
  }
}

export class AverageLikesScorer implements IClassificationSignalScorer {
  name = "AverageLikesScorer";
  weight = 0.15; // 15% importance

  async score(profile: InstagramProfile): Promise<ClassificationSignal> {
    let avgLikes = 0;
    if (profile.posts && profile.posts.length > 0) {
      const totalLikes = profile.posts.reduce((sum, p) => sum + (p.likes || 0), 0);
      avgLikes = totalLikes / profile.posts.length;
    }

    const computedScore = normalizeScore(avgLikes, 0, 100_000);

    return {
      name: this.name,
      score: computedScore,
      weight: this.weight,
      confidence: profile.posts && profile.posts.length > 0 ? 90 : 20,
    };
  }
}

export class EngagementToFollowerRatioScorer implements IClassificationSignalScorer {
  name = "EngagementToFollowerRatioScorer";
  weight = 0.15; // 15% importance

  async score(profile: InstagramProfile): Promise<ClassificationSignal> {
    const followers = profile.follower_count || 1;
    let avgLikes = 0;
    if (profile.posts && profile.posts.length > 0) {
      const totalLikes = profile.posts.reduce((sum, p) => sum + (p.likes || 0), 0);
      avgLikes = totalLikes / profile.posts.length;
    }

    const ratio = avgLikes / followers;
    const computedScore = normalizeScore(ratio, 0, 0.20); // 20% like/follower ratio is viral

    return {
      name: this.name,
      score: computedScore,
      weight: this.weight,
      confidence: profile.posts && profile.posts.length > 0 ? 90 : 20,
    };
  }
}

export class ContentMaturityScorer implements IClassificationSignalScorer {
  name = "ContentMaturityScorer";
  weight = 0.1; // 10% importance

  async score(profile: InstagramProfile): Promise<ClassificationSignal> {
    const posts = profile.post_count || 0;
    const computedScore = normalizeScore(posts, 0, 500);

    return {
      name: this.name,
      score: computedScore,
      weight: this.weight,
      confidence: 90, 
    };
  }
}
