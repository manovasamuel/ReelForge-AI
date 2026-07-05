import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { resolveUser } from "@/lib/auth/server-user";
import { BillingService } from "@/services/billing";

/**
 * POST /api/billing/portal
 *
 * Creates a Stripe Customer Portal Session for self-service subscription management,
 * payment method updates, and plan cancellation.
 * Returns { url } for client-side redirection.
 */
export async function POST(req: NextRequest) {
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

    const origin = req.headers.get("origin") || req.nextUrl.origin || "https://reelforge.ai";
    const returnUrl = `${origin}/profiles?billing=portal_closed`;

    const { url } = await BillingService.createPortalSession(userId, returnUrl);

    return NextResponse.json({ data: { url } });
  } catch (error) {
    console.error("[POST /api/billing/portal] Error:", error);
    return NextResponse.json(
      { error: "Failed to create customer portal session", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
