/**
 * ReelForge AI Lightweight Analytics Instrumentation.
 * Intentionally minimal: uses existing GA4 script, zero extra bundle weight.
 * Does not send PII, email, or free-text answers.
 */

export function trackGAEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === "function") {
    (window as unknown as { gtag: (command: string, action: string, params?: Record<string, unknown>) => void }).gtag(
      "event",
      eventName,
      params
    );
  }
}

export function trackOnboardingStart() {
  trackGAEvent("onboarding_start", { step: 1 });
}

export function trackOnboardingStep(step: number, questionId: string) {
  trackGAEvent("onboarding_step_complete", {
    step,
    question_id: questionId,
  });
}

export function trackOnboardingComplete() {
  trackGAEvent("onboarding_complete", {
    completed_all: true,
  });
}

export function trackOnboardingSkip(step: number) {
  trackGAEvent("onboarding_skip", {
    skipped_at_step: step,
  });
}
