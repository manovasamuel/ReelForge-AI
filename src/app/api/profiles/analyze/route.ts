import { NextResponse } from "next/server";
import { analyzeProfileSchema, extractUsername } from "@/lib/validators";
import { createErrorResponse, getStatusCode } from "@/lib/errors";
import { InstagramService } from "@/services/instagram/instagram.service";
import { getInstagramProvider } from "@/services/instagram/providers";

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

    // 3. Build service with active provider (from factory)
    const provider = getInstagramProvider();
    const service = new InstagramService(provider);

    // 4. Fetch profile
    const profile = await service.fetchProfile(username);

    // 5. Return structured response
    return NextResponse.json({ data: profile }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
