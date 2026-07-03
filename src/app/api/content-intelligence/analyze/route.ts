import { NextResponse } from "next/server";
import { createErrorResponse, getStatusCode } from "@/lib/errors";
import { ContentIntelligenceService } from "@/services/content-intelligence/content-intelligence.service";
import { getContentIntelligenceProvider } from "@/services/content-intelligence/providers";
import type { CollectedContentItem } from "@/types/content-collection";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = body?.items as CollectedContentItem[];

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "At least one selected content item is required.",
          },
        },
        { status: 400 }
      );
    }

    const provider = getContentIntelligenceProvider();
    const service = new ContentIntelligenceService(provider);
    const reports = await service.analyzeContentItems(items);

    return NextResponse.json({ data: reports }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
