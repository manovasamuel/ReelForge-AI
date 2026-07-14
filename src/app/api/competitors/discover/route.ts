import { NextResponse } from "next/server";
import { createErrorResponse, getStatusCode } from "@/lib/errors";
import { CompetitorService } from "@/services/competitors/competitors.service";
import { getCompetitorProvider } from "@/services/competitors/providers";
import type { BrandIntelligenceReport } from "@/types/brand-intelligence";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const brandReport = body?.brandReport as BrandIntelligenceReport;

    if (!brandReport || !brandReport.industry) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Brand Intelligence report is required to discover competitors.",
          },
        },
        { status: 400 }
      );
    }

    const providerId = body?.provider || request.headers.get("x-competitors-provider") || undefined;
    const provider = getCompetitorProvider(providerId);
    const service = new CompetitorService(provider);
    const competitors = await service.discoverCompetitors(brandReport);

    return NextResponse.json({ data: competitors }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
