import { db } from "@/lib/db";
import { profileIntelligence, profileStrategies, competitorTracking, instagramProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface CompactCopilotContext {
  niche: string;
  stage: string;
  mainGap: string;
  topCompetitors: string[];
  priorityGoals: string[];
}

export class ContextBuilderService {
  /**
   * Fetches the profile's intelligence and builds a compact context 
   * to save tokens when interacting with the Copilot LLM.
   */
  async buildContext(profileId: string): Promise<CompactCopilotContext> {
    console.log(`[ContextBuilder] Building context for profile: ${profileId}`);

    // Fetch Intelligence
    const intel = await db.select().from(profileIntelligence).where(eq(profileIntelligence.profileId, profileId)).limit(1);
    
    // Fetch Strategy
    const strategies = await db.select().from(profileStrategies).where(eq(profileStrategies.profileId, profileId)).orderBy(profileStrategies.createdAt).limit(1);
    
    // Fetch Competitors (only Aspirational for context)
    const competitors = await db.select({ username: instagramProfiles.username })
      .from(competitorTracking)
      .innerJoin(instagramProfiles, eq(competitorTracking.competitorProfileId, instagramProfiles.id))
      .where(eq(competitorTracking.baseProfileId, profileId));

    return {
      niche: intel[0]?.niche || "Unknown Niche",
      stage: intel[0]?.growthStage || "Unknown Stage",
      mainGap: strategies[0]?.strategicGaps ? JSON.stringify(strategies[0].strategicGaps) : "No strategic gap identified yet.",
      topCompetitors: competitors.map(c => `@${c.username}`),
      priorityGoals: (strategies[0]?.executionPlan as string[]) || [],
    };
  }
}

export const contextBuilderService = new ContextBuilderService();
