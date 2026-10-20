import { OnboardingState } from "./types";

const STORAGE_KEY = "reelforge_onboarding_state";

export function getLocalOnboardingState(): OnboardingState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return null;
  }
}

export function setLocalOnboardingState(state: OnboardingState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Gracefully handle storage quotas or private browsing modes
  }
}

export function isUserOnboarded(
  localState: OnboardingState | null,
  clerkMetadata?: Record<string, unknown>
): boolean {
  if (localState?.completed || localState?.skipped) {
    return true;
  }
  if (
    clerkMetadata?.onboardingCompleted === true ||
    clerkMetadata?.onboardingSkipped === true
  ) {
    return true;
  }
  return false;
}

export async function persistOnboardingState(
  state: OnboardingState,
  clerkUser?: {
    unsafeMetadata?: Record<string, unknown>;
    update?: (params: { unsafeMetadata: Record<string, unknown> }) => Promise<unknown>;
  } | null
): Promise<void> {
  // 1. Immediately cache locally for instant UI responsiveness
  setLocalOnboardingState(state);

  // 2. Persist to Clerk user unsafeMetadata if user object supports it
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

  // 3. Best-effort backend sync to existing preferences mechanism without requiring migrations
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
