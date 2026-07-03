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
import {
  CompetitorList,
  CompetitorSkeleton,
} from "@/components/competitors";
import {
  CompetitorAnalysisDashboard,
  CompetitorAnalysisSkeleton,
} from "@/components/competitor-analysis";
import {
  WorkflowTracker,
  StepHeader,
  SummaryPanel,
  EmptyOnboarding,
  type WorkflowStepId,
} from "@/components/workflow";
import type { InstagramProfile } from "@/types/instagram";
import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { Competitor } from "@/types/competitor";
import type { CompetitorProfileAnalysis } from "@/types/competitor-analysis";

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

type CompetitorsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; competitors: Competitor[] }
  | { status: "error"; message: string };

type CompetitorAnalysisState =
  | { status: "idle" }
  | { status: "loading"; competitor: Competitor }
  | { status: "success"; competitor: Competitor; analysis: CompetitorProfileAnalysis }
  | { status: "error"; message: string };

// ─── Page ──────────────────────────────────────────────────────────
export default function ProfilesPage() {
  const [state, setState] = useState<AnalysisState>({ status: "idle" });
  const [brandState, setBrandState] = useState<BrandIntelligenceState>({ status: "idle" });
  const [compState, setCompState] = useState<CompetitorsState>({ status: "idle" });
  const [compAnalysisState, setCompAnalysisState] = useState<CompetitorAnalysisState>({ status: "idle" });
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);

  async function handleAnalyze(url: string) {
    setState({ status: "loading" });
    setBrandState({ status: "idle" });
    setCompState({ status: "idle" });
    setCompAnalysisState({ status: "idle" });
    setSelectedCompetitor(null);

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
    setCompState({ status: "idle" });
    setCompAnalysisState({ status: "idle" });

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

      const report = json.data as BrandIntelligenceReport;
      setBrandState({ status: "success", report });

      // Automatically trigger Competitor Discovery (Phase 3)
      await fetchCompetitors(report);
    } catch {
      setBrandState({
        status: "error",
        message: "Network error loading brand intelligence.",
      });
    }
  }

  async function fetchCompetitors(brandReport: BrandIntelligenceReport) {
    setCompState({ status: "loading" });

    try {
      const response = await fetch("/api/competitors/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandReport }),
      });
      const json = await response.json();

      if (!response.ok || json.error) {
        setCompState({
          status: "error",
          message: json.error?.message ?? "Could not discover competitors.",
        });
        return;
      }

      setCompState({ status: "success", competitors: json.data });
    } catch {
      setCompState({
        status: "error",
        message: "Network error loading competitors.",
      });
    }
  }

  async function handleAnalyzeCompetitor(competitor: Competitor) {
    setSelectedCompetitor(competitor.username);
    setCompAnalysisState({ status: "loading", competitor });

    try {
      const response = await fetch("/api/competitor-analysis/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitor }),
      });
      const json = await response.json();

      if (!response.ok || json.error) {
        setCompAnalysisState({
          status: "error",
          message: json.error?.message ?? "Could not generate competitor profile analysis.",
        });
        return;
      }

      setCompAnalysisState({ status: "success", competitor, analysis: json.data });
    } catch {
      setCompAnalysisState({
        status: "error",
        message: "Network error analyzing competitor profile.",
      });
    }
  }

  function handleRetry() {
    setState({ status: "idle" });
    setBrandState({ status: "idle" });
    setCompState({ status: "idle" });
    setCompAnalysisState({ status: "idle" });
    setSelectedCompetitor(null);
  }

  function handleInputChange() {
    if (state.status === "success" || state.status === "error") {
      setState({ status: "idle" });
      setBrandState({ status: "idle" });
      setCompState({ status: "idle" });
      setCompAnalysisState({ status: "idle" });
      setSelectedCompetitor(null);
    }
  }

  function handleSelectCompetitor(username: string, isSelected: boolean) {
    setSelectedCompetitor(isSelected ? username : null);
  }

  const isLoading = state.status === "loading";

  // Compute active workflow step & completed steps
  const completedSteps: WorkflowStepId[] = [];
  let activeStep: WorkflowStepId = "profile";

  if (state.status === "success") {
    completedSteps.push("profile");
    if (brandState.status === "loading" || brandState.status === "idle") {
      activeStep = "brand";
    } else if (brandState.status === "success") {
      completedSteps.push("brand");
      if (compState.status === "loading" || compState.status === "idle") {
        activeStep = "competitors";
      } else if (compState.status === "success") {
        completedSteps.push("competitors");
        if (compAnalysisState.status === "idle") {
          activeStep = "competitors";
        } else if (compAnalysisState.status === "loading") {
          activeStep = "competitor-analysis";
        } else if (compAnalysisState.status === "success") {
          completedSteps.push("competitor-analysis");
          activeStep = "competitor-analysis";
        }
      }
    }
  }

  const isPhase4Complete = compAnalysisState.status === "success";

  return (
    <PageContainer>
      {/* Horizontal Workflow Progress Tracker */}
      <WorkflowTracker completedSteps={completedSteps} activeStep={activeStep} />

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

      {/* Empty / Onboarding state */}
      {state.status === "idle" && <EmptyOnboarding />}

      {/* Loading state */}
      {state.status === "loading" && <ProfileSkeleton />}

      {/* Error state */}
      {state.status === "error" && (
        <ProfileError message={state.message} onRetry={handleRetry} />
      )}

      {/* Success Guided Workflow */}
      {state.status === "success" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start animate-in fade-in duration-300">
          {/* Main Workflow Column (3 cols on desktop) */}
          <div className="lg:col-span-3 space-y-10">
            {/* Step 1: Profile Snapshot */}
            <section aria-labelledby="step-1-title">
              <StepHeader
                step={1}
                title="Instagram Profile Snapshot"
                description="Raw account metrics and recent media ingestion"
              />
              <ProfileCard profile={state.profile} />
            </section>

            {/* Step 2: Brand Intelligence */}
            <section aria-labelledby="step-2-title">
              <StepHeader
                step={2}
                title="Brand Intelligence Blueprint"
                description="Deterministic evaluation of tone, target audience & primary pillars"
              />
              {brandState.status === "loading" && <BrandIntelligenceSkeleton />}
              {brandState.status === "success" && (
                <BrandIntelligenceCard report={brandState.report} />
              )}
              {brandState.status === "error" && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
                  {brandState.message}
                </div>
              )}
            </section>

            {/* Step 3: Competitor Discovery */}
            <section aria-labelledby="step-3-title">
              <StepHeader
                step={3}
                title="Competitor Discovery Radar"
                description="Top 10 deterministic matches ranking audience overlap & content style"
              />
              {compState.status === "loading" && <CompetitorSkeleton />}
              {compState.status === "success" && (
                <CompetitorList
                  competitors={compState.competitors}
                  onSelectCompetitor={handleSelectCompetitor}
                  onAnalyzeCompetitor={handleAnalyzeCompetitor}
                />
              )}
              {compState.status === "error" && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
                  {compState.message}
                </div>
              )}
            </section>

            {/* Step 4: Competitor Profile Analysis (Phase 4) */}
            {compAnalysisState.status !== "idle" && (
              <section aria-labelledby="step-4-title">
                <StepHeader
                  step={4}
                  title={`Competitor Analysis: @${
                    compAnalysisState.status === "loading"
                      ? compAnalysisState.competitor.username
                      : compAnalysisState.status === "success"
                      ? compAnalysisState.competitor.username
                      : "Account"
                  }`}
                  description="Deep 11-section account evaluation, audience psychology & strategic recommendations"
                />
                {compAnalysisState.status === "loading" && <CompetitorAnalysisSkeleton />}
                {compAnalysisState.status === "success" && (
                  <CompetitorAnalysisDashboard analysis={compAnalysisState.analysis} />
                )}
                {compAnalysisState.status === "error" && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
                    {compAnalysisState.message}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Sticky Analysis Summary Panel */}
          <aside className="lg:col-span-1 w-full" aria-label="Intelligence Summary">
            <SummaryPanel
              username={state.profile.username}
              industry={brandState.status === "success" ? brandState.report.industry : undefined}
              brandType={brandState.status === "success" ? brandState.report.brandType : undefined}
              competitorsCount={compState.status === "success" ? compState.competitors.length : 0}
              selectedCompetitor={selectedCompetitor}
              isPhase4Complete={isPhase4Complete}
            />
          </aside>
        </div>
      )}
    </PageContainer>
  );
}
