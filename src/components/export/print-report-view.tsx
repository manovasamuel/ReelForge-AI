"use client";

import type { SavedProject } from "@/types/project";
import { Sparkles, User, Target, Users, Zap, Film, Share2 } from "lucide-react";

interface PrintReportViewProps {
  project: SavedProject | null;
}

export function PrintReportView({ project }: PrintReportViewProps) {
  if (!project) return null;

  const state = project.state;
  const now = new Date().toLocaleDateString();

  return (
    <div className="hidden print:block bg-white text-black p-8 font-sans max-w-4xl mx-auto space-y-12">
      {/* 1. Cover Page */}
      <section className="min-h-[85vh] flex flex-col justify-between border-b-2 border-black pb-12 break-after-page">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-black bg-gray-100 text-xs font-bold uppercase tracking-widest mb-8">
            <Sparkles className="h-4 w-4" /> ReelForge AI Omnichannel Intelligence
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">{project.name}</h1>
          <p className="text-lg text-gray-700">Target Profile: {project.instagramUrl}</p>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div><strong>Report Date:</strong> {now}</div>
          <div><strong>Schema Version:</strong> {project.version}</div>
          <div><strong>Platform Engine:</strong> ReelForge AI v1.2</div>
        </div>
      </section>

      {/* 2. Executive Project Summary */}
      <section className="space-y-4 break-after-page">
        <h2 className="text-2xl font-bold border-b border-gray-300 pb-2 flex items-center gap-2">
          <Zap className="h-5 w-5" /> Executive Project Summary
        </h2>
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded border border-gray-200">
          <div>
            <div className="text-xs text-gray-500 uppercase">Target Handle</div>
            <div className="text-lg font-bold">@{state.profile?.username || "N/A"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Industry & Niche</div>
            <div className="text-lg font-bold">{state.brandReport?.industry || "Unclassified"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Competitors Tracked</div>
            <div className="text-lg font-bold">{state.competitors?.length || 0} Accounts</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Content DNA Score</div>
            <div className="text-lg font-bold">{state.contentDNA?.snapshot.overallDNAScore || "N/A"} / 100</div>
          </div>
        </div>
      </section>

      {/* 3. Profile & Brand Snapshot */}
      <section className="space-y-6 break-after-page">
        <div>
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 flex items-center gap-2 mb-3">
            <User className="h-5 w-5" /> Profile Snapshot
          </h2>
          {state.profile ? (
            <div className="space-y-1 text-sm">
              <div><strong>Followers:</strong> {state.profile.follower_count.toLocaleString()}</div>
              <div><strong>Category:</strong> {state.profile.category || "Creator / General"}</div>
              <div><strong>Total Posts:</strong> {state.profile.post_count}</div>
              <div><strong>Bio:</strong> {state.profile.bio || "No bio available."}</div>
            </div>
          ) : <p className="text-sm text-gray-500">No raw profile ingested.</p>}
        </div>

        <div>
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 flex items-center gap-2 mb-3">
            <Target className="h-5 w-5" /> Brand Intelligence Position
          </h2>
          {state.brandReport ? (
            <div className="space-y-1 text-sm">
              <div><strong>Brand Type:</strong> {state.brandReport.brandType}</div>
              <div><strong>Target Audience:</strong> {state.brandReport.targetAudience}</div>
              <div><strong>Brand Tone:</strong> {state.brandReport.brandTone}</div>
              <div><strong>Content Pillars:</strong> {state.brandReport.primaryContentPillars.join(", ")}</div>
            </div>
          ) : <p className="text-sm text-gray-500">No brand analysis generated.</p>}
        </div>
      </section>

      {/* 4. Competitors & Competitor Analysis */}
      <section className="space-y-6 break-after-page">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-2 flex items-center gap-2">
          <Users className="h-5 w-5" /> Competitor Discovery & Analysis
        </h2>
        {state.competitors && state.competitors.length > 0 ? (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Identified Benchmarks:</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {state.competitors.map((c) => (
                <li key={c.username}>
                  <strong>@{c.username}</strong> ({c.followers.toLocaleString()} followers) — Similarity: {c.similarityScore}%
                </li>
              ))}
            </ul>
          </div>
        ) : <p className="text-sm text-gray-500">No competitors recorded.</p>}

        {state.competitorAnalysis && (
          <div className="bg-gray-50 p-4 border rounded text-sm space-y-2 mt-4">
            <h3 className="font-bold">Teardown: @{state.competitorAnalysis.competitor.username}</h3>
            <div><strong>Market Position:</strong> {state.competitorAnalysis.analysis.businessSummary.marketPosition}</div>
            <div><strong>Core Differentiator:</strong> {state.competitorAnalysis.analysis.businessSummary.coreDifferentiator}</div>
          </div>
        )}
      </section>

      {/* 5. Content DNA Blueprint */}
      <section className="space-y-4 break-after-page">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-2 flex items-center gap-2">
          <Zap className="h-5 w-5" /> Content DNA Blueprint
        </h2>
        {state.contentDNA ? (
          <div className="space-y-4 text-sm">
            <div className="bg-gray-100 p-4 rounded font-mono font-bold text-center border">
              Winning Formula: {state.contentDNA.winningStructure.formulaString || state.contentDNA.blueprintExport.formulaSteps.join(" → ")}
            </div>
            <div><strong>Dominant Hook:</strong> {state.contentDNA.snapshot.dominantHook}</div>
            <div><strong>Dominant Psychology:</strong> {state.contentDNA.snapshot.dominantPsychology}</div>
            <div><strong>Dominant CTA:</strong> {state.contentDNA.snapshot.dominantCTA}</div>
          </div>
        ) : <p className="text-sm text-gray-500">No Content DNA blueprint available.</p>}
      </section>

      {/* 6. Studio Script & Repurpose Package */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 flex items-center gap-2 mb-3">
            <Film className="h-5 w-5" /> Reel Production Script Package
          </h2>
          {state.scriptPackage ? (
            <div className="space-y-4 text-sm">
              <blockquote className="bg-gray-100 p-3 border-l-4 border-black font-semibold italic">
                Hook: &ldquo;{state.scriptPackage.hook.firstSentence}&rdquo;
              </blockquote>
              <div className="space-y-2">
                {state.scriptPackage.scenes.map((s) => (
                  <div key={s.sceneNumber} className="border-b pb-2">
                    <strong>Scene {s.sceneNumber} ({s.duration}):</strong> Visual: {s.visual} | Audio: &ldquo;{s.voiceover}&rdquo;
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-sm text-gray-500">No studio script generated.</p>}
        </div>

        <div>
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 flex items-center gap-2 mb-3">
            <Share2 className="h-5 w-5" /> Multi-Platform Repurpose Output
          </h2>
          {state.repurposePackage ? (
            <div className="space-y-3 text-sm">
              <div>
                <strong>LinkedIn Adaptation:</strong>
                <p className="whitespace-pre-line bg-gray-50 p-2 border rounded mt-1">{state.repurposePackage.linkedIn.longFormPost}</p>
              </div>
              <div>
                <strong>YouTube Shorts Title:</strong> {state.repurposePackage.youtubeShorts.title}
              </div>
            </div>
          ) : <p className="text-sm text-gray-500">No repurpose package recorded.</p>}
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-12 border-t border-gray-400 text-xs text-gray-500 flex justify-between items-center">
        <div>Generated deterministically by ReelForge AI v1.2 Export Center</div>
        <div>Generation Date: {now} | Version: {project.version}</div>
      </footer>
    </div>
  );
}
