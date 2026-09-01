"use client";

import React from "react";
import { AppearancePreferences, ThemeMode, AccentColor } from "@/types/settings";
import { Moon, Sun, Laptop, Palette, Check } from "lucide-react";
import { useTheme } from "next-themes";

interface AppearanceSectionProps {
  preferences: AppearancePreferences;
  onChange: (updated: Partial<AppearancePreferences>) => void;
}

export function AppearanceSection({ preferences, onChange }: AppearanceSectionProps) {
  const { setTheme } = useTheme();
  const themes: { id: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "dark", label: "Dark Mode", icon: <Moon className="h-5 w-5" />, desc: "High contrast dark environment" },
    { id: "light", label: "Light Mode", icon: <Sun className="h-5 w-5" />, desc: "Clean bright contrast studio theme" },
    { id: "system", label: "System Sync", icon: <Laptop className="h-5 w-5" />, desc: "Follow active OS preference automatically" },
  ];

  const accents: { id: AccentColor; label: string; colorClass: string; borderClass: string }[] = [
    { id: "default", label: "Monochrome (Default)", colorClass: "bg-primary", borderClass: "border-primary" },
    { id: "zinc", label: "Zinc Metal", colorClass: "bg-zinc-500", borderClass: "border-border" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
          <Moon className="h-5 w-5 text-muted-foreground" /> Color Theme
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Select the core UI illumination scheme across all studio dashboards.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((t) => {
            const active = preferences.theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  onChange({ theme: t.id });
                  setTheme(t.id);
                }}
                className={`p-4 rounded-md border text-left transition-all duration-200 relative ${
                  active
                    ? "bg-card border-primary text-foreground shadow-sm ring-1 ring-primary"
                    : "bg-muted/50 border-border text-muted-foreground hover:border-primary/50 hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-semibold">
                    {t.icon}
                    {t.label}
                  </div>
                  {active && <Check className="h-4 w-4 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
          <Palette className="h-5 w-5 text-muted-foreground" /> Brand Accent Color
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Controls active highlights, CTA borders, and focus rings.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accents.map((a) => {
            const active = preferences.accentColor === a.id;
            return (
              <button
                key={a.id}
                onClick={() => onChange({ accentColor: a.id })}
                className={`p-4 rounded-md border flex items-center justify-between transition-all duration-200 ${
                  active
                    ? `bg-card border-primary text-foreground shadow-sm ring-1 ring-primary`
                    : "bg-muted/50 border-border text-muted-foreground hover:border-primary/50 hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`h-6 w-6 rounded-full ${a.colorClass} shadow-sm flex items-center justify-center`}>
                    {active && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
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
