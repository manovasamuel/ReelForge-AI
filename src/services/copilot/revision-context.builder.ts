import type { SavedProject } from "@/types/project";
import type { CopilotRevisionRequest } from "@/types/copilot";
import { AppError } from "@/lib/errors";

export class NodeResolutionError extends AppError {
  constructor(message: string) {
    super(message, "NODE_RESOLUTION_ERROR", 400);
    this.name = "NodeResolutionError";
  }
}

export interface ResolvedRevisionContext {
  targetNode: any;
  summary: string;
}

export class RevisionContextBuilder {
  
  /**
   * Safely resolves a node path against the project state.
   * Format supports dot notation and array indexing: "scriptPackage.scenes[1]"
   */
  public static resolveNode(project: SavedProject, nodePath: string): any {
    if (!nodePath) {
      throw new NodeResolutionError("nodePath is required");
    }

    const state = project.state;
    if (!state) {
      throw new NodeResolutionError("Project state is empty");
    }

    try {
      // Normalize array brackets to dots for uniform splitting
      // e.g. "scriptPackage.scenes[1]" -> "scriptPackage.scenes.1"
      const normalizedPath = nodePath.replace(/\[(\d+)\]/g, ".$1");
      const parts = normalizedPath.split(".");
      
      let current: any = state;
      for (const part of parts) {
        if (current === null || current === undefined) {
           throw new NodeResolutionError(`Path '${nodePath}' could not be fully resolved. Broken at '${part}'.`);
        }
        current = current[part];
      }
      
      if (current === undefined) {
         throw new NodeResolutionError(`Target node at path '${nodePath}' is undefined.`);
      }

      return current;
    } catch (err) {
      if (err instanceof NodeResolutionError) throw err;
      throw new NodeResolutionError(`Failed to resolve nodePath '${nodePath}'`);
    }
  }

  /**
   * Builds a minimal contextual summary to help the LLM understand the surrounding content
   * without consuming large token budgets.
   */
  public static buildSummary(project: SavedProject, request: CopilotRevisionRequest): string {
    const { state } = project;
    let summary = "";
    
    // Determine context based on the nodeType
    if (request.nodeType === "scene" || request.nodeType === "hook" || request.nodeType === "cta" || request.nodeType === "shot") {
      summary += "--- SCRIPT CONTEXT ---\n";
      summary += `Brand/Niche: ${state.brandReport?.industry || "Unknown"}\n`;
      if (state.scriptPackage) {
        summary += `Overall Goal: ${state.scriptPackage.strategy.contentGoal}\n`;
        summary += `Target Audience: ${state.scriptPackage.strategy.targetAudience}\n`;
        summary += `Emotion: ${state.scriptPackage.strategy.emotion}\n`;
        summary += `Reel Title: ${state.scriptPackage.reelIdea.title}\n`;
      }
    } else if (request.nodeType === "repurpose-package" || request.nodeType === "caption") {
      summary += "--- REPURPOSE CONTEXT ---\n";
      if (state.scriptPackage) {
         summary += `Original Reel Title: ${state.scriptPackage.reelIdea.title}\n`;
         summary += `Original Hook: ${state.scriptPackage.hook.firstSentence}\n`;
      }
    }

    if (request.contextMode === "full" && state.contentDNA) {
      summary += "\n--- CONTENT DNA ---\n";
      summary += `Dominant Hook: ${state.contentDNA.snapshot.dominantHook}\n`;
      summary += `Dominant Psychology: ${state.contentDNA.snapshot.dominantPsychology}\n`;
    }

    return summary;
  }

  public static build(project: SavedProject, request: CopilotRevisionRequest): ResolvedRevisionContext {
    const targetNode = this.resolveNode(project, request.nodePath);
    const summary = this.buildSummary(project, request);
    
    return {
      targetNode,
      summary
    };
  }
}
