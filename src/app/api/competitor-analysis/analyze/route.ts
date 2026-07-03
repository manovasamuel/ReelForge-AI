import { NextResponse } from "next/server";
import { createErrorResponse, getStatusCode } from "@/lib/errors";
import { CompetitorAnalysisService } from "@/services/competitor-analysis/competitor-analysis.service";
import { getCompetitorAnalysisProvider } from "@/services/competitor-analysis/providers";
import type { Competitor } from "@/types/competitor";

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

    const provider = getCompetitorAnalysisProvider();
    const service = new CompetitorAnalysisService(provider);
    const analysis = await service.analyzeCompetitor(competitor);

    return NextResponse.json({ data: analysis }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
