"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
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

export function OnboardingWizard({
  onDismiss,
  redirectTo = "/dashboard",
  isModal = false,
}: OnboardingWizardProps) {
  const router = useRouter();
  const { user } = useUser();
  const prefersReducedMotion = useReducedMotion();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = ONBOARDING_QUESTIONS.length;
  const currentQuestion = ONBOARDING_QUESTIONS[currentStepIndex];
  const selectedOption = currentQuestion ? answers[currentQuestion.id] : undefined;

  // Track start of onboarding on mount
  useEffect(() => {
    trackOnboardingStart();
  }, []);

  const handleSelectOption = useCallback(
    (option: string) => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: option,
      }));
    },
    [currentQuestion]
  );

  const handleContinue = useCallback(async () => {
    if (!selectedOption && !isCompleted) return;

    // Track step completion
    trackOnboardingStep(currentStepIndex + 1, currentQuestion.id);

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Reached completion
      setIsSubmitting(true);
      const state: OnboardingState = {
        completed: true,
        skipped: false,
        answers,
        completedAt: new Date().toISOString(),
      };

      await persistOnboardingState(state, user);
      trackOnboardingComplete();
      setIsSubmitting(false);
      setIsCompleted(true);
    }
  }, [currentStepIndex, totalSteps, selectedOption, isCompleted, currentQuestion, answers, user]);

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0 && !isCompleted) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex, isCompleted]);

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
      router.push(redirectTo);
    }
  }, [currentStepIndex, answers, user, onDismiss, router, redirectTo]);

  const handleFinish = useCallback(() => {
    if (onDismiss) {
      onDismiss();
    } else {
      router.push(redirectTo);
    }
  }, [onDismiss, router, redirectTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleFinish();
        }
        return;
      }

      // Escape to skip/dismiss
      if (e.key === "Escape") {
        e.preventDefault();
        handleSkip();
        return;
      }

      // Enter to continue if option selected
      if (e.key === "Enter" && selectedOption) {
        e.preventDefault();
        handleContinue();
        return;
      }

      // Digit keys 1-5 to select option
      if (currentQuestion && ["1", "2", "3", "4", "5"].includes(e.key)) {
        const optionIdx = parseInt(e.key, 10) - 1;
        if (optionIdx >= 0 && optionIdx < currentQuestion.options.length) {
          e.preventDefault();
          handleSelectOption(currentQuestion.options[optionIdx]);
        }
      }

      // Arrow keys to cycle options
      if (currentQuestion && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        const opts = currentQuestion.options;
        const currentIdx = selectedOption ? opts.indexOf(selectedOption) : -1;
        if (e.key === "ArrowDown") {
          const nextIdx = currentIdx < opts.length - 1 ? currentIdx + 1 : 0;
          handleSelectOption(opts[nextIdx]);
        } else {
          const prevIdx = currentIdx > 0 ? currentIdx - 1 : opts.length - 1;
          handleSelectOption(opts[prevIdx]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCompleted, currentQuestion, selectedOption, handleContinue, handleFinish, handleSelectOption, handleSkip]);

  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;

  const motionVariants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, x: 12 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -12 },
      };

  return (
    <div
      className={`relative w-full max-w-xl mx-auto bg-card border border-border text-foreground shadow-2xl rounded-none p-6 sm:p-8 flex flex-col justify-between ${
        isModal ? "max-h-[90vh] overflow-y-auto" : ""
      }`}
      role="region"
      aria-label="Onboarding Wizard"
    >
      {/* Dismiss button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-none focus:outline-hidden focus:ring-1 focus:ring-ring"
        aria-label="Skip onboarding"
        title="Skip onboarding"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Completion Screen */}
      {isCompleted ? (
        <div className="py-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-none bg-muted border border-border flex items-center justify-center mb-6 text-foreground">
            <Sparkles className="w-7 h-7" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
            You&apos;re all set.
          </h2>
          <p className="text-muted-foreground text-base max-w-md mb-8 leading-relaxed">
            Let&apos;s make your next piece of content smarter.
          </p>

          <Button
            onClick={handleFinish}
            size="lg"
            className="w-full sm:w-auto px-8 h-12 bg-foreground text-background font-semibold text-base rounded-none hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group"
          >
            <span>Open ReelForge AI</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      ) : (
        <>
          {/* Header & Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Personalize your experience
              </span>
              <span>
                Step {currentStepIndex + 1} of {totalSteps}
              </span>
            </div>

            {/* Restrained minimal progress bar */}
            <div className="w-full h-1 bg-muted rounded-none overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question & Option Cards */}
          <div className="min-h-[280px] flex flex-col justify-start">
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div
                  key={currentQuestion.id}
                  variants={motionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4"
                >
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug mb-5">
                    {currentQuestion.title}
                  </h3>

                  <div className="space-y-2.5">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = selectedOption === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSelectOption(option)}
                          className={`w-full text-left p-3.5 sm:p-4 rounded-none border transition-all duration-150 flex items-center justify-between group focus:outline-hidden focus:ring-1 focus:ring-ring ${
                            isSelected
                              ? "border-foreground bg-muted ring-1 ring-foreground/20 text-foreground"
                              : "border-border bg-card/60 hover:border-foreground/40 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-5 h-5 rounded-none border flex items-center justify-center transition-colors text-xs ${
                                isSelected
                                  ? "border-foreground bg-foreground text-background"
                                  : "border-border text-muted-foreground group-hover:border-foreground/50"
                              }`}
                            >
                              {isSelected ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : idx + 1}
                            </span>
                            <span className="text-sm sm:text-base font-medium">
                              {option}
                            </span>
                          </div>

                          <span className="hidden sm:inline-block text-[10px] text-muted-foreground/60 font-mono uppercase">
                            Key {idx + 1}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Wizard Controls */}
          <div className="mt-8 pt-4 border-t border-border flex items-center justify-between gap-3">
            <div>
              {currentStepIndex > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="rounded-none border-border text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-semibold px-3 h-9"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="rounded-none text-muted-foreground hover:text-foreground text-xs font-semibold px-2 h-9"
                >
                  Skip
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="rounded-none text-muted-foreground hover:text-foreground text-xs font-semibold px-3 h-9"
                >
                  Skip
                </Button>
              )}

              <Button
                variant="default"
                size="sm"
                disabled={!selectedOption || isSubmitting}
                onClick={handleContinue}
                className="rounded-none bg-foreground text-background hover:opacity-90 font-semibold text-xs px-5 h-9 flex items-center gap-1.5 transition-all shadow-none"
              >
                <span>
                  {currentStepIndex === totalSteps - 1 ? "Complete" : "Continue"}
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
