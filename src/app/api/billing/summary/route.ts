import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { resolveUser } from "@/lib/auth/server-user";
import { BillingService } from "@/services/billing";

/**
 * GET /api/billing/summary
 *
 * Returns real-time billing summary (plan config, subscription status, and usage counters).
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    let email = "dev@reelforge.ai";

    if (clerkId) {
      const user = await currentUser();
      if (user && user.emailAddresses.length > 0) {
        email = user.emailAddresses[0].emailAddress;
      }
    }

    const { userId } = await resolveUser(clerkId, email);
    const summary = await BillingService.getBillingSummary(userId);

    return NextResponse.json({ data: summary, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("[GET /api/billing/summary] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve billing summary", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
