import { NextResponse } from "next/server";
import { createErrorResponse, getStatusCode } from "@/lib/errors";
import { BrandIntelligenceService } from "@/services/brand-intelligence/brand-intelligence.service";
import { getBrandIntelligenceProvider } from "@/services/brand-intelligence/providers";
import { AIService } from "@/services/ai/ai.service";
import type { InstagramProfile } from "@/types/instagram";
import { UsageGuard } from "@/services/billing";
import { getAuthenticatedUserId } from "@/lib/auth/server-user";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profile = body?.profile as InstagramProfile;

    if (!profile || !profile.username) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Profile payload is required to generate brand intelligence.",
          },
        },
        { status: 400 }
      );
    }

    // 1. Generate Deterministic Baseline Report (Fallback)
    const provider = getBrandIntelligenceProvider();
    const service = new BrandIntelligenceService(provider);
    const fallbackReport = await service.analyzeBrand(profile);

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
        const { data, telemetry } = await aiService.generateBrandIntelligence(
          profile,
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
