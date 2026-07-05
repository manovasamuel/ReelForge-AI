import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { resolveUser } from "@/lib/auth/server-user";
import { BillingService } from "@/services/billing";
import type { PlanId } from "@/services/billing/plan.interface";

/**
 * POST /api/billing/checkout
 *
 * Creates a Stripe Checkout Session for subscription tier upgrades ('pro' | 'enterprise').
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

    const body = await req.json().catch(() => ({}));
    const planId = (body.planId || "pro") as PlanId;

    const origin = req.headers.get("origin") || req.nextUrl.origin || "https://reelforge.ai";
    const returnUrl = `${origin}/profiles`;

    const { url } = await BillingService.createCheckoutSession(userId, email, planId, returnUrl);

    return NextResponse.json({ data: { url } });
  } catch (error) {
    console.error("[POST /api/billing/checkout] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
