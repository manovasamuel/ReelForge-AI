import { db } from "@/lib/db";
import { intelligenceDatasets, trendEvents, profileIntelligence, profileStrategies } from "@/lib/db/schema";
import { eq, desc, and, gte, inArray, sql } from "drizzle-orm";
import { MemoryService } from "../memory/memory.service";

export interface RetrievalContextOptions {
  profileId?: string;
  workspaceId: string;
  userId?: string;
  conversationHistory?: any[];
  limit?: number;
}

/**
 * IntelligenceRetrievalService acts as the single gateway between the AI Platform
 * and the underlying intelligence databases (Memory, Datasets, Trends).
 */
export class IntelligenceRetrievalService {

  /**
   * Retrieves, ranks, and structures all relevant intelligence context for an AI prompt.
   */
  async retrieveComprehensiveContext(query: string, options: RetrievalContextOptions): Promise<string> {
    console.log("[IntelligenceRetrievalService] Gathering comprehensive context...");
    
    let structuredContext = "";

    // 1. Retrieve Conversation Memory (Memory V2)
    const memoryContext = await MemoryService.retrieveContext(query, {
      workspaceId: options.workspaceId,
      userId: options.userId || "system"
    });

    const memoryString = memoryContext.map(r => r.content).join("\n");
    if (memoryString.trim().length > 0) {
      structuredContext += `\n<MEMORY>\n${memoryString}\n</MEMORY>\n`;
    }

    // If no target profile is specified, we can only rely on workspace memory.
    if (!options.profileId) {
      return structuredContext.trim();
    }

    // 1.5 Retrieve Profile Intelligence (Identity, Stage, Objective)
    const profileIntel = await db.select()
      .from(profileIntelligence)
      .where(eq(profileIntelligence.profileId, options.profileId))
      .limit(1);

    if (profileIntel.length > 0) {
      const pi = profileIntel[0];
      structuredContext += "\n<PROFILE_INTELLIGENCE>\n";
      structuredContext += `Identity: ${pi.accountType} (${pi.niche})\n`;
      structuredContext += `Growth Stage: ${pi.growthStage}\n`;
      structuredContext += `Primary Objective: ${pi.primaryObjective}\n`;
      structuredContext += `Confidence: ${pi.confidenceScore}/100\n`;
      if (pi.evidence && Array.isArray(pi.evidence)) {
        structuredContext += `Evidence:\n`;
        for (const ev of pi.evidence) {
          structuredContext += `- ${ev}\n`;
        }
      }
      structuredContext += "</PROFILE_INTELLIGENCE>\n";
    }

    // 1.8 Retrieve Active Strategy (Phase 9)
    const activeStrategy = await db.select()
      .from(profileStrategies)
      .where(and(
        eq(profileStrategies.profileId, options.profileId),
        gte(profileStrategies.expiresAt, new Date())
      ))
      .orderBy(desc(profileStrategies.version))
      .limit(1);

    if (activeStrategy.length > 0) {
      const st = activeStrategy[0];
      structuredContext += "\n<STRATEGY>\n";
      structuredContext += `Version: ${st.version} (Confidence: ${st.confidenceScore}/100)\n\n`;
      
      structuredContext += `[Strategic Gaps]\n`;
      for (const gap of (st.strategicGaps as string[])) {
        structuredContext += `- ${gap}\n`;
      }
      
      structuredContext += `\n[Growth Opportunities]\n`;
      for (const opp of (st.growthOpportunities as string[])) {
        structuredContext += `- ${opp}\n`;
      }
      
      structuredContext += `\n[Execution Plan]\n`;
      for (const step of (st.executionPlan as any[])) {
        structuredContext += `${step.step}. ${step.action}: ${step.description}\n`;
      }
      
      structuredContext += `\n[Success Metrics]\n`;
      for (const sm of (st.successMetrics as any[])) {
        structuredContext += `- ${sm.metric} (Target: ${sm.target})\n`;
      }
      structuredContext += "</STRATEGY>\n";
    }

    // 2. Retrieve Latest Datasets (Level 1 Priority)
    // We fetch the MAX version for each dataset type for this targetId.
    const datasets = await db.execute(sql`
      SELECT DISTINCT ON (dataset_type) * 
      FROM intelligence_datasets 
      WHERE target_id = ${options.profileId}
      ORDER BY dataset_type, version DESC
    `);

    if (datasets.length > 0) {
      structuredContext += "\n<DATASETS>\n";
      for (const row of datasets as any[]) {
        structuredContext += `Dataset Type: ${row.dataset_type}\n`;
        structuredContext += `Version: ${row.version}\n`;
        structuredContext += `Data: ${JSON.stringify((row.dataset_data as any)?.aggregate || row.dataset_data)}\n\n`;
      }
      structuredContext += "</DATASETS>\n";
    }

    // 3. Retrieve Trend Events (Level 2 Priority: Major/Critical within 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = await db.select()
      .from(trendEvents)
      .where(and(
        eq(trendEvents.targetId, options.profileId),
        gte(trendEvents.detectedAt, thirtyDaysAgo),
        inArray(trendEvents.severity, ["Major", "Critical"])
      ))
      .orderBy(desc(trendEvents.detectedAt))
      .limit(3);

    if (trends.length > 0) {
      structuredContext += "\n<TRENDS>\n";
      for (const trend of trends) {
        structuredContext += `[${trend.severity.toUpperCase()} TREND] ${trend.trendType} (${trend.detectedAt.toISOString()}):\n`;
        structuredContext += `Description: ${trend.description}\n`;
        structuredContext += `Delta: ${trend.detectedChange}\n\n`;
      }
      structuredContext += "</TRENDS>\n";
    }

    return structuredContext.trim();
  }
}

export const intelligenceRetrievalService = new IntelligenceRetrievalService();
