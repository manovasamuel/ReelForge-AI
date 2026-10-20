/**
 * ReelForge AI Lightweight Analytics Instrumentation.
 *
 * Event Naming Convention:
 *   onboarding_start          — Fired once when a new onboarding journey actually starts.
 *   onboarding_step_complete  — Fired per-step (step number, question_id). No PII.
 *   onboarding_complete       — Fired only after answers have been successfully saved.
 *   onboarding_skip           — Fired when user dismisses onboarding without completing.
 *   page_view                 — Fired for key SPA route views (e.g. /onboarding/complete).
 *
 * PII Policy: Do NOT send email addresses, names, Clerk IDs, raw answers or
 *             any personally identifiable information to GA4 or Meta.
 *
 * These events are suitable for later configuration as milestones/conversions
 * in GA4, Google Ads, and Meta Events Manager. Do not label them as purchases
 * or qualified leads until explicitly configured.
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

/**
 * Track a significant page view (e.g. /onboarding/complete).
 * Use for pages not automatically picked up by the GA4 base script.
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  trackGAEvent("page_view", {
    page_path: pagePath,
    ...(pageTitle ? { page_title: pageTitle } : {}),
  });
}
