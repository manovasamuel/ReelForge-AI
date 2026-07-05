import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import { RateLimiter } from "@/lib/security/rate-limiter";

/**
 * Detect if Clerk API keys are missing or set to placeholder strings.
 * In development placeholder mode, authentication blocking is bypassed to ensure
 * local development, npm run build, and Playwright E2E tests run without interruption.
 */
const isPlaceholderAuth =
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder");

const isProtectedRoute = createRouteMatcher([
  "/profiles(.*)",
  "/workspace(.*)",
  "/export(.*)",
  "/settings(.*)",
  "/api/(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/api/v2/health(.*)",
  "/api/webhooks/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/$",
]);

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  // Enforce edge rate limiting on all API routes (except public health checks and webhooks)
  if (req.nextUrl.pathname.startsWith("/api/") && !isPublicRoute(req)) {
    const rateLimit = await RateLimiter.check(req);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
          },
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.reset),
          },
        }
      );
    }
  }

  // If Clerk keys are absent or placeholder, bypass authentication blocking
  // to allow local development, static builds, and Playwright tests to execute cleanly.
  if (isPlaceholderAuth) {
    return NextResponse.next();
  }

  // When live Clerk API keys are configured, enforce route protection via Clerk
  return clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request) && isProtectedRoute(request)) {
      await auth.protect();
    }
  })(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
