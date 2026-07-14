import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { UsageRepository } from "@/lib/db/repositories/usage.repository";

const usageRepo = new UsageRepository();

/**
 * POST /api/admin/reset-usage
 *
 * One-time administrative utility endpoint for Stage 3B Phase 4D E2E verification.
 * Strictly checks that the authenticated Clerk ID matches the dedicated test account
 * (`user_3GOarBDiSrlDflB8dxW7hO84cO1`) before resetting only `ai_prompt_tokens` and
 * `ai_completion_tokens` to `0` for the current billing period.
 */
export async function POST() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId || clerkId !== "user_3GOarBDiSrlDflB8dxW7hO84cO1") {
      return NextResponse.json({ error: "Unauthorized access to reset-usage utility" }, { status: 403 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database client unavailable" }, { status: 503 });
    }

    // Lookup user DB UUID
    const userRecords = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (userRecords.length === 0) {
      return NextResponse.json({ error: "User record not found in database" }, { status: 404 });
    }
    const userId = userRecords[0].id;

    // Get BEFORE state
    const beforeUsage = await usageRepo.getCurrentUsage(userId);

    // Execute exact approved SQL update
    await db.execute(sql`
      UPDATE usage
      SET ai_prompt_tokens = 0,
          ai_completion_tokens = 0,
          updated_at = NOW()
      WHERE user_id = ${userId}
        AND billing_period_start = ${beforeUsage.billingPeriodStart}
    `);

    // Get AFTER state
    const afterUsage = await usageRepo.getCurrentUsage(userId);

    return NextResponse.json({
      success: true,
      clerkId,
      userId,
      before: {
        aiPromptTokens: beforeUsage.aiPromptTokens,
        aiCompletionTokens: beforeUsage.aiCompletionTokens,
        scraperCallsCount: beforeUsage.scraperCallsCount,
        totalCostUsd: beforeUsage.totalCostUsd,
        billingPeriodStart: beforeUsage.billingPeriodStart,
        billingPeriodEnd: beforeUsage.billingPeriodEnd,
      },
      after: {
        aiPromptTokens: afterUsage.aiPromptTokens,
        aiCompletionTokens: afterUsage.aiCompletionTokens,
        scraperCallsCount: afterUsage.scraperCallsCount,
        totalCostUsd: afterUsage.totalCostUsd,
        billingPeriodStart: afterUsage.billingPeriodStart,
        billingPeriodEnd: afterUsage.billingPeriodEnd,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[POST /api/admin/reset-usage] Error:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
