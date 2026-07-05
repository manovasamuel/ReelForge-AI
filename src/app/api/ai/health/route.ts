import { NextResponse } from "next/server";
import { AIOrchestratorProvider } from "@/services/ai/providers/orchestrator.provider";

/**
 * GET /api/ai/health
 *
 * Exposes provider health monitoring, circuit breaker status, availability,
 * and telemetry metrics for system diagnostics and Settings UI badge rendering.
 */
export async function GET() {
  try {
    const healthStatus = AIOrchestratorProvider.getHealthStatus();
    return NextResponse.json({ data: healthStatus, timestamp: new Date().toISOString() }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "AI_HEALTH_CHECK_FAILED",
          message: error?.message || "Failed to retrieve AI provider health status.",
        },
      },
      { status: 500 }
    );
  }
}
