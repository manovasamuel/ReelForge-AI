"use client";

import { useState, useEffect } from "react";
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
  ContentCollectionDashboard,
  ContentCollectionSkeleton,
} from "@/components/content-collection";
import {
  ContentIntelligenceDashboard,
  ContentIntelligenceSkeleton,
} from "@/components/content-intelligence";
import {
  ContentDNADashboard,
  ContentDNASkeleton,
} from "@/components/content-dna";
import {
  ScriptGenerationDashboard,
  ScriptGenerationSkeleton,
} from "@/components/script-generation";
import {
  RepurposeDashboard,
  RepurposeSkeleton,
} from "@/components/repurpose";
import {
  WorkflowTracker,
  StepHeader,
  SummaryPanel,
  EmptyOnboarding,
  SaveProjectModal,
  type WorkflowStepId,
} from "@/components/workflow";
import { Button } from "@/components/ui/button";
import { FolderGit2, Save, LayoutGrid, Download, Settings as SettingsIcon } from "lucide-react";
import { WorkspaceService } from "@/services/projects";
import {
  WorkspaceSidebar,
  WorkspaceDashboard,
  type WorkspaceSection,
} from "@/components/workspace";
import { ExportCenter } from "@/components/export";
import { SettingsDashboard } from "@/components/settings";
import { SettingsService } from "@/services/settings";
import { showToast } from "@/components/ui/toast";
import type { InstagramProfile } from "@/types/instagram";
import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import type { Competitor } from "@/types/competitor";
import type { CompetitorProfileAnalysis } from "@/types/competitor-analysis";
import type { CollectedContentItem } from "@/types/content-collection";
import type { ContentIntelligenceReport } from "@/types/content-intelligence";
import type { ContentDNAReport } from "@/types/content-dna";
import type { ReelContentPackage } from "@/types/script-generation";
import type { RepurposeReport } from "@/types/repurpose";
import type { SavedProject, ProjectSortOption, StorageStats } from "@/types/project";

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

type ContentCollectionState =
  | { status: "idle" }
  | { status: "loading"; username: string }
  | { status: "success"; username: string; items: CollectedContentItem[] }
  | { status: "error"; message: string };

type ContentIntelligenceState =
  | { status: "idle" }
  | { status: "loading"; count: number }
  | { status: "success"; reports: ContentIntelligenceReport[] }
  | { status: "error"; message: string };

type ContentDNAState =
  | { status: "idle" }
  | { status: "loading"; count: number }
  | { status: "success"; report: ContentDNAReport }
  | { status: "error"; message: string };

type ScriptGenerationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; pkg: ReelContentPackage }
  | { status: "error"; message: string };

type RepurposeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; report: RepurposeReport }
  | { status: "error"; message: string };

