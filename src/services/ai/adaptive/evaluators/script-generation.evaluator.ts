import type { ReelContentPackage } from "@/types/script-generation";
import type { IHeuristicEvaluator, HeuristicEvaluation } from "../heuristic.interface";
import { getAdaptiveConfig } from "@/config/adaptive.config";

export class ScriptGenerationEvaluator implements IHeuristicEvaluator<ReelContentPackage> {
  public evaluate(data: ReelContentPackage): HeuristicEvaluation {
    const config = getAdaptiveConfig().domains["script-generation"];
    const penalties = config?.penalties || {};
    let score = 100;
    const failedRules: string[] = [];

    // Basic structural checks (0-token deterministic)

    // Check 1: Missing Hook
    if (!data.hook || !data.hook.voiceover || data.hook.voiceover.trim().length === 0) {
      score -= penalties.MISSING_HOOK || 15;
      failedRules.push("MISSING_HOOK: The script is missing a compelling hook.");
    }

    // Check 2: Invalid Pacing (Must have scenes)
    if (!data.scenes || data.scenes.length === 0) {
      score -= penalties.INVALID_PACING || 10;
      failedRules.push("INVALID_PACING: The script scenes are empty or malformed.");
    }

    // Check 3: Missing CTA
    if (!data.cta || !data.cta.primaryCTA || data.cta.primaryCTA.trim().length === 0) {
      score -= penalties.MISSING_CTA || 5;
      failedRules.push("MISSING_CTA: The script is missing a Call to Action (CTA).");
    }

    // Check 4: Under Word Count (Naive approximation via string length, assuming ~5 chars per word)
    const totalLength = [
      data.hook?.voiceover || "",
      ...(data.scenes || []).map(b => b.voiceover),
      data.cta?.primaryCTA || ""
    ].join(" ").length;
    
    // Minimum 20 words roughly ~100 characters
    if (totalLength < 100) {
      score -= penalties.UNDER_WORD_COUNT || 10;
      failedRules.push("UNDER_WORD_COUNT: The generated script is too short to be effective.");
    }

    return {
      score: Math.max(0, score),
      failedRules,
    };
  }
}
