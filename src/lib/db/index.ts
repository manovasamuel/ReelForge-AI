import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

// Prevent connection leaks during Next.js Hot Module Replacement (HMR) in development
const globalForDb = globalThis as unknown as {
  client: postgres.Sql | undefined;
};

const isConfigured = connectionString && !connectionString.includes("placeholder");

// Initialize postgres client with prepare: false for Supavisor / PgBouncer compatibility
const client =
  globalForDb.client ??
  (isConfigured
    ? postgres(connectionString, {
        prepare: false, // Required for Supabase connection pooler (port 6543)
        max: 10,
        connect_timeout: 10,
      })
    : undefined);

if (process.env.NODE_ENV !== "production" && client) {
  globalForDb.client = client;
}

/**
 * Type-safe Drizzle ORM database instance.
 * Will be null if DATABASE_URL is not configured.
 */
export const db = client ? drizzle(client, { schema }) : null;

/**
 * Gracefully terminates the PostgreSQL connection pool (DEVOPS-001).
 */
export async function closeDbPool(): Promise<void> {
  if (client) {
    try {
      await client.end({ timeout: 5 });
    } catch (err) {
      console.warn("[db] Failed to cleanly close PostgreSQL pool:", err);
    }
  }
}

export type Database = typeof db;
export { schema };
