import { db } from "@/lib/db";
import { aiExecutions, memoryTelemetry, workspaces } from "@/lib/db/schema";
import { eq, and, sql, gte } from "drizzle-orm";

export interface WorkspaceMetrics {
  totalExecutions: number;
  totalTokens: number;
  totalCostUsd: string;
  fallbackRate: number;
  avgLatencyMs: number;
}

export interface ProviderUsage {
  providerId: string;
  modelUsed: string;
  executions: number;
  tokens: number;
  costUsd: string;
}

export interface MemoryPerformance {
  totalOperations: number;
  successRate: number;
  avgDurationMs: number;
  avgItemsProcessed: number;
}

export class AnalyticsService {
  /**
   * Aggregates high-level AI usage metrics for a workspace over an optional time period.
   * If days is provided, filters to the last N days.
   */
  public static async getWorkspaceMetrics(workspaceId: string, days?: number): Promise<WorkspaceMetrics> {
    const timeFilter = days ? gte(aiExecutions.createdAt, sql`NOW() - INTERVAL '${days} days'`) : undefined;
    const conditions = timeFilter ? and(eq(aiExecutions.workspaceId, workspaceId), timeFilter) : eq(aiExecutions.workspaceId, workspaceId);

    const result = await db!
      .select({
        totalExecutions: sql<number>`CAST(COUNT(*) AS INTEGER)`,
        totalTokens: sql<number>`CAST(COALESCE(SUM(${aiExecutions.totalTokens}), 0) AS INTEGER)`,
        totalCostUsd: sql<string>`CAST(COALESCE(SUM(${aiExecutions.costEstimateUsd}), 0) AS TEXT)`,
        fallbackRate: sql<number>`CAST(COALESCE(SUM(CASE WHEN ${aiExecutions.fallbackUsed} THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0) AS FLOAT)`,
        avgLatencyMs: sql<number>`CAST(COALESCE(AVG(${aiExecutions.latencyMs}), 0) AS INTEGER)`,
      })
      .from(aiExecutions)
      .where(conditions);

    if (!result[0]) {
      return { totalExecutions: 0, totalTokens: 0, totalCostUsd: "0", fallbackRate: 0, avgLatencyMs: 0 };
    }

    return result[0];
  }

  /**
   * Groups AI usage by provider and model.
   */
  public static async getProviderUsage(workspaceId: string, days?: number): Promise<ProviderUsage[]> {
    const timeFilter = days ? gte(aiExecutions.createdAt, sql`NOW() - INTERVAL '${days} days'`) : undefined;
    const conditions = timeFilter ? and(eq(aiExecutions.workspaceId, workspaceId), timeFilter) : eq(aiExecutions.workspaceId, workspaceId);

    return await db!
      .select({
        providerId: aiExecutions.providerId,
        modelUsed: aiExecutions.modelUsed,
        executions: sql<number>`CAST(COUNT(*) AS INTEGER)`,
        tokens: sql<number>`CAST(SUM(${aiExecutions.totalTokens}) AS INTEGER)`,
        costUsd: sql<string>`CAST(SUM(${aiExecutions.costEstimateUsd}) AS TEXT)`,
      })
      .from(aiExecutions)
      .where(conditions)
      .groupBy(aiExecutions.providerId, aiExecutions.modelUsed)
      .orderBy(sql`SUM(${aiExecutions.costEstimateUsd}) DESC`);
  }

  /**
   * Aggregates memory/RAG performance metrics.
   */
  public static async getMemoryPerformance(workspaceId: string, days?: number): Promise<MemoryPerformance> {
    const timeFilter = days ? gte(memoryTelemetry.createdAt, sql`NOW() - INTERVAL '${days} days'`) : undefined;
    const conditions = timeFilter ? and(eq(memoryTelemetry.workspaceId, workspaceId), timeFilter) : eq(memoryTelemetry.workspaceId, workspaceId);

    const result = await db!
      .select({
        totalOperations: sql<number>`CAST(COUNT(*) AS INTEGER)`,
        successRate: sql<number>`CAST(COALESCE(SUM(CASE WHEN ${memoryTelemetry.successful} THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0) AS FLOAT)`,
        avgDurationMs: sql<number>`CAST(COALESCE(AVG(${memoryTelemetry.durationMs}), 0) AS INTEGER)`,
        avgItemsProcessed: sql<number>`CAST(COALESCE(AVG(${memoryTelemetry.itemsProcessed}), 0) AS FLOAT)`,
      })
      .from(memoryTelemetry)
      .where(conditions);

    if (!result[0]) {
      return { totalOperations: 0, successRate: 0, avgDurationMs: 0, avgItemsProcessed: 0 };
    }

    return result[0];
  }

  /**
   * Tracks an operation in the telemetry table.
   */
  public static async trackMemoryOperation(
    workspaceId: string,
    operation: string,
    data: { durationMs: number; itemsProcessed?: number; successful?: boolean; errorMessage?: string }
  ): Promise<void> {
    await db!.insert(memoryTelemetry).values({
      workspaceId,
      operation,
      durationMs: data.durationMs,
      itemsProcessed: data.itemsProcessed ?? 0,
      successful: data.successful ?? true,
      errorMessage: data.errorMessage,
    });
  }
}
