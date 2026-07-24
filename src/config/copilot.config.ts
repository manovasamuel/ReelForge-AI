import { RevisionNodeType } from "@/types/copilot";

export interface CopilotRoutingConfig {
  fastModel: string;
  standardModel: string;
  premiumModel: string;
}

export interface CopilotConfig {
  enabled: boolean;
  routing: CopilotRoutingConfig;
  defaultContextMode: "minimal" | "full";
  // Maps the node type to the preferred routing tier (1: Fast, 2: Standard, 3: Premium)
  routingMap: Record<RevisionNodeType, 1 | 2 | 3>;
}

export const defaultCopilotConfig: CopilotConfig = {
  enabled: true,
  routing: {
    fastModel: "gemini-3.1-flash-lite", // or gpt-4o-mini
    standardModel: "gemini-2.5-pro",
    premiumModel: "claude-3-5-sonnet", // or gpt-4o
  },
  defaultContextMode: "minimal",
  routingMap: {
    "hook": 1,
    "cta": 1,
    "caption": 1,
    "scene": 2,
    "shot": 1,
    "repurpose-package": 3,
    "unknown": 2,
  }
};

export function getCopilotConfig(): CopilotConfig {
  return defaultCopilotConfig;
}
