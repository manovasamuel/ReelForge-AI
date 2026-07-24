import { db } from "@/lib/db";
import { aiExecutions, memoryTelemetry } from "@/lib/db/schema";

export type AIExecutionInsert = typeof aiExecutions.$inferInsert;
export type MemoryTelemetryInsert = typeof memoryTelemetry.$inferInsert;

export class TelemetryRepository {
  /**
   * Logs an AI execution in a fire-and-forget manner.
   * We do not wait for the promise to resolve to avoid impacting latency.
   */
  static logAIExecution(data: AIExecutionInsert): void {
    // Fire and forget
    db!.insert(aiExecutions)
      .values(data)
      .execute()
      .catch((error) => {
        // Silently swallow error to prevent breaking execution path
        console.error("[Telemetry] Failed to log AI execution:", error);
      });
  }

  /**
   * Logs a memory telemetry event in a fire-and-forget manner.
   */
  static logMemoryOperation(data: MemoryTelemetryInsert): void {
    // Fire and forget
    db!.insert(memoryTelemetry)
      .values(data)
      .execute()
      .catch((error) => {
        // Silently swallow error to prevent breaking execution path
        console.error("[Telemetry] Failed to log Memory telemetry:", error);
      });
  }
}
