import * as dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });

import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

async function verifyAndApplyMigration() {
  const { db } = await import("../../src/lib/db/index");
  if (!db) {
    console.error("❌ Database client is not initialized or DATABASE_URL is missing.");
    process.exit(1);
  }

  console.log("Checking if profile_cache table exists in production database...");
  try {
    const checkQuery = sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'profile_cache';
    `;
    const res = await db.execute(checkQuery);

    if (res && res.length > 0) {
      console.log("✅ profile_cache table already exists in production database.");
    } else {
      console.log("⚡ profile_cache table does NOT exist yet. Applying exact audited additive migration...");
      
      const migrationSqlPath = path.join(__dirname, "../../drizzle/0003_absurd_sebastian_shaw.sql");
      const migrationSql = fs.readFileSync(migrationSqlPath, "utf8");
      
      console.log("\nExact SQL being executed:");
      console.log(migrationSql);
      console.log("------------------------------------------");

      // Split by Drizzle statement breakpoint and execute each statement
      const statements = migrationSql
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        console.log(`Executing:\n${statement}\n`);
        await db.execute(sql.raw(statement));
      }

      console.log("✅ Migration applied successfully.");
    }

    // Double check indexes and table existence
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

    console.log("\n=== Production Database Verification Result ===");
    console.log(`Table 'profile_cache' exists: ${verifyTable && verifyTable.length > 0 ? "YES ✅" : "NO ❌"}`);
    console.log(`Index 'idx_profile_cache_expires_at' exists: ${verifyIndex && verifyIndex.length > 0 ? "YES ✅" : "NO ❌"}`);

    if (!verifyTable || verifyTable.length === 0 || !verifyIndex || verifyIndex.length === 0) {
      process.exit(1);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Database verification/migration failed:", err);
    process.exit(1);
  }
}

verifyAndApplyMigration();
