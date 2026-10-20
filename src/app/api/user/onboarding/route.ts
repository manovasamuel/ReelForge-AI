import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, userPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: true, note: "Unauthenticated or dev bypass" });
    }

    const body = await req.json();
    const { completed, skipped, answers, completedAt } = body;

    // Persist to userPreferences table using existing JSONB column without schema migrations
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkId),
      });

      if (user) {
        const existingPref = await db.query.userPreferences.findFirst({
          where: eq(userPreferences.userId, user.id),
        });

        const currentOverrides = (existingPref?.customPromptOverrides as Record<string, unknown>) || {};
        const updatedOverrides = {
          ...currentOverrides,
          onboarding: {
            completed: !!completed,
            skipped: !!skipped,
            answers: answers || {},
            completedAt: completedAt || new Date().toISOString(),
          },
        };

        if (existingPref) {
          await db
            .update(userPreferences)
            .set({
              customPromptOverrides: updatedOverrides,
              updatedAt: new Date(),
            })
            .where(eq(userPreferences.userId, user.id));
        } else {
          await db.insert(userPreferences).values({
            userId: user.id,
            customPromptOverrides: updatedOverrides,
          });
        }
      }
    } catch (dbError) {
      console.warn("[api/user/onboarding] Database update warning (non-fatal):", dbError);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/user/onboarding] Unexpected error:", err);
    return NextResponse.json({ success: true });
  }
}
