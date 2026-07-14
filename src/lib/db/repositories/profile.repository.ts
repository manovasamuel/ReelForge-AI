import { db } from "@/lib/db";
import { profileCache } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { InstagramProfile } from "@/types/instagram";
import { normalizeInstagramUsername, isValidInstagramProfile } from "@/services/instagram/instagram.utils";

const DEFAULT_TTL_MINUTES = 10080; // 7 days (10080 minutes)

/**
 * ProfileRepository — Stage 3B Phase 4A Shared Scraper Cache.
 *
 * Manages global, multi-tenant persistence of external public Instagram profiles (`InstagramProfile`)
 * indexed by normalized username (`username_clean`) with server-controlled TTL validity.
 *
 * Guarantees:
 * - 100% additive / non-blocking resilience: offline DB or corrupted JSON treated safely as cache miss.
 * - Runtime validation of `raw_profile` JSONB boundary.
 * - Zero user/project isolation violations (stores only external public profile metrics & posts).
 */
export class ProfileRepository {
  /**
   * Retrieves a non-expired cached Instagram profile by normalized username.
   * Returns null if cache miss, expired, malformed JSON, or database unavailable.
   */
  public static async getFreshByUsername(username: string): Promise<InstagramProfile | null> {
    const cleanUsername = normalizeInstagramUsername(username);
    if (!cleanUsername) {
      return null;
    }

    if (!db) {
      return null;
    }

    try {
      const now = new Date();
      const rows = await db
        .select()
        .from(profileCache)
        .where(eq(profileCache.usernameClean, cleanUsername))
        .limit(1);

      if (!rows || rows.length === 0 || !rows[0]) {
        return null;
      }

      const row = rows[0];

      // Verify expiration timestamp
      if (new Date(row.expiresAt) <= now) {
        return null;
      }

      // Validate JSON payload runtime integrity
      if (!isValidInstagramProfile(row.rawProfile)) {
        console.warn(`[ProfileRepository] Corrupted or invalid JSON in cache for @${cleanUsername}. Treating as cache miss.`);
        return null;
      }

      return row.rawProfile;
    } catch (err) {
      console.warn(`[ProfileRepository] Failed to read from profile_cache:`, err);
      return null;
    }
  }

  /**
   * Upserts a normalized InstagramProfile to the empirical cache table.
   * Server-controlled TTL defaults to 10080 minutes (7 days).
   */
  public static async save(profile: InstagramProfile, ttlMinutes: number = DEFAULT_TTL_MINUTES): Promise<void> {
    if (!profile || !isValidInstagramProfile(profile)) {
      return;
    }

    const cleanUsername = normalizeInstagramUsername(profile.username);
    if (!cleanUsername) {
      return;
    }

    if (!db) {
      return;
    }

    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

      await db
        .insert(profileCache)
        .values({
          usernameClean: cleanUsername,
          rawProfile: profile as any,
          lastScrapedAt: now,
          expiresAt,
        })
        .onConflictDoUpdate({
          target: profileCache.usernameClean,
          set: {
            rawProfile: profile as any,
            lastScrapedAt: now,
            expiresAt,
          },
        });
    } catch (err) {
      console.warn(`[ProfileRepository] Failed to save profile_cache for @${cleanUsername}:`, err);
    }
  }
}
