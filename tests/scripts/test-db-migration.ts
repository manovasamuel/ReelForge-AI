import postgres from "postgres";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.production.local" });
dotenv.config({ path: ".env.local" });

async function main() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Missing DIRECT_URL or DATABASE_URL in .env.local");
  }

  const sql = postgres(url);
  try {
    console.log("Checking existing tables in database...");
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("Existing tables:", tables.map(t => t.table_name));

    // Check if ai_cache table already exists
    const aiCacheExists = tables.some(t => t.table_name === "ai_cache");
    if (aiCacheExists) {
      console.log("✅ Table 'ai_cache' already exists!");
    } else {
      console.log("Reading drizzle/0004_lethal_azazel.sql...");
      const sqlContent = fs.readFileSync(path.resolve("drizzle/0004_lethal_azazel.sql"), "utf-8");
      const statements = sqlContent.split("--> statement-breakpoint").map(s => s.trim()).filter(Boolean);
      
      for (const stmt of statements) {
        console.log("Executing statement:\n", stmt);
        await sql.unsafe(stmt);
        console.log("✅ Statement applied cleanly.");
      }
    }

    // Verify ai_cache table schema
    const cols = await sql`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'ai_cache'
    `;
    console.log("\nTable 'ai_cache' columns:");
    console.table(cols);

  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
