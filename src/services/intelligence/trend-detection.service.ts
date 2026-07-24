import { db } from "@/lib/db";
import { intelligenceDatasets, trendEvents } from "@/lib/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { AIOrchestratorProvider } from "@/services/ai/providers/orchestrator.provider";

/**
 * TrendDetectionService compares two versions of an Intelligence Dataset
 * to identify meaningful shifts in behavior, engagement, or content strategy.
 */
export class TrendDetectionService {
  private aiProvider: AIOrchestratorProvider;

  constructor() {
    this.aiProvider = new AIOrchestratorProvider("gemini");
  }

  /**
   * Analyzes the latest two versions of a dataset and detects trends.
   */
  async analyzeDatasetTrends(datasetType: string, targetId: string, workspaceId: string = "system"): Promise<void> {
    console.log(`[TrendDetectionService] Analyzing trends for dataset '${datasetType}' on target '${targetId}'`);

    // 1. Fetch the two most recent versions
    const recentDatasets = await db.select()
      .from(intelligenceDatasets)
      .where(and(
        eq(intelligenceDatasets.datasetType, datasetType),
        eq(intelligenceDatasets.targetId, targetId)
      ))
      .orderBy(desc(intelligenceDatasets.version))
      .limit(2);

    if (recentDatasets.length < 2) {
      console.log(`[TrendDetectionService] Not enough historical data to detect trends for ${targetId}. Needed: 2, Found: ${recentDatasets.length}`);
      return;
    }

    const currentDataset = recentDatasets[0];
    const previousDataset = recentDatasets[1];

    const currentAggregate = (currentDataset.datasetData as any)?.aggregate || {};
    const previousAggregate = (previousDataset.datasetData as any)?.aggregate || {};

    // 2. Delta Calculation
    const deltas = this.calculateDelta(previousAggregate, currentAggregate);
    if (Object.keys(deltas).length === 0) {
      console.log("[TrendDetectionService] No meaningful delta detected.");
      return;
    }

    // 3. AI Contextualization (Optional / Severity based)
    let aiSummary = "Numeric shift detected.";
    let confidence = 0.85;
    let severity = this.determineSeverity(deltas);

    if (severity === "Major" || severity === "Critical") {
      try {
        const prompt = `
          Analyze the following shifts in a ${datasetType} dataset for target '${targetId}'.
          Previous Data: ${JSON.stringify(previousAggregate)}
          Current Data: ${JSON.stringify(currentAggregate)}
          Calculated Deltas: ${JSON.stringify(deltas)}
          
          Provide a 1-2 sentence executive summary of what this trend means strategically. Do NOT use markdown.
        `;
        
        const response = await this.aiProvider.generateStructured<{ summary: string, confidence: number }>({
          schemaType: "trend-analysis",
          expectedSchemaDescription: "Trend shift analysis",
          fallbackData: { summary: "Significant numeric shift detected across multiple categories.", confidence: 0.90 },
          systemPrompt: "You are an elite Instagram growth strategist.",
          userPrompt: prompt,
          temperature: 0.2
        });

        if (response.data) {
          aiSummary = response.data.summary;
          confidence = response.data.confidence;
        }
      } catch (e) {
        console.warn("[TrendDetectionService] AI contextualization failed. Falling back to numeric summary.");
      }
    } else {
        // Construct basic numeric summary
        const key = Object.keys(deltas)[0];
        const val = deltas[key];
        aiSummary = `${key} shifted by ${val > 0 ? '+' : ''}${(val * 100).toFixed(1)}%`;
    }

    // 4. Persist Trend Event
    await db.insert(trendEvents).values({
      id: randomUUID(),
      trendType: `${datasetType.charAt(0).toUpperCase() + datasetType.slice(1)} Trend`,
      datasetType: datasetType,
      targetId: targetId,
      previousVersion: previousDataset.version,
      currentVersion: currentDataset.version,
      detectedChange: JSON.stringify(deltas),
      description: aiSummary,
      severity: severity,
      confidenceScore: String(confidence)
    });

    console.log(`[TrendDetectionService] Successfully persisted ${severity} trend event for ${datasetType}`);
  }

  /**
   * Calculates percentage shifts between two aggregate objects.
   * Only returns deltas > 10% (0.1) change.
   */
  private calculateDelta(prev: Record<string, number>, curr: Record<string, number>): Record<string, number> {
    const deltas: Record<string, number> = {};
    const allKeys = new Set([...Object.keys(prev), ...Object.keys(curr)]);

    for (const key of allKeys) {
      const p = prev[key] || 0;
      const c = curr[key] || 0;
      
      // Calculate delta as percentage of total volume if this was a count (simplified heuristic)
      const maxVal = Math.max(p, c);
      if (maxVal > 0) {
        const diff = (c - p) / (p === 0 ? 1 : p);
        if (Math.abs(diff) > 0.1) { // 10% threshold
            deltas[key] = diff;
        }
      }
    }
    return deltas;
  }

  /**
   * Evaluates delta severity.
   */
  private determineSeverity(deltas: Record<string, number>): string {
    let maxAbsDelta = 0;
    for (const val of Object.values(deltas)) {
      if (Math.abs(val) > maxAbsDelta) maxAbsDelta = Math.abs(val);
    }

    if (maxAbsDelta > 0.5) return "Critical"; // > 50% shift
    if (maxAbsDelta > 0.25) return "Major";   // > 25% shift
    if (maxAbsDelta > 0.15) return "Moderate"; // > 15% shift
    return "Minor";
  }
}

export const trendDetectionService = new TrendDetectionService();
