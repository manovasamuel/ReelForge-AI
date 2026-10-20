"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Logo } from "@/components/ui/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getLocalOnboardingState } from "@/lib/onboarding/persistence";
import { trackPageView } from "@/lib/analytics/events";

export default function OnboardingCompletePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const hasTracked = useRef(false);

  // Track completion page view once
  useEffect(() => {
    if (!hasTracked.current) {
      hasTracked.current = true;
      trackPageView("/onboarding/complete", "ReelForge AI — You're all set");
    }
  }, []);

  // Guard: if the user loads and has NOT actually completed, redirect them
  // to start onboarding properly. Prevents bookmark-skip of the completion page.
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) return; // still loading

    const state = getLocalOnboardingState(user.id);
    const meta = user.unsafeMetadata as Record<string, unknown> | undefined;
    const hasCompleted =
      state?.completed ||
      meta?.onboardingCompleted === true;

    if (!hasCompleted) {
      router.replace("/onboarding");
    }
  }, [isLoaded, user, router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-6 sm:px-10 pt-6 pb-4 border-b border-border/60">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo iconClassName="h-5 w-5" textClassName="text-sm" badgeClassName="text-[9px]" />
        </Link>
      </div>

      {/* ── FULL-HEIGHT CENTER ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg text-center flex flex-col items-center gap-6"
        >
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            ReelForge AI
          </motion.p>

          {/* Checkmark / completion mark */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-16 h-16 border border-border bg-muted/40 flex items-center justify-center"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7 text-foreground"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="space-y-3"
          >
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight mb-0">
              You&apos;re all set.
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Thanks for telling us about your content goals. ReelForge AI is ready to help
              you turn content intelligence into your next creative move.
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto"
          >
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full sm:w-auto h-11 px-8 rounded-none bg-foreground text-background hover:opacity-90 font-semibold text-sm gap-2 shadow-none"
              )}
            >
              Explore ReelForge AI
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto h-11 px-8 rounded-none font-medium text-sm gap-2"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to dashboard
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ── FOOTER ── */}
      <div className="px-6 sm:px-10 py-5 border-t border-border/40">
        <p className="text-[11px] text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} ReelForge AI. Content Intelligence Platform.
        </p>
      </div>
    </div>
  );
}
