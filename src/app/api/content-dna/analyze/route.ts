import { NextResponse } from "next/server";
import { ContentDNAService, ContentDNAError } from "@/services/content-dna/content-dna.service";
import type { ContentIntelligenceReport } from "@/types/content-intelligence";

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

    const service = new ContentDNAService();
    const report = await service.generateDNA(reports);

    return NextResponse.json({ data: report });
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
