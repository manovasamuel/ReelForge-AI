"use client";

import { useState } from "react";
import { PageContainer, PageHeader } from "@/components/layout";
import {
  ProfileUrlInput,
  ProfileCard,
  ProfileSkeleton,
  ProfileError,
} from "@/components/profiles";
import {
  BrandIntelligenceCard,
  BrandIntelligenceSkeleton,
} from "@/components/brand-intelligence";
import type { InstagramProfile } from "@/types/instagram";
import type { BrandIntelligenceReport } from "@/types/brand-intelligence";

// ─── State machine types ───────────────────────────────────────────
type AnalysisState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; profile: InstagramProfile }
  | { status: "error"; message: string };

type BrandIntelligenceState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; report: BrandIntelligenceReport }
  | { status: "error"; message: string };

// ─── Page ──────────────────────────────────────────────────────────
export default function ProfilesPage() {
  const [state, setState] = useState<AnalysisState>({ status: "idle" });
  const [brandState, setBrandState] = useState<BrandIntelligenceState>({ status: "idle" });

  async function handleAnalyze(url: string) {
    setState({ status: "loading" });
    setBrandState({ status: "idle" });

    try {
      const response = await fetch("/api/profiles/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instagramUrl: url }),
      });

      const json = await response.json();

      if (!response.ok || json.error) {
        setState({
          status: "error",
          message:
            json.error?.message ?? "Something went wrong. Please try again.",
        });
        return;
      }

      const profile = json.data as InstagramProfile;
      setState({ status: "success", profile });

      // Automatically trigger Brand Intelligence analysis (Phase 2)
      await fetchBrandIntelligence(profile);
    } catch {
      setState({
        status: "error",
        message: "Network error. Check your connection and try again.",
      });
    }
  }

  async function fetchBrandIntelligence(profile: InstagramProfile) {
    setBrandState({ status: "loading" });
    try {
      const response = await fetch("/api/brand-intelligence/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const json = await response.json();

      if (!response.ok || json.error) {
        setBrandState({
          status: "error",
          message: json.error?.message ?? "Could not analyze brand intelligence.",
        });
        return;
      }

      setBrandState({ status: "success", report: json.data });
    } catch {
      setBrandState({
        status: "error",
        message: "Network error loading brand intelligence.",
      });
    }
  }

  function handleRetry() {
    setState({ status: "idle" });
    setBrandState({ status: "idle" });
  }

  function handleInputChange() {
    if (state.status === "success" || state.status === "error") {
      setState({ status: "idle" });
      setBrandState({ status: "idle" });
    }
  }

  const isLoading = state.status === "loading";

  return (
    <PageContainer>
      <PageHeader
        title="Instagram Profile Analysis"
        description="Paste an Instagram profile URL to extract and analyze their content strategy."
      />

      {/* URL Input — always visible */}
      <div className="mb-8">
        <ProfileUrlInput
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          onInputChange={handleInputChange}
        />
      </div>

      {/* State-driven output */}
      {state.status === "loading" && <ProfileSkeleton />}

      {state.status === "error" && (
        <ProfileError message={state.message} onRetry={handleRetry} />
      )}

      {state.status === "success" && (
        <div className="space-y-8">
          <ProfileCard profile={state.profile} />

          {/* Brand Intelligence Section (Phase 2) */}
          {brandState.status === "loading" && <BrandIntelligenceSkeleton />}

          {brandState.status === "success" && (
            <BrandIntelligenceCard report={brandState.report} />
          )}

          {brandState.status === "error" && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
              {brandState.message}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
