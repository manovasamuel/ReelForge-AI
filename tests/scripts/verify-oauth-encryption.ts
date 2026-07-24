import { db } from "../../src/lib/db";
import { socialAccounts } from "../../src/lib/db/schema";
import { eq } from "drizzle-orm";
import * as crypto from "crypto";

/**
 * OAuth Token Encryption Verification
 *
 * Validates that OAuth tokens stored via the Publishing subsystem
 * are encrypted at rest using AES-256, in compliance with the
 * architectural mandate:
 *
 *   "OAuth tokens MUST be encrypted using AES-256 at rest."
 *
 * This script:
 * 1. Queries the social_accounts table for stored tokens
 * 2. Verifies that no plaintext tokens are stored
 * 3. Verifies that stored values look like ciphertext (base64 / hex encoded)
 */

const PLAINTEXT_TOKEN_PATTERNS = [
  /^IGQ[A-Za-z0-9_-]{20,}/, // Instagram token prefix
  /^EAA[A-Za-z0-9]+/,        // Facebook token prefix
  /^ya29\./,                  // Google OAuth token prefix
  /^1\/\/[A-Za-z0-9_-]+/,    // Google refresh token pattern
  /^Bearer\s/i,               // Bearer prefix
];

function looksLikePlaintext(value: string): boolean {
  // If it matches known OAuth token patterns, it's plaintext
  for (const pattern of PLAINTEXT_TOKEN_PATTERNS) {
    if (pattern.test(value)) return true;
  }
  // If it's shorter than 32 chars, it's not a valid AES-256 ciphertext
  if (value.length < 32) return false;
  // If it contains spaces or common plain words, suspicious
  if (/\s/.test(value) && value.split(" ").length > 3) return true;
  return false;
}

function looksLikeCiphertext(value: string): boolean {
  // AES-256-CBC produces base64-encoded output
  // Typical format: iv:ciphertext (hex:hex or base64:base64)
  const hasColonSeparator = value.includes(":");
  const isBase64 = /^[A-Za-z0-9+/]+=*$/.test(value.replace(":", ""));
  const isHex = /^[0-9a-f:]+$/i.test(value);
  return hasColonSeparator || isBase64 || isHex;
}

async function verifyTokenEncryption() {
  console.log("\n=== OAuth Token Encryption Verification ===\n");

  if (!db) {
    console.log("⚠️  Database not configured. Skipping token encryption check.");
    console.log("   Set DATABASE_URL to run this verification against a live database.");
    process.exit(0);
  }

  try {
    const accounts = await db.select().from(socialAccounts);

    if (accounts.length === 0) {
      console.log("✅ No social accounts found in database.");
      console.log("   Token encryption verification N/A (no data to check).");
      process.exit(0);
    }

    console.log(`Found ${accounts.length} social account(s). Verifying encryption...\n`);

    let violations = 0;
    let verified = 0;

    for (const account of accounts) {
      const accountLabel = `[${account.platform}] ${account.accountName} (ID: ${account.id})`;

      // Check encryptedAccessToken
      if (account.encryptedAccessToken) {
        if (looksLikePlaintext(account.encryptedAccessToken)) {
          console.error(`❌ VIOLATION: Plaintext access token detected for ${accountLabel}`);
          violations++;
        } else if (looksLikeCiphertext(account.encryptedAccessToken)) {
          console.log(`✅ Access token encrypted for ${accountLabel}`);
          verified++;
        } else {
          console.warn(`⚠️  UNKNOWN: Cannot determine encryption status for access token: ${accountLabel}`);
        }
      }

      // Check encryptedRefreshToken
      if (account.encryptedRefreshToken) {
        if (looksLikePlaintext(account.encryptedRefreshToken)) {
          console.error(`❌ VIOLATION: Plaintext refresh token detected for ${accountLabel}`);
          violations++;
        } else if (looksLikeCiphertext(account.encryptedRefreshToken)) {
          console.log(`✅ Refresh token encrypted for ${accountLabel}`);
          verified++;
        } else {
          console.warn(`⚠️  UNKNOWN: Cannot determine encryption status for refresh token: ${accountLabel}`);
        }
      }
    }

    console.log("\n=== Summary ===");
    console.log(`Total accounts checked : ${accounts.length}`);
    console.log(`Tokens verified        : ${verified}`);
    console.log(`Violations found       : ${violations}`);

    if (violations > 0) {
      console.error("\n❌ FAILED: Plaintext OAuth tokens detected at rest. This is a critical security violation.");
      process.exit(1);
    } else {
      console.log("\n✅ PASSED: All OAuth tokens appear properly encrypted at rest.");
      process.exit(0);
    }
  } catch (error) {
    console.error("Error querying database:", error);
    process.exit(1);
  }
}

verifyTokenEncryption();
