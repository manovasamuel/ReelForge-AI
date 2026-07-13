/**
 * Authentication Configuration & Offline Mode Detector.
 * Ensures that production environments NEVER fall back to placeholder development identities,
 * while keeping offline development mode available when explicitly configured or during local dev/tests.
 */
export function isOfflineDevMode(): boolean {
  // 1. Production Safety Guarantee: Never allow offline/placeholder dev identity in production
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    return false;
  }

  // 2. Explicit Feature Flag Override
  const authMode = process.env.NEXT_PUBLIC_AUTH_MODE || process.env.AUTH_MODE;
  if (authMode === "offline" || authMode === "placeholder") {
    return true;
  }
  if (authMode === "clerk" || authMode === "live") {
    return false;
  }

  // 3. Development Fallback: If in dev mode and keys are missing/placeholder, allow offline mode
  const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return !pubKey || pubKey.includes("placeholder");
}
