import { NextResponse } from "next/server";
import { ScriptGenerationService, ScriptGenerationError } from "@/services/script-generation/script-generation.service";
import { AIService } from "@/services/ai/ai.service";
import type { ContentDNAReport } from "@/types/content-dna";
import { UsageGuard } from "@/services/billing";
import { getAuthenticatedUserId } from "@/lib/auth/server-user";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dnaReport } = body as { dnaReport?: ContentDNAReport };

    if (!dnaReport || !dnaReport.id) {
      return NextResponse.json(
        { error: { message: "A valid Content DNA report is required.", code: "MISSING_DNA_REPORT" } },
        { status: 400 }
      );
    }

    // 1. Generate Deterministic Baseline Package (Fallback)
    const service = new ScriptGenerationService();
    const fallbackPkg = await service.generateScript(dnaReport);

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
        const { data, telemetry } = await aiService.generateScriptPackage(
          dnaReport,
          fallbackPkg,
          preferredProvider,
          modelPreference
        );
        return {
          data,
          usage: telemetry.usage,
          costUsd: telemetry.costEstimateUsd,
          providerId: telemetry.providerId,
        };
      },
      async () => {
        return fallbackPkg;
      }
    );

    return NextResponse.json({
      data: guardResult.data,
      telemetry: guardResult.telemetry || {
        provider: guardResult.provider,
        reason: guardResult.reason,
        upgradeAvailable: guardResult.upgradeAvailable,
      },
    });
  } catch (err) {
    if (err instanceof ScriptGenerationError) {
      const status = err.code === "INVALID_INPUT" ? 400 : 500;
      return NextResponse.json({ error: { message: err.message, code: err.code } }, { status });
    }

    return NextResponse.json(
      { error: { message: "Internal server error generating script package.", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
