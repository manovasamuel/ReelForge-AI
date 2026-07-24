/**
 * Types and interfaces for the Interactive Studio Copilot.
 */

export type RevisionNodeType = "hook" | "cta" | "caption" | "scene" | "shot" | "repurpose-package" | "unknown";

export interface RevisionSession {
  sessionId: string;
  projectId: string;
  startedAt: string;
  revisionCount: number;
}

export interface CopilotRevisionRequest {
  sessionId: string;
  projectId: string;
  nodePath: string; // e.g., "repurpose.linkedin.post" or "script.scenes[1]"
  nodeType: RevisionNodeType;
  instruction: string;
  contextMode: "minimal" | "full";
}

export interface RevisionDiff {
  original: any;
  revised: any;
  changes: Array<{
    path: string;
    oldValue: any;
    newValue: any;
    type: "added" | "removed" | "modified";
  }>;
}

export interface PreparedRevisionRequest {
  session: { sessionId: string; projectId: string };
  routing: { tier: number; model: string };
  targetNode: any;
  contextSummary: string;
  prompt: import("@/services/ai/provider.interface").AIPromptPayload<any>;
}

export interface RevisionResult<T = any> {
  sessionId?: string;
  revisionId?: string;
  success: boolean;
  revisedNode?: T;
  diff?: RevisionDiff;
  validation: {
    passed: boolean;
    confidence: "high" | "medium" | "low";
    errors?: string[];
  };
  telemetry: {
    modelUsed: string;
    durationMs: number;
    tokensSaved: number;
  };
  warnings: string[];
  errors: string[];
}
