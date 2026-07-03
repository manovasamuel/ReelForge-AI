"use client";

import { useState } from "react";
import { PageContainer, PageHeader } from "@/components/layout";
import {
  ProfileUrlInput,
  ProfileCard,
  ProfileSkeleton,
  ProfileError,
} from "@/components/profiles";
import type { InstagramProfile } from "@/types/instagram";

// ─── State machine types ───────────────────────────────────────────
type AnalysisState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; profile: InstagramProfile }
  | { status: "error"; message: string };

// ─── Page ──────────────────────────────────────────────────────────
export default function ProfilesPage() {
  const [state, setState] = useState<AnalysisState>({ status: "idle" });

  async function handleAnalyze(url: string) {
    setState({ status: "loading" });

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

      setState({ status: "success", profile: json.data });
    } catch {
      setState({
        status: "error",
        message: "Network error. Check your connection and try again.",
      });
    }
  }

  function handleRetry() {
    setState({ status: "idle" });
  }

  const isLoading = state.status === "loading";

  return (
    <PageContainer>
      <PageHeader
        title="Profile Analysis"
        description="Paste an Instagram profile URL to extract and analyze their content strategy."
      />

      {/* URL Input — always visible */}
      <div className="mb-8">
        <ProfileUrlInput onAnalyze={handleAnalyze} isLoading={isLoading} />
      </div>

      {/* State-driven output */}
      {state.status === "loading" && <ProfileSkeleton />}

      {state.status === "error" && (
        <ProfileError message={state.message} onRetry={handleRetry} />
      )}

      {state.status === "success" && <ProfileCard profile={state.profile} />}
    </PageContainer>
  );
}
