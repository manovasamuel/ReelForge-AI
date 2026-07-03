"use client";

import { Check, CircleDot, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkflowStepId =
  | "profile"
  | "brand"
  | "competitors"
  | "competitor-analysis"
  | "reel-intelligence"
  | "pattern-engine"
  | "strategy"
  | "script-generation";

interface StepConfig {
  id: WorkflowStepId;
  label: string;
  phase: number;
}

const STEPS: StepConfig[] = [
  { id: "profile", label: "Profile", phase: 1 },
  { id: "brand", label: "Brand", phase: 2 },
  { id: "competitors", label: "Competitors", phase: 3 },
  { id: "competitor-analysis", label: "Competitor Analysis", phase: 4 },
  { id: "reel-intelligence", label: "Reel Intelligence", phase: 4 },
  { id: "pattern-engine", label: "Pattern Engine", phase: 4 },
  { id: "strategy", label: "Strategy", phase: 5 },
  { id: "script-generation", label: "Script Generation", phase: 5 },
];

interface WorkflowTrackerProps {
  completedSteps: WorkflowStepId[];
  activeStep: WorkflowStepId;
}

export function WorkflowTracker({ completedSteps, activeStep }: WorkflowTrackerProps) {
  return (
    <nav
      aria-label="Intelligence workflow progress"
      className="sticky top-0 z-30 -mx-4 mb-8 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-md sm:-mx-8 sm:px-8"
    >
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {STEPS.map((step, idx) => {
          const isCompleted = completedSteps.includes(step.id);
          const isActive = activeStep === step.id;
          const isDisabled = !isCompleted && !isActive;

          return (
            <div key={step.id} className="flex shrink-0 items-center gap-2">
              <div
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                  isActive && "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/25 ring-2 ring-violet-400/30",
                  isCompleted && !isActive && "bg-violet-500/15 text-violet-300 border border-violet-500/30",
                  isDisabled && "bg-muted/30 text-muted-foreground/50 border border-transparent cursor-not-allowed"
                )}
              >
                {/* Status icon */}
                {isCompleted && !isActive ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                ) : isActive ? (
                  <CircleDot className="h-3.5 w-3.5 shrink-0 animate-pulse text-white" />
                ) : (
                  <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                )}

                <span>{step.label}</span>
              </div>

              {/* Connecting line */}
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-[2px] w-4 shrink-0 rounded-full transition-colors",
                    isCompleted ? "bg-violet-500/40" : "bg-border/40"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
