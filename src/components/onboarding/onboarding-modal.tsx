"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useAuthContext } from "@/lib/auth/user-context";
import { getLocalOnboardingState, isUserOnboarded } from "@/lib/onboarding/persistence";
import { OnboardingWizard } from "./onboarding-wizard";
import { motion, AnimatePresence } from "framer-motion";

export function OnboardingModal() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuthContext();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [hasChecked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    // Do not trigger on auth routes or dedicated onboarding page
    if (
      pathname?.startsWith("/sign-in") ||
      pathname?.startsWith("/sign-up") ||
      pathname === "/onboarding"
    ) {
      setIsOpen(false);
      return;
    }

    if (isSignedIn) {
      const localState = getLocalOnboardingState();
      const onboarded = isUserOnboarded(localState, user?.unsafeMetadata as Record<string, unknown>);
      if (!onboarded) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
    setChecked(true);
  }, [isLoaded, isSignedIn, user, pathname]);

  if (!hasChecked || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-xl"
          >
            <OnboardingWizard
              isModal
              onDismiss={() => setIsOpen(false)}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
