"use client";

import { useRouter } from "next/navigation";
import { PageContainer, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import {
  Users,
  Search,
  BarChart3,
  Sparkles,
  ArrowRight,
  Film,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";

const WORKFLOW_STEPS = [
  {
    step: 1,
    icon: Search,
    title: "Paste Profile URL",
    description: "Enter any Instagram profile URL to start analysis",
  },
  {
    step: 2,
    icon: Users,
    title: "Discover Competitors",
    description: "AI identifies relevant competitors in your niche",
  },
  {
    step: 3,
    icon: BarChart3,
    title: "Analyze Top Reels",
    description: "Deep-dive into the top 10 performing reels",
  },
  {
    step: 4,
    icon: Target,
    title: "Extract Patterns",
    description: "Uncover hooks, formats, and strategies that work",
  },
  {
    step: 5,
    icon: Sparkles,
    title: "Generate Content",
    description: "AI creates full content packages with reasoning",
  },
  {
    step: 6,
    icon: TrendingUp,
    title: "Repurpose Everywhere",
    description: "Adapt to LinkedIn, X, Facebook, Threads & YouTube",
  },
];

const STATS = [
  {
    label: "Profiles Analyzed",
    value: "0",
    icon: Users,
    color: "from-violet-500 to-purple-600",
  },
  {
    label: "Reels Studied",
    value: "0",
    icon: Film,
    color: "from-fuchsia-500 to-pink-600",
  },
  {
    label: "Patterns Found",
    value: "0",
    icon: Zap,
    color: "from-amber-500 to-orange-600",
  },
  {
    label: "Content Generated",
    value: "0",
    icon: Sparkles,
    color: "from-emerald-500 to-teal-600",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <PageContainer>
      <PageHeader
        title="Welcome to ReelForge AI"
        description="Analyze competitors, extract patterns, and generate Instagram content powered by AI."
      >
        <Button
          onClick={() => router.push(ROUTES.PROFILES)}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40"
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </PageHeader>

      {/* Stats Grid */}
      <div className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="relative overflow-hidden border-border/50 bg-card/50 p-4 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
              {/* Subtle gradient overlay */}
              <div
                className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${stat.color} opacity-5 blur-2xl`}
              />
            </Card>
          );
        })}
      </div>

      {/* Workflow */}
      <div className="mb-8">
        <h2 className="mb-6 text-lg font-semibold text-foreground">
          How It Works
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {WORKFLOW_STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.step}
                className="group relative overflow-hidden border-border/50 bg-card/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30 hover:bg-card/80"
              >
                {/* Step number */}
                <div className="absolute right-4 top-4 text-4xl font-black text-foreground/[0.03]">
                  {String(item.step).padStart(2, "0")}
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 transition-colors group-hover:bg-violet-500/20">
                    <Icon className="h-5 w-5 text-violet-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Connector line (except last in row) */}
                {index < WORKFLOW_STEPS.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-gradient-to-r from-violet-500/20 to-transparent lg:block" />
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick action */}
      <Card className="border-dashed border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 p-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">
              Ready to analyze?
            </h3>
            <p className="text-sm text-muted-foreground">
              Paste an Instagram profile URL and let AI do the heavy lifting.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.PROFILES)}
            className="shrink-0 border-violet-500/20 hover:border-violet-500/40 hover:bg-violet-500/10"
          >
            Analyze Profile
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
}
