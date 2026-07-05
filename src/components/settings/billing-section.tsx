"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, Check, Sparkles, Zap, Shield, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";
import type { IBillingSummary, PlanId } from "@/services/billing/plan.interface";

export function BillingSection() {
  const [summary, setSummary] = useState<IBillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<PlanId | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/summary");
      const json = await res.json();
      if (res.ok && json.data) {
        setSummary(json.data);
      } else {
        setError(json.error || "Failed to load billing summary");
      }
    } catch (err) {
      setError("Network error loading billing data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleUpgrade = async (planId: PlanId) => {
    setCheckoutLoading(planId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const json = await res.json();
      if (res.ok && json.data?.url) {
        window.location.href = json.data.url;
      } else {
        alert(json.error || "Failed to initiate Stripe Checkout");
      }
    } catch (err) {
      alert("Error initiating checkout.");
      console.error(err);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const json = await res.json();
      if (res.ok && json.data?.url) {
        window.location.href = json.data.url;
      } else {
        alert(json.error || "Failed to open Stripe Customer Portal");
      }
    } catch (err) {
      alert("Error opening customer portal.");
      console.error(err);
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading subscription and usage metering data...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-500/30 rounded-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-red-300">Billing Data Unavailable</h4>
            <p className="text-xs text-red-400/80">{error || "Could not retrieve current billing cycle details."}</p>
          </div>
        </div>
        <button
          onClick={fetchSummary}
          className="px-4 py-2 text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { plan, subscription, usage } = summary;

  // Calculate percentage gauges
  const scraperPercent = plan.monthlyScraperLimit === -1
    ? 0
    : Math.min(100, Math.round((usage.scraperCallsCount / plan.monthlyScraperLimit) * 100));

  const aiPercent = plan.monthlyAiTokenLimit === -1
    ? 0
    : Math.min(100, Math.round((usage.totalTokens / plan.monthlyAiTokenLimit) * 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. CURRENT SUBSCRIPTION BANNER */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-800 border border-slate-700/60 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full shadow-md shadow-cyan-500/20">
                {plan.name}
              </span>
              <span className="text-xs font-medium text-emerald-400 flex items-center bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping mr-1.5" />
                {subscription?.status || "Active"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {plan.id === "free" ? "Free Discovery Tier" : plan.id === "pro" ? "Pro Creator Engine" : "Enterprise VIP Suite"}
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              {plan.id === "free"
                ? "You are currently on the baseline tier with standard deterministic fallbacks and introductory AI/Scraper quotas."
                : "You have full access to multi-model AI synthesis, priority queue scraping, and cloud workspace synchronization."}
            </p>
          </div>

          <div className="flex flex-col sm:items-end justify-center shrink-0">
            <div className="text-3xl font-extrabold text-white">
              ${plan.priceUsd} <span className="text-xs font-normal text-slate-400">/ month</span>
            </div>
            {subscription?.currentPeriodEnd && (
              <p className="text-xs text-slate-400 mt-1">
                Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
            {subscription?.stripeCustomerId && (
              <button
                onClick={handleOpenPortal}
                disabled={portalLoading}
                className="mt-3 inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl transition-all shadow-sm"
              >
                {portalLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> : <ExternalLink className="w-3.5 h-3.5 mr-1" />}
                Manage Subscription
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME USAGE & METERING GAUGES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scraper Calls Gauge */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Instagram Scraper Calls</h3>
                <p className="text-xs text-slate-400">Live profiles & video metadata analyzed</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">
              {plan.monthlyScraperLimit === -1 ? "Unlimited" : `${scraperPercent}%`}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">{usage.scraperCallsCount} calls used</span>
              <span className="text-slate-500">{plan.monthlyScraperLimit === -1 ? "∞" : `${plan.monthlyScraperLimit} max`}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  scraperPercent > 90 ? "bg-red-500" : scraperPercent > 70 ? "bg-amber-500" : "bg-cyan-500"
                }`}
                style={{ width: `${plan.monthlyScraperLimit === -1 ? 100 : scraperPercent}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            When quota is exceeded, requests automatically fall back to the Mock Instagram Provider without blocking your workflow.
          </p>
        </div>

        {/* AI Tokens Gauge */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Token Consumption</h3>
                <p className="text-xs text-slate-400">Gemini, OpenAI, & Claude synthesis</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">
              {plan.monthlyAiTokenLimit === -1 ? "Unlimited" : `${aiPercent}%`}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">{usage.totalTokens.toLocaleString()} tokens used</span>
              <span className="text-slate-500">{plan.monthlyAiTokenLimit === -1 ? "∞" : `${plan.monthlyAiTokenLimit.toLocaleString()} max`}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  aiPercent > 90 ? "bg-red-500" : aiPercent > 70 ? "bg-amber-500" : "bg-purple-500"
                }`}
                style={{ width: `${plan.monthlyAiTokenLimit === -1 ? 100 : aiPercent}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            When token budget is exhausted, requests seamlessly transition to the Deterministic Heuristic Engine.
          </p>
        </div>
      </div>

      {/* 3. PLAN COMPARISON & UPGRADE GRID */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Shield className="w-5 h-5 mr-2 text-cyan-400" />
          Available Subscription Tiers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Tier */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
            plan.id === "free" ? "bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-500/5" : "bg-slate-900/40 border-slate-800"
          }`}>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-bold text-white">Free Discovery</h4>
                  <p className="text-xs text-slate-400">For beginners & evaluation</p>
                </div>
                <span className="text-lg font-extrabold text-white">$0</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> 20 Scraper Calls / mo</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> 10k AI Tokens / mo</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Deterministic Engine</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Standard Exports</li>
              </ul>
            </div>
            <div className="mt-6">
              {plan.id === "free" ? (
                <span className="w-full py-2.5 px-4 text-xs font-bold text-center block rounded-xl bg-slate-800 text-slate-400 border border-slate-700">
                  Current Active Plan
                </span>
              ) : (
                <button
                  onClick={handleOpenPortal}
                  className="w-full py-2.5 px-4 text-xs font-bold text-center block rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  Downgrade to Free
                </button>
              )}
            </div>
          </div>

          {/* Pro Tier */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all relative overflow-hidden ${
            plan.id === "pro" ? "bg-slate-900/90 border-cyan-500 shadow-xl shadow-cyan-500/10" : "bg-slate-900/60 border-cyan-500/40"
          }`}>
            <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-500 to-blue-500 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl shadow-sm">
              Popular
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-bold text-white">Pro Creator</h4>
                  <p className="text-xs text-slate-400">For active viral creators</p>
                </div>
                <span className="text-lg font-extrabold text-white">$29 <span className="text-xs font-normal text-slate-400">/mo</span></span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center"><Check className="w-4 h-4 text-cyan-400 mr-2 shrink-0" /> 500 Scraper Calls / mo</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-cyan-400 mr-2 shrink-0" /> 500k AI Tokens / mo</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-cyan-400 mr-2 shrink-0" /> Multi-Model AI (Gemini, OpenAI, Claude)</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-cyan-400 mr-2 shrink-0" /> Priority Scraper Queue</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-cyan-400 mr-2 shrink-0" /> Cloud Workspace Sync</li>
              </ul>
            </div>
            <div className="mt-6">
              {plan.id === "pro" ? (
                <span className="w-full py-2.5 px-4 text-xs font-bold text-center block rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Current Active Plan
                </span>
              ) : (
                <button
                  onClick={() => handleUpgrade("pro")}
                  disabled={checkoutLoading === "pro"}
                  className="w-full py-2.5 px-4 text-xs font-bold text-center flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all shadow-md shadow-cyan-500/20"
                >
                  {checkoutLoading === "pro" ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>

          {/* Enterprise Tier */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
            plan.id === "enterprise" ? "bg-slate-900/90 border-purple-500 shadow-xl shadow-purple-500/10" : "bg-slate-900/40 border-purple-500/30"
          }`}>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-bold text-white">Enterprise & Agency</h4>
                  <p className="text-xs text-slate-400">For scaling social teams</p>
                </div>
                <span className="text-lg font-extrabold text-white">$199 <span className="text-xs font-normal text-slate-400">/mo</span></span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center"><Check className="w-4 h-4 text-purple-400 mr-2 shrink-0" /> Unlimited Scraper Calls</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-purple-400 mr-2 shrink-0" /> Unlimited AI Tokens & Fine-Tuning</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-purple-400 mr-2 shrink-0" /> VIP Priority Processing</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-purple-400 mr-2 shrink-0" /> Dedicated Account Manager</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-purple-400 mr-2 shrink-0" /> White-Label Exports</li>
              </ul>
            </div>
            <div className="mt-6">
              {plan.id === "enterprise" ? (
                <span className="w-full py-2.5 px-4 text-xs font-bold text-center block rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Current Active Plan
                </span>
              ) : (
                <button
                  onClick={() => handleUpgrade("enterprise")}
                  disabled={checkoutLoading === "enterprise"}
                  className="w-full py-2.5 px-4 text-xs font-bold text-center flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-purple-500/20"
                >
                  {checkoutLoading === "enterprise" ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                  Subscribe to Enterprise
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
