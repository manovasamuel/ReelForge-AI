import React from "react";
import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Set up your workspace | ReelForge AI",
  description: "Personalize your ReelForge AI workspace to match your content goals.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background">
      <OnboardingWizard redirectTo="/onboarding/complete" />
    </div>
  );
}
