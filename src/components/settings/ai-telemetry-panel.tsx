"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Activity, 
  Cpu, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Zap, 
  BarChart3, 
  Calendar, 
  DollarSign,
  AlertCircle,
  Infinity as InfinityIcon
} from "lucide-react";

interface TelemetrySummaryData {
  planId: string;
  planName: string;
  persistedUsage: {
    billingPeriodStart: string | null;
    billingPeriodEnd: string | null;
    aiPromptTokens: number;
    aiCompletionTokens: number;
    totalTokens: number;
    aiTokenLimit: number;
    remainingTokens: number | null;
    usagePercentage: number | null;
    totalEstimatedCostUsd: string;
    isUnlimited: boolean;
  };
  runtimeHealth: {
    providers: {
      providerId: string;
      name: string;
      isAvailable: boolean;
      isHealthy: boolean;
      consecutiveFailures: number;
      circuitState: "closed" | "open" | "half-open";
      lastFailureTime?: string;
      lastSuccessTime?: string;
    }[];
    timestamp: string;
  };
}

export function AiTelemetryPanel() {
  const [data, setData] = useState<TelemetrySummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchTelemetry = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/telemetry/summary", {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
      });

      if (res.status === 401) {
        setError("Authentication required to view telemetry. Please sign in.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (!res.ok) {
        setError("Unable to load AI telemetry summary. Please try refreshing.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const json = await res.json();
      if (json.status === "ok" && json.data) {
        setData(json.data);
      } else {
        setError("Invalid telemetry data format received from server.");
      }
    } catch (err) {
      setError("Network issue while connecting to AI telemetry service.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="p-6 bg-gray-900/60 border border-gray-800 rounded-2xl space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-800 rounded-xl" />
            <div className="space-y-2">
              <div className="h-5 w-48 bg-gray-800 rounded" />
              <div className="h-3 w-64 bg-gray-800/60 rounded" />
            </div>
          </div>
          <div className="h-8 w-24 bg-gray-800 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-gray-800/50 rounded-xl" />
          <div className="h-28 bg-gray-800/50 rounded-xl" />
          <div className="h-28 bg-gray-800/50 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-6 bg-rose-950/20 border border-rose-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">AI Telemetry Service Unavailable</h4>
            <p className="text-sm text-gray-400 mt-0.5">{error}</p>
          </div>
        </div>
        <button
          onClick={() => fetchTelemetry(true)}
          disabled={refreshing}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold text-sm rounded-xl border border-gray-700 flex items-center gap-2 transition-all shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Retry Connection
        </button>
      </div>
    );
  }

  if (!data) return null;

  const p = data.persistedUsage;
  const rh = data.runtimeHealth;
  const isOverQuota = !p.isUnlimited && (p.usagePercentage ?? 0) >= 100;
  const isEmptyUsage = p.totalTokens === 0;

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "Current Cycle";
    try {
      return new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Current Cycle";
    }
  };

  const getProgressColor = (pct: number | null) => {
    if (pct === null) return "bg-purple-500";
    if (pct >= 100) return "bg-rose-500";
    if (pct >= 80) return "bg-amber-500";
    return "bg-purple-500";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Refresh Header */}
      <div className="p-6 bg-gradient-to-br from-gray-900/90 via-gray-900/60 to-purple-950/20 border border-gray-800 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-white">AI Telemetry & Quota Monitor</h3>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-full">
                  {data.planName}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-0.5">
                Real-time visibility into persisted database token accounting and active model failover circuits.
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchTelemetry(true)}
            disabled={refreshing}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white font-semibold text-sm rounded-xl border border-gray-700/80 flex items-center gap-2 transition-all self-start md:self-auto shrink-0"
          >
            <RefreshCw className={`h-4 w-4 text-purple-400 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Telemetry
          </button>
        </div>

        {/* Quota Alerts */}
        {isOverQuota && (
          <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-xl flex items-center justify-between gap-4 text-rose-300 text-sm font-medium">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
              <span>
                <strong className="text-white font-bold">Monthly AI Quota Exhausted (100%).</strong> External large language models are currently redirected to the zero-key deterministic heuristic engine.
              </span>
            </div>
            <a href="/billing" className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-all shrink-0">
              Upgrade Plan
            </a>
          </div>
        )}

        {isEmptyUsage && !p.isUnlimited && (
          <div className="p-3.5 bg-purple-950/20 border border-purple-500/30 rounded-xl flex items-center gap-3 text-purple-300 text-sm font-medium">
            <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0" />
            <span>
              <strong className="text-white">0 AI tokens consumed this cycle.</strong> Your monthly allocation of {p.aiTokenLimit.toLocaleString()} tokens is fully available for AI synthesis.
            </span>
          </div>
        )}

        {/* Section A: Persisted Database Telemetry */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-purple-300">
              <BarChart3 className="h-4 w-4" /> Persisted Database Telemetry (Historical)
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <Calendar className="h-3.5 w-3.5" /> Cycle: {formatDate(p.billingPeriodStart)} — {formatDate(p.billingPeriodEnd)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Tokens vs Limit Card */}
            <div className="p-4 bg-gray-900/70 border border-gray-800/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                <span>Total AI Tokens Used</span>
                <Zap className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-2">
                {p.totalTokens.toLocaleString()}
                <span className="text-xs font-semibold text-gray-400">
                  / {p.isUnlimited ? "Unlimited" : p.aiTokenLimit.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getProgressColor(p.usagePercentage)}`}
                  style={{ width: `${p.isUnlimited ? 100 : Math.min(100, p.usagePercentage ?? 0)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 pt-0.5">
                <span>Usage: {p.isUnlimited ? "Unlimited Tier" : `${p.usagePercentage}%`}</span>
                <span>Remaining: {p.isUnlimited ? <span className="inline-flex items-center gap-0.5"><InfinityIcon className="h-3 w-3" /> ∞</span> : p.remainingTokens?.toLocaleString()}</span>
              </div>
            </div>

            {/* Prompt vs Completion Breakdown Card */}
            <div className="p-4 bg-gray-900/70 border border-gray-800/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                <span>Token Flow Breakdown</span>
                <Cpu className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 bg-gray-950/50 rounded-lg border border-gray-800/60">
                  <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Prompt (In)</span>
                  <span className="text-base font-bold text-cyan-300 mt-0.5 block">{p.aiPromptTokens.toLocaleString()}</span>
                </div>
                <div className="p-2.5 bg-gray-950/50 rounded-lg border border-gray-800/60">
                  <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Completion (Out)</span>
                  <span className="text-base font-bold text-purple-300 mt-0.5 block">{p.aiCompletionTokens.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-[11px] text-gray-400 text-center">
                Ratio: {p.totalTokens > 0 ? `${Math.round((p.aiPromptTokens / p.totalTokens) * 100)}% Input / ${Math.round((p.aiCompletionTokens / p.totalTokens) * 100)}% Output` : "No activity"}
              </div>
            </div>

            {/* Cost Estimate Card */}
            <div className="p-4 bg-gray-900/70 border border-gray-800/80 rounded-xl space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                  <span>Total Estimated Value</span>
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white tracking-tight mt-1">
                  ${p.totalEstimatedCostUsd} <span className="text-xs font-semibold text-gray-400">USD</span>
                </div>
              </div>
              <div className="text-xs text-gray-400 pt-2 border-t border-gray-800/60 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Computed at API baseline rates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section B: Real-Time AI Provider Health */}
      <div className="p-6 bg-gray-900/60 border border-gray-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" /> Runtime Provider Health & Circuit State
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Live circuit breakers monitoring API health, automatic failover thresholds, and availability across orchestrator backends.
            </p>
          </div>
          <span className="text-xs text-gray-400 font-mono hidden md:block">
            Updated: {new Date(rh.timestamp).toLocaleTimeString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {rh.providers.map((provider) => {
            const isClosed = provider.circuitState === "closed";
            const isOpen = provider.circuitState === "open";

            return (
              <div key={provider.providerId} className="p-4 bg-gray-950/60 border border-gray-800/80 rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-sm text-white">{provider.name}</div>
                  <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${
                    isClosed
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : isOpen
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}>
                    {provider.circuitState.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-400 border-t border-gray-800/60 pt-2.5">
                  <div className="flex items-center justify-between">
                    <span>API Credentials:</span>
                    <span className={`font-semibold ${provider.isAvailable ? "text-emerald-400" : "text-gray-500"}`}>
                      {provider.isAvailable ? "Configured" : "Unconfigured"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Circuit Health:</span>
                    <span className={`font-semibold ${provider.isHealthy ? "text-emerald-400" : "text-rose-400"}`}>
                      {provider.isHealthy ? "Healthy" : "Tripped"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Consecutive Failures:</span>
                    <span className={`font-mono font-bold ${provider.consecutiveFailures > 0 ? "text-amber-400" : "text-gray-400"}`}>
                      {provider.consecutiveFailures} / 3
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
