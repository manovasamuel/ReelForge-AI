import { NextResponse } from "next/server";
import { createErrorResponse, getStatusCode } from "@/lib/errors";
import { ContentCollectionService } from "@/services/content-collection/content-collection.service";
import { getContentCollectionProvider } from "@/services/content-collection/providers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = body?.username as string;

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Competitor username is required.",
          },
        },
        { status: 400 }
      );
    }

    const provider = getContentCollectionProvider();
    const service = new ContentCollectionService(provider);
    const items = await service.collectContent(username);

    return NextResponse.json({ data: items }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
