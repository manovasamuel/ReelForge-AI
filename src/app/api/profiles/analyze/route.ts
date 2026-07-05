import { NextResponse } from "next/server";
import { analyzeProfileSchema, extractUsername } from "@/lib/validators";
import { createErrorResponse, getStatusCode } from "@/lib/errors";
import { InstagramService } from "@/services/instagram/instagram.service";
import { getInstagramProvider } from "@/services/instagram/providers";
import { UsageGuard } from "@/services/billing";
import { getAuthenticatedUserId } from "@/lib/auth/server-user";

export async function POST(request: Request) {
  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const parsed = analyzeProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message ?? "Invalid request.",
          },
        },
        { status: 400 }
      );
    }

    // 2. Extract username from validated URL
    const username = extractUsername(parsed.data.instagramUrl);

    // 3. Resolve user identity and preferred provider
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
        { status: 401 }
      );
    }
    const preferredProvider = request.headers.get("x-instagram-provider") || body?.provider || "apify";

    // 4. Execute through UsageGuard (Enforces quotas & fallback without blocking)
    const guardResult = await UsageGuard.guardScraperExecution(
      userId,
      preferredProvider,
      async () => {
        const provider = getInstagramProvider(preferredProvider);
        const service = new InstagramService(provider);
        return service.fetchProfile(username);
      },
      async () => {
        const mockProvider = getInstagramProvider("mock");
        const service = new InstagramService(mockProvider);
        return service.fetchProfile(username);
      }
    );

    // 5. Return structured response with fallback telemetry
    return NextResponse.json(
      {
        data: guardResult.data,
        telemetry: {
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
