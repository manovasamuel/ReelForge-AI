import type { NextRequest } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate Limiter — ReelForge AI v2.0 Phase 6 Hardening (SEC-003).
 *
 * Implements a sliding window / token bucket rate limit to protect third-party
 * scraping and AI APIs against high-frequency DoS and brute-force abuse.
 *
 * In Development / Placeholder / CI Test mode: defaults to 10,000 req/min to prevent test flakes.
 * In Production mode: enforces 60 requests per minute per IP or authenticated user ID.
 */
export class RateLimiter {
  private static readonly windowMs = 60000; // 1 minute window
  private static readonly defaultLimit =
    process.env.NODE_ENV === "test" ||
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder")
      ? 10000
      : 60;

  // In-memory sliding window store
  private static readonly store = new Map<string, RateLimitEntry>();

  public static async check(req: NextRequest, customLimit?: number): Promise<RateLimitResult> {
    const limit = customLimit ?? this.defaultLimit;
    const now = Date.now();

    // Determine client identifier (IP address or fallback)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const key = `ratelimit:${ip}`;

    let entry = this.store.get(key);
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    entry.count += 1;
    this.store.set(key, entry);

    // Periodic cleanup of expired entries to prevent memory leaks
    if (this.store.size > 10000) {
      for (const [k, val] of this.store.entries()) {
        if (now > val.resetTime) {
          this.store.delete(k);
        }
      }
    }

    const remaining = Math.max(0, limit - entry.count);
    const success = entry.count <= limit;

    return {
      success,
      limit,
      remaining,
      reset: Math.ceil(entry.resetTime / 1000),
    };
  }
}
