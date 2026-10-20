"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, X, ArrowRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ONBOARDING_QUESTIONS, OnboardingAnswers, OnboardingState } from "@/lib/onboarding/types";
import { persistOnboardingState } from "@/lib/onboarding/persistence";
import {
  trackOnboardingStart,
  trackOnboardingStep,
  trackOnboardingComplete,
  trackOnboardingSkip,
} from "@/lib/analytics/events";

interface OnboardingWizardProps {
  onDismiss?: () => void;
  redirectTo?: string;
  isModal?: boolean;
}

// Direction-aware slide variants for premium step transitions
function makeSlideVariants(direction: 1 | -1, reduced: boolean) {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return {
    initial: { opacity: 0, x: direction * 32 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: direction * -24 },
  };
}

// Per-step subtitle copy — concise supporting sentence under each question
const STEP_SUBTITLES: Record<string, string> = {
  intent: "Select the outcome that matters most to you right now.",
  persona: "Help us tailor your workspace to your specific context.",
  primary_platform: "We'll prioritise insights and formats for your main channel.",
  experience_level: "Your level helps us calibrate suggestions and complexity.",
};

export function OnboardingWizard({
  onDismiss,
  redirectTo = "/onboarding/complete",
  isModal = false,
}: OnboardingWizardProps) {
  const router = useRouter();
  const { user } = useUser();
  const prefersReducedMotion = useReducedMotion();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hasTrackedStart = useRef(false);

  const totalSteps = ONBOARDING_QUESTIONS.length;
  const currentQuestion = ONBOARDING_QUESTIONS[currentStepIndex];
  const selectedOption = currentQuestion ? answers[currentQuestion.id] : undefined;
  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;
  const stepLabel = String(currentStepIndex + 1).padStart(2, "0");
  const totalLabel = String(totalSteps).padStart(2, "0");

  // Track start once — only when wizard is genuinely shown
  useEffect(() => {
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      trackOnboardingStart();
    }
  }, []);

  const handleSelectOption = useCallback(
    (option: string) => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
    },
    [currentQuestion]
  );

  const handleContinue = useCallback(async () => {
    if (!selectedOption) return;
    setSubmitError(null);

    // Track step
    trackOnboardingStep(currentStepIndex + 1, currentQuestion.id);

    if (currentStepIndex < totalSteps - 1) {
      setDirection(1);
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Final step — persist then navigate
      setIsSubmitting(true);
      const state: OnboardingState = {
        completed: true,
        skipped: false,
        answers,
        completedAt: new Date().toISOString(),
      };

      try {
        await persistOnboardingState(state, user);
        trackOnboardingComplete();
        // Navigate to dedicated completion page
        if (onDismiss) {
          // In modal mode, store completion flag and dismiss; page handles routing
          onDismiss();
          router.push(redirectTo);
        } else {
          router.push(redirectTo);
        }
      } catch {
        setSubmitError("Something went wrong saving your preferences. Please try again.");
        setIsSubmitting(false);
      }
    }
  }, [
    currentStepIndex,
    totalSteps,
    selectedOption,
    currentQuestion,
    answers,
    user,
    onDismiss,
    router,
    redirectTo,
  ]);

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setSubmitError(null);
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const handleSkip = useCallback(async () => {
    trackOnboardingSkip(currentStepIndex + 1);
    const state: OnboardingState = {
      completed: false,
      skipped: true,
      answers,
      completedAt: new Date().toISOString(),
    };
    await persistOnboardingState(state, user);
    if (onDismiss) {
      onDismiss();
    } else {
      router.push("/dashboard");
    }
  }, [currentStepIndex, answers, user, onDismiss, router]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting) return;

      if (e.key === "Escape") {
        e.preventDefault();
        handleSkip();
        return;
      }
      if (e.key === "Enter" && selectedOption) {
        e.preventDefault();
        handleContinue();
        return;
      }
      if (currentQuestion && ["1", "2", "3", "4", "5"].includes(e.key)) {
        const optionIdx = parseInt(e.key, 10) - 1;
        if (optionIdx >= 0 && optionIdx < currentQuestion.options.length) {
          e.preventDefault();
          handleSelectOption(currentQuestion.options[optionIdx]);
        }
      }
      if (currentQuestion && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        const opts = currentQuestion.options;
        const currentIdx = selectedOption ? opts.indexOf(selectedOption) : -1;
        if (e.key === "ArrowDown") {
          handleSelectOption(opts[currentIdx < opts.length - 1 ? currentIdx + 1 : 0]);
        } else {
          handleSelectOption(opts[currentIdx > 0 ? currentIdx - 1 : opts.length - 1]);
        }
      }
      if (e.key === "ArrowLeft" && currentStepIndex > 0) {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isSubmitting,
    currentQuestion,
    currentStepIndex,
    selectedOption,
    handleContinue,
    handleSelectOption,
    handleSkip,
    handleBack,
  ]);

  const slideVariants = makeSlideVariants(direction, !!prefersReducedMotion);

  return (
    <div
      className={cn(
        "relative w-full bg-card text-foreground flex flex-col",
        isModal
          ? "max-h-[92vh] overflow-y-auto border border-border shadow-2xl"
          : "min-h-screen border-0"
      )}
      role="region"
      aria-label="Onboarding Wizard"
    >
      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-6 sm:px-10 pt-6 pb-4 border-b border-border/60 shrink-0">
        {/* Brand */}
        <Logo iconClassName="h-5 w-5" textClassName="text-sm" badgeClassName="text-[9px]" />

        {/* Step Counter */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-[11px] text-muted-foreground font-mono tracking-widest uppercase">
            {stepLabel} / {totalLabel}
          </span>
          {/* Close / Skip (top-right, clearly positioned) */}
          <button
            onClick={handleSkip}
            className={cn(
              "flex items-center justify-center w-8 h-8",
              "text-muted-foreground hover:text-foreground",
              "border border-transparent hover:border-border",
              "transition-all duration-150 rounded-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-label="Skip onboarding and close"
            title="Skip onboarding"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="w-full h-[2px] bg-border shrink-0" aria-hidden="true">
        <motion.div
          className="h-full bg-foreground"
          initial={false}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className={cn(
        "flex-1 flex flex-col",
        "px-6 sm:px-10 lg:px-16",
        "pt-8 sm:pt-12 pb-8"
      )}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion?.id ?? "step"}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6 sm:gap-8 w-full max-w-2xl mx-auto"
          >
            {/* Question Header */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                Personalize your experience
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight mb-0">
                {currentQuestion?.title}
              </h2>
              {currentQuestion && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {STEP_SUBTITLES[currentQuestion.id]}
                </p>
              )}
            </div>

            {/* Option Cards */}
            <div
              className={cn(
                "grid gap-2.5",
                currentQuestion?.options.length === 3
                  ? "grid-cols-1 sm:grid-cols-3"
                  : "grid-cols-1"
              )}
              role="radiogroup"
              aria-label={currentQuestion?.title}
            >
              {currentQuestion?.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                return (
                  <motion.button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectOption(option)}
                    initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: prefersReducedMotion ? 0 : idx * 0.05,
                      duration: 0.22,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={cn(
                      // Base layout
                      "group relative w-full text-left",
                      "flex items-start sm:items-center gap-4",
                      "px-5 py-4 sm:py-5",
                      // Borders & surfaces
                      "border transition-all duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                      // State-based styles
                      isSelected
                        ? [
                            "border-foreground bg-foreground/[0.06]",
                            "shadow-[inset_0_0_0_1px_hsl(var(--foreground)/0.12)]",
                          ]
                        : [
                            "border-border bg-card",
                            "hover:border-foreground/30 hover:bg-muted/30",
                          ]
                    )}
                  >
                    {/* Selection indicator */}
                    <span
                      className={cn(
                        "shrink-0 flex items-center justify-center",
                        "w-6 h-6 border text-xs font-mono transition-all duration-150",
                        isSelected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground group-hover:border-foreground/40"
                      )}
                      aria-hidden="true"
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      ) : (
                        idx + 1
                      )}
                    </span>

                    {/* Option label */}
                    <div className="flex-1 min-w-0">
                      <span
                        className={cn(
                          "block text-sm sm:text-base font-medium leading-snug",
                          isSelected ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                        )}
                      >
                        {option}
                      </span>
                    </div>

                    {/* Selected chevron */}
                    {isSelected && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="shrink-0 text-foreground"
                        aria-hidden="true"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Error Message */}
        {submitError && (
          <p
            role="alert"
            className="mt-4 text-sm text-destructive text-center max-w-2xl mx-auto"
          >
            {submitError}
          </p>
        )}
      </div>

      {/* ── NAVIGATION FOOTER ── */}
      <div className="px-6 sm:px-10 lg:px-16 py-5 border-t border-border/60 shrink-0">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Back or Skip */}
          <div>
            {currentStepIndex > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={isSubmitting}
                className="h-10 px-4 gap-1.5 text-muted-foreground hover:text-foreground rounded-none font-medium text-xs sm:text-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="h-10 px-4 text-muted-foreground hover:text-foreground rounded-none font-medium text-xs sm:text-sm"
              >
                Skip setup
              </Button>
            )}
          </div>

          {/* Right: Skip (steps 2+) + Continue / Complete */}
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="h-10 px-4 text-muted-foreground hover:text-foreground rounded-none font-medium text-xs sm:text-sm"
              >
                Skip
              </Button>
            )}

            <Button
              size="sm"
              disabled={!selectedOption || isSubmitting}
              onClick={handleContinue}
              className={cn(
                "h-10 px-6 gap-2 rounded-none font-semibold text-sm",
                "bg-foreground text-background hover:opacity-90 transition-opacity",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                "shadow-none"
              )}
            >
              {isSubmitting ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="block w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full"
                    aria-hidden="true"
                  />
                  Saving…
                </>
              ) : currentStepIndex === totalSteps - 1 ? (
                <>
                  Finish setup
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
