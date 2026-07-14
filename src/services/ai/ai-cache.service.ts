import { db } from "@/lib/db";
import { aiCache } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const DEFAULT_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds

interface MemoryCacheEntry<T = any> {
  data: T;
  expiresAt: number;
}

/**
 * AICacheService — Phase 7.4 AI Intelligence Caching Layer.
 *
 * Implements a 14-day TTL persistence layer across memory and database for stable
 * analytical outputs (`Brand Intelligence`, `Competitor Analysis`, `Content DNA`).
 *
 * Guarantees:
 * - 100% additive / non-blocking resilience: database errors or schema mismatches
 *   never crash the pipeline and fall back safely to live generation or memory.
 * - Cache key normalization across inputs.
 */
export class AICacheService {
  private static memoryCache: Map<string, MemoryCacheEntry> = new Map();

  /**
   * Generates a normalized cache key.
   */
  public static generateKey(type: string, identifier: string): string {
    const cleanId = identifier.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    return `${type}:${cleanId}`;
  }

  /**
   * Retrieves fresh cached AI intelligence report if valid and unexpired.
   */
  public static async get<T = any>(type: string, identifier: string): Promise<T | null> {
    const key = this.generateKey(type, identifier);
    const now = Date.now();

    // 1. Check in-memory cache first
    const memEntry = this.memoryCache.get(key);
    if (memEntry) {
      if (memEntry.expiresAt > now) {
        console.info(`[AICacheService] Memory cache HIT for [${key}]`);
        return memEntry.data as T;
      } else {
        this.memoryCache.delete(key);
      }
    }

    // 2. Check database persistence
    if (!db) {
      return null;
    }

    try {
      const rows = await db
        .select()
        .from(aiCache)
        .where(eq(aiCache.key, key))
        .limit(1);

      if (!rows || rows.length === 0 || !rows[0]) {
        return null;
      }

      const row = rows[0];
      if (new Date(row.expiresAt).getTime() <= now) {
        return null;
      }

      // Populate memory cache for subsequent fast reads
      this.memoryCache.set(key, {
        data: row.data as T,
        expiresAt: new Date(row.expiresAt).getTime(),
      });

      console.info(`[AICacheService] Database cache HIT for [${key}]`);
      return row.data as T;
    } catch (error) {
      console.warn(`[AICacheService] Database read error for [${key}]. Treating as cache miss:`, error);
      return null;
    }
  }

  /**
   * Persists AI intelligence report into memory and database with TTL.
   */
  public static async set<T = any>(
    type: string,
    identifier: string,
    data: T,
    ttlMs: number = DEFAULT_TTL_MS
  ): Promise<void> {
    const key = this.generateKey(type, identifier);
    const now = Date.now();
    const expiresAt = new Date(now + ttlMs);

    // 1. Store in memory cache
    this.memoryCache.set(key, {
      data,
      expiresAt: expiresAt.getTime(),
    });

    // 2. Persist in database asynchronously/non-blocking
    if (!db) {
      return;
    }

    try {
      await db
        .insert(aiCache)
        .values({
          key,
          type,
          data: data as any,
          createdAt: new Date(),
          expiresAt,
        })
        .onConflictDoUpdate({
          target: aiCache.key,
          set: {
            data: data as any,
            createdAt: new Date(),
            expiresAt,
          },
        });
      console.info(`[AICacheService] Persisted cache for [${key}] (Expires: ${expiresAt.toISOString()})`);
    } catch (error) {
      console.warn(`[AICacheService] Database write error for [${key}]. Stored in memory only:`, error);
    }
  }

  /**
   * Explicitly invalidates cache for a given key.
   */
  public static async invalidate(type: string, identifier: string): Promise<void> {
    const key = this.generateKey(type, identifier);
    this.memoryCache.delete(key);

    if (!db) return;
    try {
      await db.delete(aiCache).where(eq(aiCache.key, key));
      console.info(`[AICacheService] Invalidated cache for [${key}]`);
    } catch (error) {
      console.warn(`[AICacheService] Error invalidating database cache for [${key}]:`, error);
    }
  }
}
