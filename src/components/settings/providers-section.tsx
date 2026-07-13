"use client";

import React from "react";
import { ProviderPreferences, InstagramProviderType, AIProviderType, ProviderStatus } from "@/types/settings";
import { Database, Sparkles, CheckCircle2, Lock, Clock } from "lucide-react";
import { AiTelemetryPanel } from "./ai-telemetry-panel";

interface ProvidersSectionProps {
  preferences: ProviderPreferences;
  onChange: (updated: Partial<ProviderPreferences>) => void;
}

export function ProvidersSection({ preferences, onChange }: ProvidersSectionProps) {
  const instagramOptions: {
    id: InstagramProviderType;
    name: string;
    desc: string;
    status: ProviderStatus;
    disabled: boolean;
  }[] = [
    { id: "mock", name: "Mock Instagram Provider", desc: "Deterministic heuristic scraping engine with 24 sample accounts.", status: "Active", disabled: false },
    { id: "apify", name: "Apify Scraper Engine", desc: "Official residential proxy scraper API integration.", status: "Available", disabled: false },
    { id: "rapidapi", name: "RapidAPI Instagram v1.2", desc: "Third-party high-throughput JSON endpoint wrapper.", status: "Available", disabled: false },
    { id: "brightdata", name: "BrightData Web Unlocker", desc: "Enterprise anti-bot bypass crawler network.", status: "Available", disabled: false },
  ];

  const aiOptions: {
    id: AIProviderType;
    name: string;
    desc: string;
    status: ProviderStatus;
    disabled: boolean;
  }[] = [
    { id: "disabled", name: "Deterministic Heuristic Engine (No LLM)", desc: "100% client-side deterministic algorithms without external tokens.", status: "Active", disabled: false },
    { id: "gemini", name: "Google Gemini 2.5 Flash", desc: "Next-gen multimodal script reasoning and creative variations.", status: "Available", disabled: false },
    { id: "openai", name: "OpenAI GPT-4o Studio", desc: "Deep creative screenplay writing and emotional cadence tuning.", status: "Available", disabled: false },
    { id: "claude", name: "Anthropic Claude 3.5 Sonnet", desc: "Nuanced brand voice mimicry and contrarian hook framing.", status: "Available", disabled: false },
  ];

  const getStatusBadge = (status: ProviderStatus) => {
    switch (status) {
      case "Active":
        return <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Active</span>;
      case "Coming Soon":
        return <span className="px-2.5 py-1 text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full flex items-center gap-1"><Clock className="h-3 w-3" /> Coming Soon</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold bg-gray-800 text-gray-400 border border-gray-700 rounded-full flex items-center gap-1"><Lock className="h-3 w-3" /> {status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <AiTelemetryPanel />

      <div className="border-t border-gray-800 pt-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <Database className="h-5 w-5 text-purple-400" /> Instagram Data Ingestion Provider
        </h3>
        <p className="text-sm text-gray-400 mb-4">Select the active data acquisition backend for profile ingestion and competitor discovery.</p>
        <div className="grid grid-cols-1 gap-3">
          {instagramOptions.map((opt) => {
            const active = preferences.instagramProvider === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => !opt.disabled && onChange({ instagramProvider: opt.id })}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                  active
                    ? "bg-purple-900/30 border-purple-500 text-white shadow-md cursor-pointer"
                    : opt.disabled
                    ? "bg-gray-900/40 border-gray-800/80 opacity-75 cursor-not-allowed"
                    : "bg-gray-900/60 border-gray-800 hover:border-gray-700 cursor-pointer"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center ${active ? "border-purple-400 bg-purple-600" : "border-gray-600 bg-gray-800"}`}>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-20 flex items-center gap-2">
                      {opt.name}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </div>
                </div>
                <div>{getStatusBadge(opt.status)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-800 pt-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-purple-400" /> AI & Script Synthesis Provider
        </h3>
        <p className="text-sm text-gray-400 mb-4">Controls external large language models vs client-side deterministic synthesis.</p>
        <div className="grid grid-cols-1 gap-3">
          {aiOptions.map((opt) => {
            const active = preferences.aiProvider === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => !opt.disabled && onChange({ aiProvider: opt.id })}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                  active
                    ? "bg-purple-900/30 border-purple-500 text-white shadow-md cursor-pointer"
                    : opt.disabled
                    ? "bg-gray-900/40 border-gray-800/80 opacity-75 cursor-not-allowed"
                    : "bg-gray-900/60 border-gray-800 hover:border-gray-700 cursor-pointer"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center ${active ? "border-purple-400 bg-purple-600" : "border-gray-600 bg-gray-800"}`}>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-20 flex items-center gap-2">
                      {opt.name}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </div>
                </div>
                <div>{getStatusBadge(opt.status)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
