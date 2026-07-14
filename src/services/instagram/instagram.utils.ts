import type { InstagramProfile } from "@/types/instagram";

/**
 * Deterministically normalizes any input string (plain username, @username, or Instagram URL)
 * into the canonical lowercase username.
 *
 * Rules:
 * - Handles full profile URLs (https://www.instagram.com/nike/, https://instagram.com/nike?igshid=123)
 * - Strips leading @, leading/trailing slashes, and whitespace
 * - Validates against Instagram username character constraints (1-30 chars: a-z, 0-9, ., _)
 * - Returns "" if input is invalid or empty
 */
export function normalizeInstagramUsername(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }
  let cleaned = input.trim().toLowerCase();

  // Handle URL inputs (e.g., https://www.instagram.com/nike/?igshid=123)
  if (cleaned.includes("instagram.com/")) {
    const parts = cleaned.split("instagram.com/");
    const afterDomain = parts[1] || "";
    const segment = afterDomain.split(/[/?#]/)[0] || "";
    cleaned = segment;
  }

  // Strip leading '@' and any slashes
  cleaned = cleaned.replace(/^[@/]+/, "").replace(/[/]+$/, "");

  // Validate Instagram username format (1-30 alphanumeric, period, underscore)
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(cleaned)) {
    return "";
  }

  return cleaned;
}

/**
 * Validates whether an unknown payload is a well-formed InstagramProfile object.
 * Protects against malformed, partial, or corrupted JSON payloads in the database cache.
 */
export function isValidInstagramProfile(payload: any): payload is InstagramProfile {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return false;
  }

  if (typeof payload.username !== "string" || !payload.username.trim()) {
    return false;
  }

  // Verify numerical statistics (allowing 0)
  if (
    typeof payload.follower_count !== "number" ||
    typeof payload.following_count !== "number" ||
    typeof payload.post_count !== "number"
  ) {
    return false;
  }

  // Verify boolean flags
  if (typeof payload.is_private !== "boolean" || typeof payload.is_verified !== "boolean") {
    return false;
  }

  // Verify posts array (if present must be array of objects)
  if (payload.posts !== undefined && payload.posts !== null) {
    if (!Array.isArray(payload.posts)) {
      return false;
    }
    for (const post of payload.posts) {
      if (!post || typeof post !== "object" || typeof post.id !== "string") {
        return false;
      }
    }
  }

  return true;
}
