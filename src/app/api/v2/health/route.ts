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
    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        status: "healthy",
        database: "connected",
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
