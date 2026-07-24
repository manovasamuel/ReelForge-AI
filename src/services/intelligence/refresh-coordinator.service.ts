import { db } from "@/lib/db";
import { instagramProfiles } from "@/lib/db/schema";
import { lte, eq } from "drizzle-orm";
// Imports to the specific pipeline phases
import { datasetBuilderService } from "./dataset-builder.service";
import { trendDetectionService } from "./trend-detection.service";
import { profileIntelligenceService } from "./profile-intelligence.service";

/**
 * RefreshCoordinator acts as the orchestration layer for the background intelligence refresh pipeline.
 * It selects profiles that are due for a refresh and safely coordinates Phase 1 through Phase 4.
 */
export class RefreshCoordinator {
  
  /**
   * Processes all profiles whose nextRefreshAt is in the past.
   * Note: In a production environment with massive scale, this should use cursor pagination or a queue worker.
   */
  async processDueProfiles(): Promise<number> {
    console.log("[RefreshCoordinator] Polling for profiles due for refresh...");

    const dueProfiles = await db.select()
      .from(instagramProfiles)
      .where(lte(instagramProfiles.nextRefreshAt, new Date()));

    if (dueProfiles.length === 0) {
      console.log("[RefreshCoordinator] No profiles currently due for refresh.");
      return 0;
    }

    console.log(`[RefreshCoordinator] Found ${dueProfiles.length} profiles due for refresh.`);

    let processedCount = 0;
    for (const profile of dueProfiles) {
      try {
        await this.refreshProfilePipeline(profile);
        processedCount++;
      } catch (err: any) {
        console.error(`[RefreshCoordinator] Pipeline failed for profile ${profile.username}: ${err.message}`);
      }
    }

    return processedCount;
  }

  /**
   * Executes the full AIIE pipeline for a single profile sequentially.
   */
  private async refreshProfilePipeline(profile: any): Promise<void> {
    console.log(`[RefreshCoordinator] Starting pipeline for @${profile.username} (Priority: ${profile.refreshPriority})`);

    // --- PIPELINE EXECUTION ---
    // Note: Mocks are used here for the acquisition and enrichment phases since they rely on external API keys.
    // In production, these call:
    // 1. Provider Orchestrator -> ApifyAdapter
    // 2. NormalizationService
    // 3. EnrichmentService (AI)
    console.log(`  -> [Phase 1-3] Fetching, Normalizing, and Enriching latest posts...`);
    await this.mockAcquisitionAndEnrichment(profile);

    // 4. Dataset Builder
    console.log(`  -> [Phase 3.5] Building updated Intelligence Datasets...`);
    await datasetBuilderService.buildProfileHookDataset(profile.id, profile.username);

    // 5. Trend Detection
    console.log(`  -> [Phase 4] Detecting Trends and Anomalies...`);
    await trendDetectionService.analyzeDatasetTrends("hooks", profile.username);

    // 6. Profile Intelligence
    console.log(`  -> [Phase 7] Evaluating Profile Intelligence...`);
    await profileIntelligenceService.evaluateProfile(profile.id, profile.username);

    // 7. Adaptive Competitor Discovery
    const { competitorDiscoveryService } = await import("./competitor-discovery.service");
    console.log(`  -> [Phase 8] Discovering Adaptive Competitors...`);
    await competitorDiscoveryService.discoverCompetitors(profile.id);

    // 8. Strategy Engine
    const { strategyEngineService } = await import("./strategy-engine.service");
    console.log(`  -> [Phase 9] Generating Strategy Roadmap...`);
    await strategyEngineService.generateStrategy(profile.id);

    // --- SCHEDULING ---
    const nextRefresh = this.calculateNextRefresh(profile.refreshPriority);
    await db.update(instagramProfiles)
      .set({
        lastScrapedAt: new Date(),
        nextRefreshAt: nextRefresh,
        updatedAt: new Date()
      })
      .where(eq(instagramProfiles.id, profile.id));

    console.log(`[RefreshCoordinator] Pipeline completed for @${profile.username}. Next refresh scheduled for ${nextRefresh.toISOString()}`);
  }

  /**
   * (Sprint 1) On-Demand Pipeline Trigger
   * Used when a user searches for an unknown profile during an Adaptive Audit.
   */
  async runFullPipelineForNewProfile(username: string): Promise<any> {
    console.log(`[RefreshCoordinator] Running on-demand pipeline for NEW profile: @${username}`);
    
    // Create dummy profile in DB if it doesn't exist
    const { randomUUID } = await import("crypto");
    const existing = await db.select().from(instagramProfiles).where(eq(instagramProfiles.username, username)).limit(1);
    
    let profile: any;
    if (existing.length === 0) {
        const id = randomUUID();
        await db.insert(instagramProfiles).values({
            id,
            username,
            refreshPriority: "high"
        });
        profile = (await db.select().from(instagramProfiles).where(eq(instagramProfiles.id, id)).limit(1))[0];
    } else {
        profile = existing[0];
    }

    // Execute full pipeline
    await this.refreshProfilePipeline(profile);
    
    return profile;
  }

  private calculateNextRefresh(priority: string | null): Date {
    const now = new Date();
    switch (priority) {
      case "high":
        // Daily
        now.setDate(now.getDate() + 1);
        break;
      case "medium":
        // Every 3 Days
        now.setDate(now.getDate() + 3);
        break;
      case "low":
        // Weekly
        now.setDate(now.getDate() + 7);
        break;
      case "archived":
        // Monthly
        now.setMonth(now.getMonth() + 1);
        break;
      default:
        // Default to medium (3 days) if unknown
        now.setDate(now.getDate() + 3);
        break;
    }
    return now;
  }

  /**
   * (AKP v1.1) Re-enrichment Pipeline
   * 
   * Triggers the AI intelligence reasoning on an existing profile using the latest 
   * AI models without scraping new raw data. This improves knowledge quality without API costs.
   */
  async reEnrichProfile(profileId: string, username: string): Promise<void> {
    console.log(`[RefreshCoordinator] Starting Re-enrichment Pipeline for @${username}`);
    
    // We intentionally skip Phase 1-4 (Acquisition, Normalization, Datasets, Trends)
    // and jump straight to Phase 7: Profile Intelligence Engine using the latest logic/models.
    console.log(`  -> [Phase 7] Re-evaluating Profile Intelligence...`);
    await profileIntelligenceService.evaluateProfile(profileId, username);
    
    // The ProfileIntelligenceService will automatically upsert the `profile_intelligence` 
    // record and increment `enrichmentVersion`.
    
    console.log(`[RefreshCoordinator] Re-enrichment Pipeline completed for @${username}.`);
  }

  /**
   * Mock placeholder for the upstream steps (Phase 1-3) 
   * since we do not want to burn Apify/OpenAI credits on background cron loops during dev.
   */
  private async mockAcquisitionAndEnrichment(profile: any): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 500)); 
  }
}

export const refreshCoordinator = new RefreshCoordinator();
