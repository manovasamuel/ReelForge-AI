import { db } from "@/lib/db";
import { profileStrategies, profileIntelligence, competitorTracking } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { strategyRecommendationModel } from "./strategy.model";
import type { ProfileIntelligenceResult } from "./profile-intelligence.service";
import type { CompetitorRelationship } from "./similarity.model";

/**
 * StrategyEngineService
 * 
 * Orchestrates the generation and persistence of personalized, stage-aware 
 * Growth Roadmaps by supplying context to the StrategyRecommendationModel.
 */
export class StrategyEngineService {
  
  /**
   * Generates a new Strategy version for the given profile.
   */
  async generateStrategy(profileId: string) {
    console.log(`[StrategyEngineService] Starting Strategy Generation for profile ${profileId}`);

    // 1. Fetch Base Profile Intelligence
    const baseIntelRecords = await db.select()
      .from(profileIntelligence)
      .where(eq(profileIntelligence.profileId, profileId))
      .limit(1);

    if (baseIntelRecords.length === 0) {
      console.warn(`[StrategyEngineService] Cannot generate strategy: No Profile Intelligence found.`);
      return null;
    }
    const baseIntel = baseIntelRecords[0] as unknown as ProfileIntelligenceResult;

    // 2. Fetch Aspirational Competitors
    const trackingRecords = await db.select()
      .from(competitorTracking)
      .where(eq(competitorTracking.baseProfileId, profileId));
    
    const aspirationalEdges = trackingRecords.filter(t => t.strategicRelevance === "Aspirational");
    
    // For each aspirational competitor, fetch their intelligence
    const aspirationalCompetitors: { intel: ProfileIntelligenceResult, relationship: CompetitorRelationship }[] = [];
    
    for (const edge of aspirationalEdges) {
      const compIntelRecords = await db.select()
        .from(profileIntelligence)
        .where(eq(profileIntelligence.profileId, edge.competitorProfileId))
        .limit(1);
        
      if (compIntelRecords.length > 0) {
        aspirationalCompetitors.push({
          intel: compIntelRecords[0] as unknown as ProfileIntelligenceResult,
          relationship: edge as unknown as CompetitorRelationship
        });
      }
    }

    // 3. Fetch Trend Events (Mocked for now)
    const trendEvents: any[] = [];

    // 4. Generate Strategy via Model
    const strategy = await strategyRecommendationModel.generateStrategy(baseIntel, aspirationalCompetitors, trendEvents);

    // 5. Determine new version number
    const existingStrategies = await db.select({ version: profileStrategies.version })
      .from(profileStrategies)
      .where(eq(profileStrategies.profileId, profileId))
      .orderBy(desc(profileStrategies.version))
      .limit(1);
      
    const nextVersion = existingStrategies.length > 0 ? existingStrategies[0].version + 1 : 1;

    // 6. Set Expiration (14 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    // 7. Persist Strategy (Append-only)
    await db.insert(profileStrategies).values({
      profileId,
      version: nextVersion,
      strategicGaps: strategy.strategicGaps,
      growthOpportunities: strategy.growthOpportunities,
      executionPlan: strategy.executionPlan,
      successMetrics: strategy.successMetrics,
      confidenceScore: strategy.confidenceScore,
      expiresAt,
    });

    console.log(`[StrategyEngineService] Persisted Strategy Version ${nextVersion} (Confidence: ${strategy.confidenceScore})`);
    return strategy;
  }
}

export const strategyEngineService = new StrategyEngineService();
