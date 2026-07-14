import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const version = process.env.NEXT_PUBLIC_APP_VERSION || "2.0.0";

  // Check if database URL is configured or set to placeholder mode
  if (!db || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("placeholder")) {
    return NextResponse.json(
      {
        success: true,
        status: "healthy (placeholder mode)",
        database: "not_configured",
        latencyMs: Date.now() - startTime,
        version,
        timestamp: new Date().toISOString(),
        message: "Cloud Foundation initialized. Supabase credentials set to placeholder.",
      },
      { status: 200 }
    );
  }

  try {
    // Execute diagnostic query to verify live Supabase connection
    await db.execute(sql`SELECT 1`);

    // Check if Stage 3B Phase 4A profile_cache table exists
    const tableCheck = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'profile_cache';
    `);

    let migrationAppliedNow = false;
    if (!tableCheck || tableCheck.length === 0) {
      // Safely apply exact audited additive migration (drizzle/0003_absurd_sebastian_shaw.sql)
      await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS "profile_cache" (
          "username_clean" varchar(255) PRIMARY KEY NOT NULL,
          "raw_profile" jsonb NOT NULL,
          "last_scraped_at" timestamp with time zone DEFAULT now() NOT NULL,
          "expires_at" timestamp with time zone NOT NULL
        );
      `));
      await db.execute(sql.raw(`
        CREATE INDEX IF NOT EXISTS "idx_profile_cache_expires_at" ON "profile_cache" USING btree ("expires_at");
      `));
      migrationAppliedNow = true;
    }

    // Verify final schema state in production Supabase database
    const verifyTable = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'profile_cache';
    `);
    const verifyIndex = await db.execute(sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'profile_cache' AND indexname = 'idx_profile_cache_expires_at';
    `);

    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        status: "healthy",
        database: "connected",
        schemaVerification: {
          profileCacheTable: verifyTable && verifyTable.length > 0,
          profileCacheIndex: verifyIndex && verifyIndex.length > 0,
          migrationAppliedNow,
        },
        latencyMs,
        version,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        database: "connection_failed",
        error: error instanceof Error ? error.message : "Unknown database error",
        latencyMs,
        version,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
