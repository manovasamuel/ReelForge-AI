"use client";

import React from "react";
import { AppearancePreferences, ThemeMode, AccentColor } from "@/types/settings";
import { Moon, Sun, Laptop, Palette, Check } from "lucide-react";

interface AppearanceSectionProps {
  preferences: AppearancePreferences;
  onChange: (updated: Partial<AppearancePreferences>) => void;
}

export function AppearanceSection({ preferences, onChange }: AppearanceSectionProps) {
  const themes: { id: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "dark", label: "Dark Mode", icon: <Moon className="h-5 w-5" />, desc: "Sleek dark glassmorphism (Recommended)" },
    { id: "light", label: "Light Mode", icon: <Sun className="h-5 w-5" />, desc: "Clean bright contrast studio theme" },
    { id: "system", label: "System Sync", icon: <Laptop className="h-5 w-5" />, desc: "Follow active OS preference automatically" },
  ];

  const accents: { id: AccentColor; label: string; colorClass: string; borderClass: string }[] = [
    { id: "purple", label: "ReelForge Purple", colorClass: "bg-purple-600", borderClass: "border-purple-500" },
    { id: "blue", label: "Electric Blue", colorClass: "bg-blue-600", borderClass: "border-blue-500" },
    { id: "emerald", label: "Studio Emerald", colorClass: "bg-emerald-600", borderClass: "border-emerald-500" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <Moon className="h-5 w-5 text-purple-400" /> Color Theme
        </h3>
        <p className="text-sm text-gray-400 mb-4">Select the core UI illumination scheme across all studio dashboards.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((t) => {
            const active = preferences.theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onChange({ theme: t.id })}
                className={`p-4 rounded-xl border text-left transition-all duration-200 relative ${
                  active
                    ? "bg-purple-900/40 border-purple-500 text-white shadow-lg shadow-purple-500/10"
                    : "bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-gray-800/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-semibold">
                    {t.icon}
                    {t.label}
                  </div>
                  {active && <Check className="h-4 w-4 text-purple-400" />}
                </div>
                <p className="text-xs text-gray-400">{t.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-800 pt-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <Palette className="h-5 w-5 text-purple-400" /> Brand Accent Color
        </h3>
        <p className="text-sm text-gray-400 mb-4">Controls active highlights, CTA borders, and focus rings.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accents.map((a) => {
            const active = preferences.accentColor === a.id;
            return (
              <button
                key={a.id}
                onClick={() => onChange({ accentColor: a.id })}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                  active
                    ? `bg-gray-900/90 ${a.borderClass} text-white shadow-md`
                    : "bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`h-6 w-6 rounded-full ${a.colorClass} shadow-inner flex items-center justify-center`}>
                    {active && <Check className="h-3.5 w-3.5 text-white" />}
                  </span>
                  <span className="font-semibold text-sm">{a.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
