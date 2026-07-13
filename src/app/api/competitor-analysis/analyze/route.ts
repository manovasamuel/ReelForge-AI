import { NextResponse } from "next/server";
import { createErrorResponse, getStatusCode } from "@/lib/errors";
import { CompetitorAnalysisService } from "@/services/competitor-analysis/competitor-analysis.service";
import { getCompetitorAnalysisProvider } from "@/services/competitor-analysis/providers";
import { AIService } from "@/services/ai/ai.service";
import type { Competitor } from "@/types/competitor";
import { UsageGuard } from "@/services/billing";
import { getAuthenticatedUserId } from "@/lib/auth/server-user";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const competitor = body?.competitor as Competitor;

    if (!competitor || !competitor.username) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Competitor profile object is required.",
          },
        },
        { status: 400 }
      );
    }

    // 1. Generate Deterministic Baseline Report (Fallback)
    const provider = getCompetitorAnalysisProvider();
    const service = new CompetitorAnalysisService(provider);
    const fallbackReport = await service.analyzeCompetitor(competitor);

    // 2. Resolve user identity and AI preferences
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
        { status: 401 }
      );
    }
    const aiService = new AIService();
    const preferredProvider = request.headers.get("x-ai-provider") || body?.aiProvider || "gemini";
    const modelPreference = request.headers.get("x-ai-model") || body?.aiModel || "gemini-3.1-flash-lite";

    // 3. Execute through UsageGuard (Enforces token limits without blocking)
    const guardResult = await UsageGuard.guardAiExecution(
      userId,
      modelPreference,
      async () => {
        const { data, telemetry } = await aiService.generateCompetitorAnalysis(
          competitor,
          fallbackReport,
          preferredProvider,
          modelPreference
        );
        return {
          data,
          usage: telemetry.usage,
          costUsd: telemetry.costEstimateUsd,
          providerId: telemetry.providerId,
          telemetry,
        };
      },
      async () => {
        return fallbackReport;
      }
    );

    return NextResponse.json(
      {
        data: guardResult.data,
        telemetry: guardResult.telemetry || {
          provider: guardResult.provider,
          reason: guardResult.reason,
          upgradeAvailable: guardResult.upgradeAvailable,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
