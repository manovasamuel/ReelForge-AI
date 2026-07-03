import { NextResponse } from "next/server";
import { createErrorResponse, getStatusCode } from "@/lib/errors";
import { BrandIntelligenceService } from "@/services/brand-intelligence/brand-intelligence.service";
import { getBrandIntelligenceProvider } from "@/services/brand-intelligence/providers";
import type { InstagramProfile } from "@/types/instagram";

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

    const provider = getBrandIntelligenceProvider();
    const service = new BrandIntelligenceService(provider);
    const report = await service.analyzeBrand(profile);

    return NextResponse.json({ data: report }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
