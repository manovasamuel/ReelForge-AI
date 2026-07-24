/**
 * Production Configuration Pre-Flight Verification
 *
 * This script acts as the mandatory pre-flight checklist before every
 * production or staging deployment.
 *
 * It verifies that all required environment variables are present and
 * non-trivially configured, and performs lightweight connectivity checks
 * where possible.
 *
 * Exit Codes:
 *   0 — All critical checks passed (deployment safe)
 *   1 — Critical checks failed (deployment BLOCKED)
 *   2 — Warnings only (deployment can proceed with awareness)
 *
 * Usage:
 *   npx ts-node tests/scripts/verify-production-config.ts
 */

interface EnvCheck {
  key: string;
  required: boolean;
  description: string;
  validate?: (val: string) => string | null; // returns error message or null
}

interface CheckResult {
  key: string;
  status: "PASS" | "FAIL" | "WARN" | "SKIP";
  message: string;
}

// ─── Validation Helpers ───────────────────────────────────────────────────────

function isPlaceholder(val: string): boolean {
  const PLACEHOLDER_PATTERNS = [
    /placeholder/i,
    /your_.*_here/i,
    /^xxx/i,
    /^sk_test_placeholder/,
    /^pk_test_placeholder/,
    /^whsec_placeholder/,
    /^price_.*_placeholder/,
    /apify_api_placeholder/i,
    /brightdata_placeholder/i,
    /rapidapi_placeholder/i,
    /placeholder_gemini/i,
    /placeholder_openai/i,
    /placeholder_anthropic/i,
    /placeholder_stripe/i,
    /placeholder_password/i,
  ];
  return PLACEHOLDER_PATTERNS.some((p) => p.test(val));
}

function validateDatabaseUrl(val: string): string | null {
  if (!val.startsWith("postgresql://") && !val.startsWith("postgres://")) {
    return "Must start with postgresql:// or postgres://";
  }
  if (isPlaceholder(val)) return "Contains placeholder value";
  return null;
}

function validateClerkKey(prefix: string) {
  return (val: string): string | null => {
    if (!val.startsWith(prefix)) return `Must start with '${prefix}'`;
    if (isPlaceholder(val)) return "Contains placeholder value";
    return null;
  };
}

function validateGeminiKey(val: string): string | null {
  if (val.length < 30) return "Too short to be a valid Gemini API key";
  if (isPlaceholder(val)) return "Contains placeholder value";
  return null;
}

function validateEncryptionKey(val: string): string | null {
  if (val.length < 32) return "ENCRYPTION_KEY must be at least 32 characters";
  if (isPlaceholder(val)) return "Contains placeholder value";
  return null;
}

function validateCronSecret(val: string): string | null {
  if (val.length < 16) return "CRON_SECRET should be at least 16 characters for security";
  if (isPlaceholder(val)) return "Contains placeholder value";
  return null;
}

// ─── Environment Variable Checks ─────────────────────────────────────────────

