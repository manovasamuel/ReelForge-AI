import { NextResponse } from "next/server";
import { RepurposeService, RepurposeError } from "@/services/repurpose/repurpose.service";
import { AIService } from "@/services/ai/ai.service";
import type { ReelContentPackage } from "@/types/script-generation";
import { UsageGuard } from "@/services/billing";
import { getAuthenticatedUserId } from "@/lib/auth/server-user";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pkg } = body as { pkg?: ReelContentPackage };

    if (!pkg || !pkg.id) {
      return NextResponse.json(
        { error: { message: "A valid Reel Content Package is required.", code: "MISSING_PACKAGE" } },
        { status: 400 }
      );
    }

    // 1. Generate Deterministic Baseline Report (Fallback)
    const service = new RepurposeService();
    const fallbackReport = await service.generateRepurpose(pkg);

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
        const { data, telemetry } = await aiService.generateRepurposePackage(
          pkg,
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
    if (err instanceof RepurposeError) {
      const status = err.code === "INVALID_INPUT" ? 400 : 500;
      return NextResponse.json({ error: { message: err.message, code: err.code } }, { status });
    }

    return NextResponse.json(
      { error: { message: "Internal server error adapting repurpose report.", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