// ─── Page ──────────────────────────────────────────────────────────
export default function ProfilesPage() {
  const [state, setState] = useState<AnalysisState>({ status: "idle" });
  const [brandState, setBrandState] = useState<BrandIntelligenceState>({ status: "idle" });
  const [compState, setCompState] = useState<CompetitorsState>({ status: "idle" });
  const [compAnalysisState, setCompAnalysisState] = useState<CompetitorAnalysisState>({ status: "idle" });
  const [contentCollectionState, setContentCollectionState] = useState<ContentCollectionState>({ status: "idle" });
  const [contentIntelligenceState, setContentIntelligenceState] = useState<ContentIntelligenceState>({ status: "idle" });
  const [contentDNAState, setContentDNAState] = useState<ContentDNAState>({ status: "idle" });
  const [scriptGenerationState, setScriptGenerationState] = useState<ScriptGenerationState>({ status: "idle" });
  const [repurposeState, setRepurposeState] = useState<RepurposeState>({ status: "idle" });
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);

  // Workspace, Export & Settings state
  const [viewMode, setViewMode] = useState<"studio" | "workspace" | "export" | "settings">("studio");
  const [workspaceSection, setWorkspaceSection] = useState<WorkspaceSection>("all");
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<ProjectSortOption>("newest");
  const [stats, setStats] = useState<StorageStats>({
    totalProjects: 0,
    totalStorageUsedBytes: 0,
    totalStorageUsedFormatted: "0 B",
    largestProjectName: "None",
    largestProjectSizeBytes: 0,
    largestProjectSizeFormatted: "0 B",
    averageProjectSizeBytes: 0,
    averageProjectSizeFormatted: "0 B",
    lastSaved: null,
  });
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentInstagramUrl, setCurrentInstagramUrl] = useState("");

  async function loadWorkspaceData() {
    const all = await WorkspaceService.getAll(searchQuery, sortOption);
    let filtered = all;
    if (workspaceSection === "recent") {
      filtered = all.slice(0, 5);
    }
    setProjects(filtered);
    const st = await WorkspaceService.getStats();
    setStats(st);
  }

  useEffect(() => {
    const s = SettingsService.getSettings();
    if (s?.workspace?.defaultLandingPage) {
      setViewMode(s.workspace.defaultLandingPage);
    }
  }, []);

  useEffect(() => {
    loadWorkspaceData();
  }, [searchQuery, sortOption, workspaceSection, viewMode]);

  function handleCreateNewAnalysis() {
    setState({ status: "idle" });
    setBrandState({ status: "idle" });
    setCompState({ status: "idle" });
    setCompAnalysisState({ status: "idle" });
    setContentCollectionState({ status: "idle" });
    setContentIntelligenceState({ status: "idle" });
    setContentDNAState({ status: "idle" });
    setScriptGenerationState({ status: "idle" });
    setRepurposeState({ status: "idle" });
    setSelectedCompetitor(null);
    setCurrentProjectId(null);
    setCurrentInstagramUrl("");
    setViewMode("studio");
  }

  async function handleSaveProject(projectName: string) {
    const id = currentProjectId || crypto.randomUUID();
    const now = new Date().toISOString();
    const existing = currentProjectId ? await WorkspaceService.getById(currentProjectId) : null;

    const savedProject: SavedProject = {
      id,
      version: "1.2.0",
      name: projectName,
      instagramUrl: currentInstagramUrl || (state.status === "success" ? `https://instagram.com/${state.profile.username}` : "Unsaved Profile"),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      state: {
        profile: state.status === "success" ? state.profile : null,
        brandReport: brandState.status === "success" ? brandState.report : null,
        competitors: compState.status === "success" ? compState.competitors : null,
        competitorAnalysis: compAnalysisState.status === "success" ? { competitor: compAnalysisState.competitor, analysis: compAnalysisState.analysis } : null,
        contentCollection: contentCollectionState.status === "success" ? { username: contentCollectionState.username, items: contentCollectionState.items } : null,
        contentIntelligence: contentIntelligenceState.status === "success" ? contentIntelligenceState.reports : null,
        contentDNA: contentDNAState.status === "success" ? contentDNAState.report : null,
        scriptPackage: scriptGenerationState.status === "success" ? scriptGenerationState.pkg : null,
        repurposePackage: repurposeState.status === "success" ? repurposeState.report : null,
        selectedCompetitor,
      },
    };

    await WorkspaceService.save(savedProject);
    setCurrentProjectId(id);
    setIsSaveModalOpen(false);
    showToast(
      "Project Saved to Workspace",
      `Successfully saved "${projectName}" to Workspace.`
    );
    loadWorkspaceData();
  }

  function handleOpenProject(project: SavedProject) {
    setCurrentProjectId(project.id);
    setCurrentInstagramUrl(project.instagramUrl);

    if (project.state.profile) {
      setState({ status: "success", profile: project.state.profile });
    } else {
      setState({ status: "idle" });
    }

    if (project.state.brandReport) {
      setBrandState({ status: "success", report: project.state.brandReport });
    } else {
      setBrandState({ status: "idle" });
    }

    if (project.state.competitors) {
      setCompState({ status: "success", competitors: project.state.competitors });
    } else {
      setCompState({ status: "idle" });
    }

    if (project.state.competitorAnalysis) {
      setCompAnalysisState({
        status: "success",
        competitor: project.state.competitorAnalysis.competitor,
        analysis: project.state.competitorAnalysis.analysis,
      });
    } else {
      setCompAnalysisState({ status: "idle" });
    }

    if (project.state.contentCollection) {
      setContentCollectionState({
        status: "success",
        username: project.state.contentCollection.username,
        items: project.state.contentCollection.items,
      });
    } else {
      setContentCollectionState({ status: "idle" });
    }

    if (project.state.contentIntelligence) {
      setContentIntelligenceState({ status: "success", reports: project.state.contentIntelligence });
    } else {
      setContentIntelligenceState({ status: "idle" });
    }

    if (project.state.contentDNA) {
      setContentDNAState({ status: "success", report: project.state.contentDNA });
    } else {
      setContentDNAState({ status: "idle" });
    }

    if (project.state.scriptPackage) {
      setScriptGenerationState({ status: "success", pkg: project.state.scriptPackage });
    } else {
      setScriptGenerationState({ status: "idle" });
    }

    if (project.state.repurposePackage) {
      setRepurposeState({ status: "success", report: project.state.repurposePackage });
    } else {
      setRepurposeState({ status: "idle" });
    }

    setSelectedCompetitor(project.state.selectedCompetitor || null);
    setViewMode("studio");

    showToast(
      "Project Restored",
      `Loaded all completed phases for "${project.name}".`
    );
  }

  async function handleRenameProject(id: string, newName: string) {
    await WorkspaceService.rename(id, newName);
    await loadWorkspaceData();
    showToast("Project Renamed", `Renamed to "${newName}".`);
  }

  async function handleDuplicateProject(id: string) {
    const copy = await WorkspaceService.duplicate(id);
    if (copy) {
      await loadWorkspaceData();
      showToast("Project Duplicated", `Created duplicate "${copy.name}".`);
    }
  }

  async function handleDeleteProject(id: string) {
    await WorkspaceService.delete(id);
    if (currentProjectId === id) setCurrentProjectId(null);
    await loadWorkspaceData();
    showToast("Project Deleted", "Permanent deletion completed.");
  }

  async function handleAnalyze(url: string) {
    setCurrentInstagramUrl(url);
    setState({ status: "loading" });
    setBrandState({ status: "idle" });
    setCompState({ status: "idle" });
    setCompAnalysisState({ status: "idle" });
    setContentCollectionState({ status: "idle" });
    setContentIntelligenceState({ status: "idle" });
    setContentDNAState({ status: "idle" });
    setScriptGenerationState({ status: "idle" });
    setSelectedCompetitor(null);

    try {
      const activeProvider = SettingsService.getSettings()?.providers?.instagramProvider || "mock";
      const response = await fetch("/api/profiles/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-instagram-provider": activeProvider,
        },
        body: JSON.stringify({ instagramUrl: url, provider: activeProvider }),
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
    setContentCollectionState({ status: "idle" });
    setContentIntelligenceState({ status: "idle" });
    setContentDNAState({ status: "idle" });
    setScriptGenerationState({ status: "idle" });

    try {
      const aiProvider = SettingsService.getSettings()?.providers?.aiProvider || "disabled";
      const response = await fetch("/api/brand-intelligence/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ai-provider": aiProvider,
        },
        body: JSON.stringify({ profile, aiProvider }),
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
    setContentCollectionState({ status: "idle" });
    setContentIntelligenceState({ status: "idle" });
    setContentDNAState({ status: "idle" });
    setScriptGenerationState({ status: "idle" });

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

  async function handleCollectContent(username: string) {
    setContentCollectionState({ status: "loading", username });
    setContentIntelligenceState({ status: "idle" });
    setContentDNAState({ status: "idle" });
    setScriptGenerationState({ status: "idle" });

    try {
      const response = await fetch("/api/content-collection/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const json = await response.json();

      if (!response.ok || json.error) {
        setContentCollectionState({
          status: "error",
          message: json.error?.message ?? "Could not collect competitor content.",
        });
        return;
      }

      setContentCollectionState({ status: "success", username, items: json.data });
    } catch {
      setContentCollectionState({
        status: "error",
        message: "Network error collecting competitor content.",
      });
    }
  }

  async function handleAnalyzeSelectedContent(items: CollectedContentItem[]) {
    setContentIntelligenceState({ status: "loading", count: items.length });
    setContentDNAState({ status: "idle" });
    setScriptGenerationState({ status: "idle" });

    try {
      const response = await fetch("/api/content-intelligence/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const json = await response.json();

      if (!response.ok || json.error) {
        setContentIntelligenceState({
          status: "error",
          message: json.error?.message ?? "Could not generate content intelligence reports.",
        });
        return;
      }

      setContentIntelligenceState({ status: "success", reports: json.data });
    } catch {
      setContentIntelligenceState({
        status: "error",
        message: "Network error generating content intelligence.",
      });
    }
  }

  async function handleGenerateContentDNA(reports: ContentIntelligenceReport[]) {
    setContentDNAState({ status: "loading", count: reports.length });
    setScriptGenerationState({ status: "idle" });

    try {
      const response = await fetch("/api/content-dna/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reports }),
      });
      const json = await response.json();

      if (!response.ok || json.error) {
        setContentDNAState({
          status: "error",
          message: json.error?.message ?? "Could not generate Content DNA blueprint.",
        });
        return;
      }

      setContentDNAState({ status: "success", report: json.data });
    } catch {
      setContentDNAState({
        status: "error",
        message: "Network error synthesizing Content DNA blueprint.",
      });
    }
  }

  async function handleGenerateScript(dnaReport: ContentDNAReport) {
    setScriptGenerationState({ status: "loading" });
    setRepurposeState({ status: "idle" });

    try {
      const aiProvider = SettingsService.getSettings()?.providers?.aiProvider || "disabled";
      const response = await fetch("/api/script-generation/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ai-provider": aiProvider,
        },
        body: JSON.stringify({ dnaReport, aiProvider }),
      });
      const json = await response.json();

      if (!response.ok || json.error) {
        setScriptGenerationState({
          status: "error",
          message: json.error?.message ?? "Could not generate Instagram Reel Content Package.",
        });
        return;
      }

      setScriptGenerationState({ status: "success", pkg: json.data });
    } catch {
      setScriptGenerationState({
        status: "error",
        message: "Network error compiling Reel Content Package.",
      });
    }
  }

  async function handleGenerateRepurpose(pkg: ReelContentPackage) {
    setRepurposeState({ status: "loading" });

    try {
      const response = await fetch("/api/repurpose/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pkg }),
      });
      const json = await response.json();

      if (!response.ok || json.error) {
        setRepurposeState({
          status: "error",
          message: json.error?.message ?? "Could not generate Multi-Platform Repurpose package.",
        });
        return;
      }

      setRepurposeState({ status: "success", report: json.data });
    } catch {
      setRepurposeState({
        status: "error",
        message: "Network error adapting Multi-Platform Repurpose package.",
      });
    }
  }

  function handleRetry() {
    setState({ status: "idle" });
    setBrandState({ status: "idle" });
    setCompState({ status: "idle" });
    setCompAnalysisState({ status: "idle" });
    setContentCollectionState({ status: "idle" });
    setContentIntelligenceState({ status: "idle" });
    setContentDNAState({ status: "idle" });
    setScriptGenerationState({ status: "idle" });
    setRepurposeState({ status: "idle" });
    setSelectedCompetitor(null);
  }

  function handleInputChange() {
    if (state.status === "success" || state.status === "error") {
      setState({ status: "idle" });
      setBrandState({ status: "idle" });
      setCompState({ status: "idle" });
      setCompAnalysisState({ status: "idle" });
      setContentCollectionState({ status: "idle" });
      setContentIntelligenceState({ status: "idle" });
      setContentDNAState({ status: "idle" });
      setScriptGenerationState({ status: "idle" });
      setRepurposeState({ status: "idle" });
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
          if (contentCollectionState.status === "idle") {
            activeStep = "competitor-analysis";
          } else if (contentCollectionState.status === "loading") {
            activeStep = "content-collection";
          } else if (contentCollectionState.status === "success") {
            completedSteps.push("content-collection");
            if (contentIntelligenceState.status === "idle") {
              activeStep = "content-collection";
            } else if (contentIntelligenceState.status === "loading") {
              activeStep = "content-intelligence";
            } else if (contentIntelligenceState.status === "success") {
              completedSteps.push("content-intelligence");
              if (contentDNAState.status === "idle") {
                activeStep = "content-intelligence";
              } else if (contentDNAState.status === "loading") {
                activeStep = "content-dna";
              } else if (contentDNAState.status === "success") {
                completedSteps.push("content-dna");
                if (scriptGenerationState.status === "idle") {
                  activeStep = "content-dna";
                } else if (scriptGenerationState.status === "loading") {
                  activeStep = "script-generation";
                } else if (scriptGenerationState.status === "success") {
                  completedSteps.push("script-generation");
                  if (repurposeState.status === "idle") {
                    activeStep = "script-generation";
                  } else if (repurposeState.status === "loading") {
                    activeStep = "repurpose";
                  } else if (repurposeState.status === "success") {
                    completedSteps.push("repurpose");
                    activeStep = "repurpose";
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  const isPhase4Complete = compAnalysisState.status === "success";
  const isPhase5Complete = contentCollectionState.status === "success";
  const isPhase6Complete = contentIntelligenceState.status === "success";
  const isPhase7Complete = contentDNAState.status === "success";
  const isPhase8Complete = scriptGenerationState.status === "success";
  const isPhase9Complete = repurposeState.status === "success";

  const activeProjectForExport: SavedProject | null =
    currentProjectId && projects.find((p) => p.id === currentProjectId)
      ? projects.find((p) => p.id === currentProjectId)!
      : state.status === "success"
      ? {
          id: currentProjectId || "temp_live_export",
          version: "1.2.0",
          name: `@${state.profile.username} Omnichannel Report`,
          instagramUrl: currentInstagramUrl || `https://instagram.com/${state.profile.username}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          state: {
            profile: state.profile,
            brandReport: brandState.status === "success" ? brandState.report : null,
            competitors: compState.status === "success" ? compState.competitors : null,
            competitorAnalysis:
              compAnalysisState.status === "success"
                ? { competitor: compAnalysisState.competitor, analysis: compAnalysisState.analysis }
                : null,
            contentCollection:
              contentCollectionState.status === "success"
                ? { username: contentCollectionState.username, items: contentCollectionState.items }
                : null,
            contentIntelligence:
              contentIntelligenceState.status === "success" ? contentIntelligenceState.reports : null,
            contentDNA: contentDNAState.status === "success" ? contentDNAState.report : null,
            scriptPackage: scriptGenerationState.status === "success" ? scriptGenerationState.pkg : null,
            repurposePackage: repurposeState.status === "success" ? repurposeState.report : null,
            selectedCompetitor,
          },
        }
      : null;

  return (
    <PageContainer>
      {/* Top Studio vs Workspace vs Export Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 p-4 rounded-2xl border border-violet-500/30 bg-card/80 backdrop-blur-md shadow-lg print:hidden">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md">
            <FolderGit2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">ReelForge AI v1.3 Platform</h2>
            <p className="text-[11px] text-muted-foreground">Studio Analysis, Workspace Repository, Export Hub & Provider Studio</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {viewMode === "studio" && completedSteps.length > 0 && (
            <Button
              onClick={() => setIsSaveModalOpen(true)}
              size="sm"
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs gap-1.5 px-3.5 shadow-md shadow-violet-950/40"
            >
              <Save className="h-3.5 w-3.5" /> Save
            </Button>
          )}

          <div className="inline-flex rounded-xl bg-background/60 p-1 border border-border/80">
            <button
              onClick={() => setViewMode("studio")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "studio" ? "bg-violet-600 text-white shadow" : "text-muted-foreground hover:text-white"
              }`}
            >
              Studio
            </button>
            <button
              onClick={() => {
                loadWorkspaceData();
                setViewMode("workspace");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "workspace" ? "bg-violet-600 text-white shadow" : "text-muted-foreground hover:text-white"
              }`}
            >
              Workspace
            </button>
            <button
              onClick={() => setViewMode("export")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "export" ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow font-bold" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Download className="h-3 w-3" /> Export Center
            </button>
            <button
              onClick={() => setViewMode("settings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "settings" ? "bg-violet-600 text-white shadow font-bold" : "text-muted-foreground hover:text-white"
              }`}
            >
              <SettingsIcon className="h-3 w-3" /> Settings
            </button>
          </div>
        </div>
      </div>

      {viewMode === "settings" ? (
        <SettingsDashboard />
      ) : viewMode === "export" ? (
        <ExportCenter project={activeProjectForExport} />
      ) : viewMode === "workspace" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start animate-in fade-in duration-300">
          <aside className="lg:col-span-1 w-full">
            <WorkspaceSidebar
              activeSection={workspaceSection}
              onSelectSection={(sec) => {
                if (sec === "new") {
                  handleCreateNewAnalysis();
                } else {
                  setWorkspaceSection(sec);
                }
              }}
              stats={stats}
            />
          </aside>
          <div className="lg:col-span-3">
            <WorkspaceDashboard
              projects={projects}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortOption={sortOption}
              onSortChange={setSortOption}
              onOpenProject={handleOpenProject}
              onRenameProject={handleRenameProject}
              onDuplicateProject={handleDuplicateProject}
              onDeleteProject={handleDeleteProject}
              onCreateNew={handleCreateNewAnalysis}
            />
          </div>
        </div>
      ) : (
        <>
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
                  <CompetitorAnalysisDashboard
                    analysis={compAnalysisState.analysis}
                    onCollectContent={handleCollectContent}
                  />
                )}
                {compAnalysisState.status === "error" && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
                    {compAnalysisState.message}
                  </div>
                )}
              </section>
            )}

            {/* Step 5: Content Collection Engine (Phase 5) */}
            {contentCollectionState.status !== "idle" && (
              <section aria-labelledby="step-5-title">
                <StepHeader
                  step={5}
                  title={`Content Library & Media Engine: @${
                    contentCollectionState.status === "loading"
                      ? contentCollectionState.username
                      : contentCollectionState.status === "success"
                      ? contentCollectionState.username
                      : "Account"
                  }`}
                  description="Extracted Instagram media library formatted for multi-item selection and downstream pattern analysis"
                />
                {contentCollectionState.status === "loading" && <ContentCollectionSkeleton />}
                {contentCollectionState.status === "success" && (
                  <ContentCollectionDashboard
                    items={contentCollectionState.items}
                    competitorUsername={contentCollectionState.username}
                    onAnalyzeSelected={handleAnalyzeSelectedContent}
                  />
                )}
                {contentCollectionState.status === "error" && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
                    {contentCollectionState.message}
                  </div>
                )}
              </section>
            )}

            {/* Step 6: Content Intelligence Engine (Phase 6) */}
            {contentIntelligenceState.status !== "idle" && (
              <section aria-labelledby="step-6-title">
                <StepHeader
                  step={6}
                  title={`Content Intelligence Teardown (${
                    contentIntelligenceState.status === "loading"
                      ? contentIntelligenceState.count
                      : contentIntelligenceState.status === "success"
                      ? contentIntelligenceState.reports.length
                      : 0
                  } Selected Items)`}
                  description="Granular evaluation of hooks, captions, visual pacing, psychology radar, virality & reusability"
                />
                {contentIntelligenceState.status === "loading" && <ContentIntelligenceSkeleton />}
                {contentIntelligenceState.status === "success" && (
                  <ContentIntelligenceDashboard
                    reports={contentIntelligenceState.reports}
                    onProceedToPhase7={() => handleGenerateContentDNA(contentIntelligenceState.reports)}
                  />
                )}
                {contentIntelligenceState.status === "error" && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
                    {contentIntelligenceState.message}
                  </div>
                )}
              </section>
            )}

            {/* Step 7: Content DNA Engine (Phase 7B) */}
            {contentDNAState.status !== "idle" && (
              <section aria-labelledby="step-7-title">
                <StepHeader
                  step={7}
                  title="Unified Winning Content DNA Blueprint"
                  description="Aggregated master standard and reusable formula ready for studio script generation"
                />
                {contentDNAState.status === "loading" && <ContentDNASkeleton />}
                {contentDNAState.status === "success" && (
                  <ContentDNADashboard
                    report={contentDNAState.report}
                    onProceedToScriptGeneration={() => handleGenerateScript(contentDNAState.report)}
                  />
                )}
                {contentDNAState.status === "error" && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
                    {contentDNAState.message}
                  </div>
                )}
              </section>
            )}

            {/* Step 8: Strategy + Script Generation Engine (Phase 8) */}
            {scriptGenerationState.status !== "idle" && (
              <section aria-labelledby="step-8-title">
                <StepHeader
                  step={8}
                  title="Strategy + Studio Script Generation Engine"
                  description="Complete 9-section Instagram Reel Content Package compiled from your Content DNA"
                />
                {scriptGenerationState.status === "loading" && <ScriptGenerationSkeleton />}
                {scriptGenerationState.status === "success" && (
                  <ScriptGenerationDashboard
                    pkg={scriptGenerationState.pkg}
                    onProceedToRepurpose={() => handleGenerateRepurpose(scriptGenerationState.pkg)}
                  />
                )}
                {scriptGenerationState.status === "error" && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
                    {scriptGenerationState.message}
                  </div>
                )}
              </section>
            )}

            {/* Step 9: Multi-Platform Repurpose Engine (Phase 9) */}
            {repurposeState.status !== "idle" && (
              <section aria-labelledby="step-9-title">
                <StepHeader
                  step={9}
                  title="Multi-Platform Repurpose Studio"
                  description="Deterministic transformation adapting your core Reel package into native content across 6 platforms"
                />
                {repurposeState.status === "loading" && <RepurposeSkeleton />}
                {repurposeState.status === "success" && (
                  <RepurposeDashboard report={repurposeState.report} />
                )}
                {repurposeState.status === "error" && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
                    {repurposeState.message}
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
              isPhase5Complete={isPhase5Complete}
              isPhase6Complete={isPhase6Complete}
              isPhase7Complete={isPhase7Complete}
              isPhase8Complete={isPhase8Complete}
              isPhase9Complete={isPhase9Complete}
            />
          </aside>
        </div>
      )}
      </>
      )}

      {/* Save Project Dialog Modal */}
      <SaveProjectModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveProject}
        defaultName={state.status === "success" ? `@${state.profile.username} Omnichannel Intelligence` : "ReelForge Analysis"}
        completedPhasesCount={completedSteps.length}
      />
    </PageContainer>
  );
}
