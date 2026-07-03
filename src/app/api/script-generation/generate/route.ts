import { NextResponse } from "next/server";
import { ScriptGenerationService, ScriptGenerationError } from "@/services/script-generation/script-generation.service";
import type { ContentDNAReport } from "@/types/content-dna";

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

    const service = new ScriptGenerationService();
    const pkg = await service.generateScript(dnaReport);

    return NextResponse.json({ data: pkg });
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
