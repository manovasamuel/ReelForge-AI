import systemModules from "./system.json";
import industryModules from "./industry.json";
import hookModules from "./hook.json";
import frameworkModules from "./framework.json";
import toneModules from "./tone.json";
import ctaModules from "./cta.json";
import constraintsModules from "./constraints.json";
import examplesModules from "./examples.json";

export interface PromptModuleDefinition {
  id: string;
  name: string;
  category: "system" | "industry" | "hook" | "framework" | "tone" | "cta" | "constraints" | "examples";
  template: string;
  requiredVariables: string[];
  version: string;
}

export const PROMPT_LIBRARY: Record<string, Record<string, PromptModuleDefinition>> = {
  system: systemModules as Record<string, PromptModuleDefinition>,
  industry: industryModules as Record<string, PromptModuleDefinition>,
  hook: hookModules as Record<string, PromptModuleDefinition>,
  framework: frameworkModules as Record<string, PromptModuleDefinition>,
  tone: toneModules as Record<string, PromptModuleDefinition>,
  cta: ctaModules as Record<string, PromptModuleDefinition>,
  constraints: constraintsModules as Record<string, PromptModuleDefinition>,
  examples: examplesModules as Record<string, PromptModuleDefinition>,
};