const ENV_CHECKS: EnvCheck[] = [
  // Database
  {
    key: "DATABASE_URL",
    required: true,
    description: "PostgreSQL connection string (pooled, Supavisor port 6543)",
    validate: validateDatabaseUrl,
  },
  {
    key: "DIRECT_URL",
    required: false,
    description: "Direct PostgreSQL URL (for Drizzle migrations, port 5432)",
    validate: validateDatabaseUrl,
  },

  // Authentication
  {
    key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    required: true,
    description: "Clerk publishable key",
    validate: (val) => {
      if (!val.startsWith("pk_test_") && !val.startsWith("pk_live_")) {
        return "Must start with pk_test_ or pk_live_";
      }
      if (isPlaceholder(val)) return "Contains placeholder value";
      return null;
    },
  },
  {
    key: "CLERK_SECRET_KEY",
    required: true,
    description: "Clerk secret key",
    validate: (val) => {
      if (!val.startsWith("sk_test_") && !val.startsWith("sk_live_")) {
        return "Must start with sk_test_ or sk_live_";
      }
      if (isPlaceholder(val)) return "Contains placeholder value";
      return null;
    },
  },
  {
    key: "CLERK_WEBHOOK_SECRET",
    required: true,
    description: "Clerk webhook signing secret",
    validate: (val) => {
      if (!val.startsWith("whsec_")) return "Must start with whsec_";
      if (isPlaceholder(val)) return "Contains placeholder value";
      return null;
    },
  },
  {
    key: "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
    required: true,
    description: "Sign-in URL path",
  },
  {
    key: "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
    required: true,
    description: "Sign-up URL path",
  },

  // AI Providers (at least one must be valid)
  {
    key: "GEMINI_API_KEY",
    required: false,
    description: "Google Gemini API key (recommended primary AI provider)",
    validate: validateGeminiKey,
  },
  {
    key: "OPENAI_API_KEY",
    required: false,
    description: "OpenAI API key (fallback AI provider)",
  },
  {
    key: "ANTHROPIC_API_KEY",
    required: false,
    description: "Anthropic Claude API key (fallback AI provider)",
  },
  {
    key: "AI_PROVIDER",
    required: true,
    description: "Default AI provider (gemini | openai | claude | deterministic)",
    validate: (val) => {
      const valid = ["gemini", "openai", "claude", "deterministic", "openrouter"];
      if (!valid.includes(val.toLowerCase())) {
        return `Must be one of: ${valid.join(", ")}`;
      }
      return null;
    },
  },

  // Security
  {
    key: "ENCRYPTION_KEY",
    required: true,
    description: "AES-256 encryption key for OAuth token storage (min 32 chars)",
    validate: validateEncryptionKey,
  },
  {
    key: "CRON_SECRET",
    required: true,
    description: "Secret for securing Vercel Cron endpoints (min 16 chars)",
    validate: validateCronSecret,
  },

  // Billing
  {
    key: "STRIPE_SECRET_KEY",
    required: false,
    description: "Stripe secret key (sk_test_ or sk_live_)",
  },
  {
    key: "STRIPE_WEBHOOK_SECRET",
    required: false,
    description: "Stripe webhook signing secret",
  },
  {
    key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    required: false,
    description: "Stripe publishable key",
  },

  // Instagram Providers
  {
    key: "INSTAGRAM_PROVIDER",
    required: false,
    description: "Instagram data provider (mock | apify | brightdata | rapidapi)",
  },

  // App Config
  {
    key: "NEXT_PUBLIC_APP_URL",
    required: true,
    description: "Public application URL",
    validate: (val) => {
      if (!val.startsWith("http://") && !val.startsWith("https://")) {
        return "Must start with http:// or https://";
      }
      return null;
    },
  },
];

// ─── Connectivity Checks ─────────────────────────────────────────────────────

