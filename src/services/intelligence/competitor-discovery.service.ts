import { db } from "@/lib/db";
import { instagramProfiles, profileIntelligence, competitorTracking } from "@/lib/db/schema";
import { eq, not, inArray } from "drizzle-orm";
import { profileSimilarityModel } from "./similarity.model";
import { configurationService } from "./configuration.service";
import type { ProfileIntelligenceResult } from "./profile-intelligence.service";

/**
 * CompetitorDiscoveryService
 * 
 * Responsible for finding relevant profiles and orchestrating the ProfileSimilarityModel 
 * to rank and map Strategic Competitors for a base profile.
 */
export class CompetitorDiscoveryService {
  
  /**
   * Discovers and persists the most relevant competitors for a given profile.
   */
  async discoverCompetitors(baseProfileId: string) {
    console.log(`[CompetitorDiscoveryService] Starting discovery for base profile: ${baseProfileId}`);

    // 1. Fetch Base Profile Intelligence
    const baseIntelRecords = await db.select()
      .from(profileIntelligence)
      .where(eq(profileIntelligence.profileId, baseProfileId))
      .limit(1);

    if (baseIntelRecords.length === 0) {
      console.warn(`[CompetitorDiscoveryService] No intelligence found for base profile ${baseProfileId}. Aborting.`);
      return { discovered: 0 };
    }

    const baseIntel = baseIntelRecords[0] as unknown as ProfileIntelligenceResult;

    // Fetch dynamic configurable weights (AKP v1.1)
    const weights = await configurationService.getSimilarityWeights();

    // 2. Candidate Generation (AKP v1.1: Graph Expansion)
    // Gather Level 1 candidates (everyone we are currently tracking, or all profiles if we have none)
    // Wait, for this demo we pull all profiles, BUT we also pull competitors of competitors.
    
    // First, find who we are currently tracking
    const existingEdges = await db.select().from(competitorTracking).where(eq(competitorTracking.baseProfileId, baseProfileId));
    const trackedCompetitorIds = existingEdges.map(e => e.competitorProfileId);
    
    // Level 2 candidates: "Competitors of our tracked competitors" (Depth = 2)
    let level2Ids: string[] = [];
    if (trackedCompetitorIds.length > 0) {
        const level2Edges = await db.select().from(competitorTracking).where(inArray(competitorTracking.baseProfileId, trackedCompetitorIds));
        level2Ids = level2Edges.map(e => e.competitorProfileId).filter(id => id !== baseProfileId);
    }
    
    // Combine Candidate IDs (All profiles in DB for now to ensure we find something, PLUS level 2)
    // In production, we'd limit this pool severely.
    const allProfiles = await db.select({ profileId: profileIntelligence.profileId }).from(profileIntelligence);
    const candidateIdsSet = new Set<string>();
    
    for (const p of allProfiles) {
        if (p.profileId !== baseProfileId) {
            candidateIdsSet.add(p.profileId);
        }
    }
    for (const id of level2Ids) {
        if (id !== baseProfileId) {
            candidateIdsSet.add(id);
        }
    }
    
    // Convert back to Array and cap at 50 candidates for safety (AKP v1.1 bounds constraint)
    const candidatePoolIds = Array.from(candidateIdsSet).slice(0, 50);

    const candidateIntelRecords = candidatePoolIds.length > 0 ? await db.select({
        profileId: profileIntelligence.profileId,
        accountType: profileIntelligence.accountType,
        niche: profileIntelligence.niche,
        growthStage: profileIntelligence.growthStage,
        primaryObjective: profileIntelligence.primaryObjective,
      })
      .from(profileIntelligence)
      .where(inArray(profileIntelligence.profileId, candidatePoolIds)) : [];

    console.log(`[CompetitorDiscoveryService] Generated ${candidateIntelRecords.length} candidates from graph expansion.`);

    let discoveredCount = 0;

    // 3. Score & Filter Candidates
    for (const candidateRecord of candidateIntelRecords) {
      const candidateIntel = candidateRecord as unknown as ProfileIntelligenceResult;
      
      const relationship = profileSimilarityModel.evaluateRelationship(baseIntel, candidateIntel, weights);

      // We only care about Direct Match and Aspirational (learning priority threshold ensures we don't save useless links)
      if (relationship.strategicRelevance !== "Out of Scope" && relationship.learningPriority > 50) {
        
        // 4. Persist Relationship
        console.log(`[CompetitorDiscoveryService] Found ${relationship.strategicRelevance} Competitor (Score: ${relationship.similarityScore}, Priority: ${relationship.learningPriority})`);

        // Upsert logic
        const existing = await db.select().from(competitorTracking).where(
            eq(competitorTracking.baseProfileId, baseProfileId)
        );
        const existingEdge = existing.find(e => e.competitorProfileId === candidateRecord.profileId);

        if (existingEdge) {
            await db.update(competitorTracking).set({
                similarityScore: relationship.similarityScore,
                strategicRelevance: relationship.strategicRelevance,
                stageDelta: relationship.stageDelta,
                learningPriority: relationship.learningPriority,
                evidence: relationship.evidence,
                lastVerifiedAt: new Date()
            }).where(eq(competitorTracking.id, existingEdge.id));
        } else {
            await db.insert(competitorTracking).values({
                baseProfileId,
                competitorProfileId: candidateRecord.profileId,
                similarityScore: relationship.similarityScore,
                strategicRelevance: relationship.strategicRelevance,
                stageDelta: relationship.stageDelta,
                learningPriority: relationship.learningPriority,
                evidence: relationship.evidence,
            });
        }
        discoveredCount++;
      }
    }

    console.log(`[CompetitorDiscoveryService] Discovery complete. Persisted ${discoveredCount} relevant competitors.`);
    return { discovered: discoveredCount };
  }
}

export const competitorDiscoveryService = new CompetitorDiscoveryService();
