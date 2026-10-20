import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Personalize Your Experience | ReelForge AI",
  description: "Set up your ReelForge AI workspace and preferences.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Logo textClassName="text-xl" />
        </Link>
        <p className="text-xs text-muted-foreground mt-1.5 uppercase tracking-wider font-medium">
          Workspace Setup
        </p>
      </div>

      {/* Main Wizard */}
      <div className="w-full max-w-xl">
        <OnboardingWizard redirectTo="/dashboard" />
      </div>

      {/* Footer */}
      <div className="mt-8 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} ReelForge AI. Content Intelligence Platform.
      </div>
    </div>
  );
}