async function checkDatabaseConnectivity(): Promise<CheckResult> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || isPlaceholder(dbUrl)) {
    return { key: "DATABASE_CONNECTIVITY", status: "SKIP", message: "Skipped (DATABASE_URL not configured)" };
  }

  try {
    const { db } = await import("../../src/lib/db");
    if (!db) {
      return { key: "DATABASE_CONNECTIVITY", status: "FAIL", message: "Database client not initialized" };
    }
    const { sql } = await import("drizzle-orm");
    await db.execute(sql`SELECT 1`);
    return { key: "DATABASE_CONNECTIVITY", status: "PASS", message: "Database connection successful" };
  } catch (error: any) {
    return { key: "DATABASE_CONNECTIVITY", status: "FAIL", message: `Connection failed: ${error.message}` };
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function runProductionPreFlight() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║   ReelForge AI — Production Pre-Flight Verification  ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  const results: CheckResult[] = [];
  let criticalFailures = 0;
  let warnings = 0;

  // ─── Environment Variable Checks ─────────────────────────────────────────
  console.log("━━━ Environment Variables ━━━\n");

  for (const check of ENV_CHECKS) {
    const val = process.env[check.key];

    if (!val || val.trim() === "") {
      if (check.required) {
        console.error(`  ❌ ${check.key} — MISSING (required)`);
        results.push({ key: check.key, status: "FAIL", message: "Missing required variable" });
        criticalFailures++;
      } else {
        console.warn(`  ⚠️  ${check.key} — not set (optional)`);
        results.push({ key: check.key, status: "WARN", message: "Optional variable not set" });
        warnings++;
      }
      continue;
    }

    if (isPlaceholder(val)) {
      if (check.required) {
        console.error(`  ❌ ${check.key} — PLACEHOLDER (still using example value)`);
        results.push({ key: check.key, status: "FAIL", message: "Contains placeholder value" });
        criticalFailures++;
      } else {
        console.warn(`  ⚠️  ${check.key} — placeholder (optional, but not configured)`);
        results.push({ key: check.key, status: "WARN", message: "Contains placeholder value" });
        warnings++;
      }
      continue;
    }

    if (check.validate) {
      const error = check.validate(val);
      if (error) {
        if (check.required) {
          console.error(`  ❌ ${check.key} — INVALID: ${error}`);
          results.push({ key: check.key, status: "FAIL", message: error });
          criticalFailures++;
        } else {
          console.warn(`  ⚠️  ${check.key} — ${error}`);
          results.push({ key: check.key, status: "WARN", message: error });
          warnings++;
        }
        continue;
      }
    }

    console.log(`  ✅ ${check.key} — OK`);
    results.push({ key: check.key, status: "PASS", message: "Configured" });
  }

  // ─── AI Provider Check (at least one must be configured) ─────────────────
  console.log("\n━━━ AI Provider Coverage ━━━\n");
  const aiKeys = ["GEMINI_API_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY"];
  const configuredAI = aiKeys.filter((k) => {
    const v = process.env[k];
    return v && v.trim() !== "" && !isPlaceholder(v);
  });

  if (configuredAI.length === 0) {
    const aiProvider = process.env.AI_PROVIDER?.toLowerCase();
    if (aiProvider && aiProvider !== "deterministic") {
      console.error(`  ❌ AI provider set to '${aiProvider}' but no AI API keys are configured`);
      criticalFailures++;
    } else {
      console.warn(`  ⚠️  No AI API keys configured (running in deterministic/mock mode only)`);
      warnings++;
    }
  } else {
    console.log(`  ✅ ${configuredAI.length} AI provider(s) configured: ${configuredAI.join(", ")}`);
  }

  // ─── Connectivity Checks ──────────────────────────────────────────────────
  console.log("\n━━━ Connectivity ━━━\n");
  const dbResult = await checkDatabaseConnectivity();
  if (dbResult.status === "PASS") {
    console.log(`  ✅ DATABASE_CONNECTIVITY — ${dbResult.message}`);
  } else if (dbResult.status === "FAIL") {
    console.error(`  ❌ DATABASE_CONNECTIVITY — ${dbResult.message}`);
    criticalFailures++;
  } else {
    console.log(`  ⏭️  DATABASE_CONNECTIVITY — ${dbResult.message}`);
  }

  // ─── Summary ──────────────────────────────────────────────────────────────
  const total = results.length;
  const passed = results.filter((r) => r.status === "PASS").length;

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║                   PRE-FLIGHT SUMMARY                ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log(`║  Checks Passed  : ${String(passed).padEnd(33)}║`);
  console.log(`║  Warnings       : ${String(warnings).padEnd(33)}║`);
  console.log(`║  Critical Fails : ${String(criticalFailures).padEnd(33)}║`);

  if (criticalFailures > 0) {
    console.log("╠══════════════════════════════════════════════════════╣");
    console.log("║  STATUS: ❌ DEPLOYMENT BLOCKED                       ║");
    console.log("║  Resolve all critical failures before deploying.     ║");
    console.log("╚══════════════════════════════════════════════════════╝\n");
    process.exit(1);
  } else if (warnings > 0) {
    console.log("╠══════════════════════════════════════════════════════╣");
    console.log("║  STATUS: ⚠️  DEPLOYMENT ALLOWED WITH WARNINGS        ║");
    console.log("║  Review warnings. Some features may be unavailable.  ║");
    console.log("╚══════════════════════════════════════════════════════╝\n");
    process.exit(2);
  } else {
    console.log("╠══════════════════════════════════════════════════════╣");
    console.log("║  STATUS: ✅ DEPLOYMENT APPROVED                      ║");
    console.log("║  All production configuration checks passed.         ║");
    console.log("╚══════════════════════════════════════════════════════╝\n");
    process.exit(0);
  }
}

runProductionPreFlight();
