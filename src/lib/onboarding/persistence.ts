import { OnboardingState } from "./types";

const STORAGE_KEY_PREFIX = "reelforge_onboarding_v2_";

/**
 * Returns the per-user localStorage key.
 * Falls back to a legacy key for unauthenticated (public /onboarding) access.
 */
function getStorageKey(userId?: string | null): string {
  return userId ? `${STORAGE_KEY_PREFIX}${userId}` : `${STORAGE_KEY_PREFIX}anon`;
}

export function getLocalOnboardingState(userId?: string | null): OnboardingState | null {
  if (typeof window === "undefined") return null;
  try {
    // Try per-user key first
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as OnboardingState;

    // Fall back to legacy shared key (for users who completed before this fix)
    if (userId) {
      const legacy = localStorage.getItem("reelforge_onboarding_state");
      if (legacy) {
        const parsed = JSON.parse(legacy) as OnboardingState;
        // Migrate: write to per-user key and remove legacy if found
        localStorage.setItem(key, JSON.stringify(parsed));
        return parsed;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function setLocalOnboardingState(state: OnboardingState, userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
  } catch {
    // Gracefully handle storage quotas or private browsing modes
  }
}

export function clearLocalOnboardingState(userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getStorageKey(userId));
  } catch {
    // no-op
  }
}

/**
 * Determine if a specific user has completed or skipped onboarding.
 * Priority: Clerk unsafeMetadata (cross-device) > localStorage (fast-path cache).
 */
export function isUserOnboarded(
  localState: OnboardingState | null,
  clerkMetadata?: Record<string, unknown>
): boolean {
  // Clerk metadata is the source of truth for cross-device persistence
  if (
    clerkMetadata?.onboardingCompleted === true ||
    clerkMetadata?.onboardingSkipped === true
  ) {
    return true;
  }
  // localStorage is a fast-path cache (same device/browser)
  if (localState?.completed || localState?.skipped) {
    return true;
  }
  return false;
}

export async function persistOnboardingState(
  state: OnboardingState,
  clerkUser?: {
    id?: string;
    unsafeMetadata?: Record<string, unknown>;
    update?: (params: { unsafeMetadata: Record<string, unknown> }) => Promise<unknown>;
  } | null
): Promise<void> {
  const userId = clerkUser?.id ?? null;

  // 1. Immediately cache locally (per-user key) for instant UI responsiveness
  setLocalOnboardingState(state, userId);

  // 2. Persist to Clerk user unsafeMetadata (cross-device source of truth)
  if (clerkUser && typeof clerkUser.update === "function") {
    try {
      await clerkUser.update({
        unsafeMetadata: {
          ...(clerkUser.unsafeMetadata || {}),
          onboardingCompleted: state.completed,
          onboardingSkipped: state.skipped,
          onboardingAnswers: state.answers,
          onboardedAt: state.completedAt || new Date().toISOString(),
        },
      });
    } catch (err) {
      console.warn("[onboarding] Clerk metadata sync error (non-fatal):", err);
    }
  }

  // 3. Best-effort backend sync without requiring schema migrations
  try {
    await fetch("/api/user/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
  } catch {
    // Network errors are non-fatal to onboarding flow
  }
}
