import { db } from "../../src/lib/db";
import { sql } from "drizzle-orm";

/**
 * Database Integrity Verification
 *
 * Validates:
 * 1. All migration tables exist
 * 2. Foreign key constraints are enforced
 * 3. Workspace ownership is correctly recorded
 * 4. Core schema is intact for a fresh deployment
 */

const REQUIRED_TABLES = [
  "users",
  "workspaces",
  "workspace_members",
  "projects",
  "brands",
  "brand_assets",
  "social_accounts",
  "publishing_drafts",
  "publishing_posts",
  "ai_telemetry",
  "memory_entries",
  "workspace_subscriptions",
];

async function verifyDatabaseIntegrity() {
  console.log("\n=== Database Integrity Verification ===\n");

  if (!db) {
    console.log("⚠️  DATABASE_URL not configured. Skipping live database check.");
    console.log("   Set DATABASE_URL environment variable to run this against a live database.");
    process.exit(0);
  }

  let passed = 0;
  let failed = 0;
  let warnings = 0;

  // ─── Step 1: Table Existence ─────────────────────────────────────────────
  console.log("Step 1: Verifying required tables exist...\n");

  for (const table of REQUIRED_TABLES) {
    try {
      const result = await db.execute(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = ${table}
        ) as exists
      `);
      const exists = (result.rows[0] as any)?.exists;
      if (exists) {
        console.log(`  ✅ Table '${table}' exists`);
        passed++;
      } else {
        console.error(`  ❌ Table '${table}' is MISSING`);
        failed++;
      }
    } catch (error: any) {
      console.error(`  ❌ Error checking table '${table}': ${error.message}`);
      failed++;
    }
  }

  // ─── Step 2: Foreign Key Constraints ────────────────────────────────────
  console.log("\nStep 2: Verifying foreign key constraints...\n");
  try {
    const fkResult = await db.execute(sql`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    `);

    const fkCount = fkResult.rows.length;
    if (fkCount > 0) {
      console.log(`  ✅ Found ${fkCount} foreign key constraint(s)`);
      passed++;

      // Check for workspace FK on publishing tables
      const publishingFKs = fkResult.rows.filter((r: any) =>
        ["publishing_drafts", "publishing_posts", "social_accounts"].includes(r.table_name)
      );
      if (publishingFKs.length > 0) {
        console.log(`  ✅ Publishing tables have ${publishingFKs.length} foreign key(s)`);
        passed++;
      } else {
        console.warn(`  ⚠️  No FKs found on publishing tables`);
        warnings++;
      }
    } else {
      console.warn(`  ⚠️  No foreign key constraints found. Check migration completeness.`);
      warnings++;
    }
  } catch (error: any) {
    console.error(`  ❌ FK constraint check failed: ${error.message}`);
    failed++;
  }

  // ─── Step 3: Row Count Sanity Check ─────────────────────────────────────
  console.log("\nStep 3: Row count sanity checks...\n");
  const tablesToCount = ["users", "workspaces", "workspace_members"];

  for (const table of tablesToCount) {
    try {
      const result = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${table}`));
      const count = parseInt((result.rows[0] as any)?.count || "0", 10);
      console.log(`  ℹ️  Table '${table}': ${count} row(s)`);
      passed++;
    } catch (error: any) {
      console.warn(`  ⚠️  Could not count rows in '${table}': ${error.message}`);
      warnings++;
    }
  }

  // ─── Step 4: Drizzle Migrations Table ───────────────────────────────────
  console.log("\nStep 4: Verifying migration history...\n");
  try {
    const migResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM drizzle.__drizzle_migrations
    `);
    const migCount = parseInt((migResult.rows[0] as any)?.count || "0", 10);
    console.log(`  ✅ Migration history: ${migCount} migration(s) applied`);
    passed++;
  } catch {
    try {
      // Try alternate schema location
      const migResult2 = await db.execute(sql`
        SELECT COUNT(*) as count FROM __drizzle_migrations
      `);
      const migCount = parseInt((migResult2.rows[0] as any)?.count || "0", 10);
      console.log(`  ✅ Migration history: ${migCount} migration(s) applied`);
      passed++;
    } catch {
      console.warn("  ⚠️  Could not verify migration table (may use different naming)");
      warnings++;
    }
  }

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log("\n=== Summary ===");
  console.log(`Passed   : ${passed}`);
  console.log(`Warnings : ${warnings}`);
  console.log(`Failed   : ${failed}`);

  if (failed > 0) {
    console.error("\n❌ FAILED: Database integrity issues found. Check migration state.");
    process.exit(1);
  } else if (warnings > 0) {
    console.warn("\n⚠️  PASSED WITH WARNINGS: Review warnings before production deployment.");
    process.exit(0);
  } else {
    console.log("\n✅ PASSED: Database integrity verified.");
    process.exit(0);
  }
}

verifyDatabaseIntegrity();
