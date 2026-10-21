import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, userPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface OnboardingDependencies {
  authFn?: () => Promise<{ userId: string | null }>;
  dbClient?: typeof db;
}

export async function handleOnboardingPost(
  req: Request,
  deps: OnboardingDependencies = {}
) {
  try {
    const authFn = deps.authFn || auth;
    const dbClient = deps.dbClient || db;

    // 1. Strict Authentication Guard
    const { userId: clerkId } = await authFn();
    if (!clerkId) {
      return NextResponse.json(
        { error: "Unauthorized — Authentication required to persist user onboarding data" },
        { status: 401 }
      );
    }

    // 2. Strict JSON Payload Parsing & Validation
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Bad Request — Invalid or malformed JSON payload" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Bad Request — Payload must be a JSON object" },
        { status: 400 }
      );
    }

    const { completed, skipped, answers, completedAt } = body as Record<string, unknown>;

    // 3. Schema State Validation
    const isCompleted = completed === true;
    const isSkipped = skipped === true;

    if (!isCompleted && !isSkipped) {
      return NextResponse.json(
        { error: "Bad Request — Payload must explicitly specify completed: true or skipped: true" },
        { status: 400 }
      );
    }

    // If marked as completed without skipping, require non-empty answers with at least one valid response
    if (isCompleted && !isSkipped) {
      if (
        !answers ||
        typeof answers !== "object" ||
        Array.isArray(answers) ||
        Object.keys(answers).length === 0
      ) {
        return NextResponse.json(
          { error: "Bad Request — Completed onboarding requires valid, non-empty answers" },
          { status: 400 }
        );
      }

      const answerValues = Object.values(answers as Record<string, unknown>);
      const hasValidAnswer = answerValues.some(
        (v) => typeof v === "string" && v.trim().length > 0
      );
      if (!hasValidAnswer) {
        return NextResponse.json(
          { error: "Bad Request — At least one valid question response is required for completion" },
          { status: 400 }
        );
      }
    }

    // 4. Strict User-Isolation & Persistence (Only modifies authenticated user's own record)
    const user = await dbClient.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found — User profile must exist before saving preferences" },
        { status: 404 }
      );
    }

    const existingPref = await dbClient.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, user.id),
    });

    const currentOverrides = (existingPref?.customPromptOverrides as Record<string, unknown>) || {};
    const updatedOverrides = {
      ...currentOverrides,
      onboarding: {
        completed: isCompleted,
        skipped: isSkipped,
        answers: answers && typeof answers === "object" ? answers : {},
        completedAt: typeof completedAt === "string" ? completedAt : new Date().toISOString(),
      },
    };

    if (existingPref) {
      await dbClient
        .update(userPreferences)
        .set({
          customPromptOverrides: updatedOverrides,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, user.id));
    } else {
      await dbClient.insert(userPreferences).values({
        userId: user.id,
        customPromptOverrides: updatedOverrides,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        completed: isCompleted,
        skipped: isSkipped,
        completedAt: updatedOverrides.onboarding.completedAt,
      },
    });
  } catch (err) {
    console.error("[api/user/onboarding] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return handleOnboardingPost(req);
}
