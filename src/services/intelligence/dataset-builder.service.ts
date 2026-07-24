import { db } from "@/lib/db";
import { instagramPosts, postIntelligence, intelligenceDatasets } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface AggregatedDataset {
  datasetType: string; // 'hooks', 'ctas', 'pillars'
  targetId: string;    // 'global', 'username'
  data: Record<string, number>; // e.g. { "Curiosity": 15, "Value-driven": 10 }
}

/**
 * DatasetBuilderService aggregates individual post intelligence into broad, 
 * queryable datasets for Trend Detection and AI Context provision.
 */
export class DatasetBuilderService {

  /**
   * Rebuilds the hook dataset for a specific profile based on their historical post intelligence.
   */
  async buildProfileHookDataset(profileId: string, username: string): Promise<void> {
    console.log(`[DatasetBuilderService] Rebuilding Hook Dataset for @${username}`);

    // Drizzle query to aggregate hookType counts for a specific profile
    const results = await db.select({
      hookType: postIntelligence.hookType,
      count: sql<number>`count(*)::int`
    })
    .from(postIntelligence)
    .innerJoin(instagramPosts, eq(postIntelligence.postId, instagramPosts.id))
    .where(eq(instagramPosts.profileId, profileId))
    .groupBy(postIntelligence.hookType);

    const aggregatedData: Record<string, number> = {};
    for (const row of results) {
      if (row.hookType && row.hookType !== "Unknown") {
        aggregatedData[row.hookType] = row.count;
      }
    }

    // Persist to intelligence_datasets
    await this.appendDatasetVersion("hooks", username, aggregatedData);
  }

  /**
   * Appends the dataset as a new version into the intelligence_datasets table.
   * Includes structural metadata placeholder for future Profile Intelligence Engine (Phase 7).
   */
  private async appendDatasetVersion(datasetType: string, targetId: string, data: any): Promise<void> {
    // 1. Find max version
    const existing = await db.select({ maxVersion: sql<number>`MAX(version)` }).from(intelligenceDatasets)
      .where(sql`dataset_type = ${datasetType} AND target_id = ${targetId}`);
    
    const nextVersion = existing[0]?.maxVersion ? Number(existing[0].maxVersion) + 1 : 1;

    // 2. Wrap data in metadata payload
    const datasetPayload = {
      metadata: {
        category: null, // Populated from instagramProfiles if available
        industry: null, // Phase 7
        niche: null, // Phase 7
        growthStage: null, // Phase 7
        generatedAt: new Date().toISOString(),
        version: nextVersion
      },
      aggregate: data
    };

    // 3. Insert new version
    await db.insert(intelligenceDatasets).values({
      id: randomUUID(),
      datasetType,
      targetId,
      version: nextVersion,
      datasetData: datasetPayload
    });
    
    console.log(`[DatasetBuilderService] Successfully persisted '${datasetType}' dataset for '${targetId}' (v${nextVersion}).`);
  }
}

export const datasetBuilderService = new DatasetBuilderService();
