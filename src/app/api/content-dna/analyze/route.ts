import { NextResponse } from "next/server";
import { ContentDNAService, ContentDNAError } from "@/services/content-dna/content-dna.service";
import { AIService } from "@/services/ai/ai.service";
import type { ContentIntelligenceReport } from "@/types/content-intelligence";
import { UsageGuard } from "@/services/billing";
import { getAuthenticatedUserId } from "@/lib/auth/server-user";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reports } = body as { reports?: ContentIntelligenceReport[] };

    if (!reports || !Array.isArray(reports) || reports.length === 0) {
      return NextResponse.json(
        { error: { message: "An array of Content Intelligence reports is required.", code: "MISSING_REPORTS" } },
        { status: 400 }
      );
    }

    // 1. Generate Deterministic Baseline Report (Fallback)
    const service = new ContentDNAService();
    const fallbackReport = await service.generateDNA(reports);

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
        const { data, telemetry } = await aiService.generateContentDNA(
          reports,
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
  } catch (err) {
    if (err instanceof ContentDNAError) {
      const status = err.code === "INVALID_INPUT" ? 400 : 500;
      return NextResponse.json({ error: { message: err.message, code: err.code } }, { status });
    }

    return NextResponse.json(
      { error: { message: "Internal server error generating Content DNA.", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
