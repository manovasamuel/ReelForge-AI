import { db } from "@/lib/db";
import { contentAssets, instagramPosts, akpLearnedPatterns, instagramProfiles } from "@/lib/db/schema";
import { eq, inArray, and, isNotNull, sql } from "drizzle-orm";

export class AnalyticsEngineService {
  /**
   * Scans for published content assets that haven't been fully analyzed for AKP learning.
   */
  async runAnalyticsCycle(profileId: string) {
    console.log(`[AnalyticsEngine] Running cycle for profile: ${profileId}`);

    // 1. Find assets that have a platformPostId and are in "Published" state (or simulated published)
    const publishedAssets = await db.select()
      .from(contentAssets)
      .where(
        and(
          eq(contentAssets.profileId, profileId),
          isNotNull(contentAssets.platformPostId)
        )
      );

    if (publishedAssets.length === 0) {
      return { success: true, message: "No published assets found to analyze." };
    }

    // 2. Fetch corresponding platform posts
    const postIds = publishedAssets.map(a => a.platformPostId as string);
    const posts = await db.select()
      .from(instagramPosts)
      .where(inArray(instagramPosts.platformPostId, postIds));

    const postMap = new Map(posts.map(p => [p.platformPostId, p]));

    let newLearnings = 0;

    // 3. Analyze each asset against its performance
    for (const asset of publishedAssets) {
      const post = postMap.get(asset.platformPostId as string);
      if (!post) continue; // Post not scraped/synced yet

      // Simulated Baseline (normally we'd query average likes from profile_metrics_history)
      const baselineLikes = 500; 
      const currentLikes = post.likes || 0;
      
      const lift = currentLikes > 0 ? (currentLikes / baselineLikes) : 0;

      // If it overperforms significantly (e.g., > 20% better)
      if (lift > 1.2) {
        // Extract a candidate learning (e.g., from the Hook in lineage, or tags)
        const hookIdea = (asset.contentData as any)?.hook || asset.title;
        const confidence = Math.min(Math.round(lift * 30), 95); // Simulated confidence score calculation

        await this.validateAndPromoteLearning({
          patternType: "Hook",
          pattern: `Successful Hook Pattern: ${hookIdea}`,
          confidenceScore: confidence,
          sampleSize: 1, // First observation
          averageLift: lift,
          applicableTo: { contentType: asset.contentType }
        });
        
        newLearnings++;
      }
    }

    return { success: true, message: `Cycle complete. Extracted ${newLearnings} candidate patterns.` };
  }

  /**
   * Validates if a pattern already exists, updates confidence, or inserts as Candidate.
   */
  async validateAndPromoteLearning(data: {
    patternType: string;
    pattern: string;
    confidenceScore: number;
    sampleSize: number;
    averageLift: number;
    applicableTo: any;
  }) {
    // Basic deduplication (in reality, requires embedding/similarity search)
    const existing = await db.select()
      .from(akpLearnedPatterns)
      .where(and(
        eq(akpLearnedPatterns.patternType, data.patternType),
        eq(akpLearnedPatterns.pattern, data.pattern)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing pattern
      const p = existing[0];
      const newSampleSize = p.sampleSize + 1;
      const newConfidence = Math.min(p.confidenceScore + 5, 99);
      
      await db.update(akpLearnedPatterns)
        .set({
          sampleSize: newSampleSize,
          confidenceScore: newConfidence,
          status: newConfidence > 85 ? 'Validated' : 'Candidate',
          updatedAt: new Date()
        })
        .where(eq(akpLearnedPatterns.id, p.id));
    } else {
      // Insert new candidate
      await db.insert(akpLearnedPatterns).values({
        patternType: data.patternType,
        pattern: data.pattern,
        confidenceScore: data.confidenceScore,
        sampleSize: data.sampleSize,
        averageLift: data.averageLift.toString(),
        applicableTo: data.applicableTo,
        status: data.confidenceScore > 85 ? 'Validated' : 'Candidate'
      });
    }
  }
}

export const analyticsEngine = new AnalyticsEngineService();
