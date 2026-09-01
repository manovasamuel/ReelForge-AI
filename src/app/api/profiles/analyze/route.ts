import { NextResponse } from "next/server";
import { createErrorResponse, getStatusCode } from "@/lib/errors";
import { getInstagramProvider } from "@/services/instagram/providers";
import { extractUsername } from "@/lib/validators";
import { normalizeInstagramUsername } from "@/services/instagram/instagram.utils";

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const instagramUrl = body?.instagramUrl as string | undefined;
    const provider =
      (body?.provider as string | undefined) ||
      request.headers.get("x-instagram-provider") ||
      undefined;

    if (!instagramUrl || typeof instagramUrl !== "string") {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "instagramUrl is required.",
          },
        },
        { status: 400 }
      );
    }

    let username: string;
    try {
      username = extractUsername(instagramUrl);
    } catch {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Please enter a valid Instagram profile URL.",
          },
        },
        { status: 400 }
      );
    }

    const cleanUsername = normalizeInstagramUsername(username);
    if (!cleanUsername) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Please enter a valid Instagram profile URL.",
          },
        },
        { status: 400 }
      );
    }

    const providerInstance = getInstagramProvider(provider);
    const profile = await providerInstance.getProfile(cleanUsername);

    return NextResponse.json(
      {
        data: profile,
        telemetry: {
          providerId: providerInstance.id,
          isMockFallback: false,
          latencyMs: Date.now() - startTime,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(createErrorResponse(error), {
      status: getStatusCode(error),
    });
  }
}