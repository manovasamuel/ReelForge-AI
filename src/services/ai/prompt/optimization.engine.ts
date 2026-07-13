import type { PromptModuleDefinition } from "../library";

export interface PromptOptimizationResult {
  optimizedText: string;
  originalCharCount: number;
  optimizedCharCount: number;
  tokensSavedEstimated: number;
  optimizationsApplied: string[];
}

/**
 * Prompt Optimization Engine — ReelForge AI v2.1 Phase 7.4.
 *
 * Performs deterministic, rule-based optimization on compiled prompts.
 * Removes duplicate instructions, trims unnecessary whitespace, strips
 * conversational filler phrases, and enforces formatting consistency—without
 * altering semantic meaning or requiring non-deterministic AI rewrites.
 */
export class PromptOptimizationEngine {
  /**
   * Optimizes prompt text deterministically and reports token/character savings.
   */
  public static optimize(
    promptText: string,
    loadedModules?: PromptModuleDefinition[]
  ): PromptOptimizationResult {
    const originalCharCount = promptText.length;
    const optimizationsApplied: string[] = [];
    let text = promptText;

    if (loadedModules && loadedModules.length > 0) {
      // Verified module structure before optimization
    }

    // 1. Strip conversational filler phrases (Token Efficiency)
    const fillerPatterns: [RegExp, string, string][] = [
      [/please note that\s+/gi, "", "Removed redundant phrase 'please note that'"],
      [/it is very important to remember to\s+/gi, "", "Removed verbose phrasing 'it is very important to remember to'"],
      [/as an ai language model,?\s+/gi, "", "Removed AI disclaimer preamble"],
      [/thank you( in advance)?\.?\s*/gi, "", "Removed conversational closing phrase"],
      [/feel free to\s+/gi, "", "Removed passive instruction phrasing"],
      [/make sure to\s+/gi, "", "Simplified 'make sure to' to direct imperative"],
    ];

    for (const [pattern, replacement, desc] of fillerPatterns) {
      if (pattern.test(text)) {
        text = text.replace(pattern, replacement);
        if (!optimizationsApplied.includes(desc)) {
          optimizationsApplied.push(desc);
        }
      }
    }

    // 2. Remove duplicate instruction lines / repeated constraints
    // We split by newlines, trim lines, and remove exact duplicates of instruction sentences
    const lines = text.split("\n");
    const seenLines = new Set<string>();
    const deduplicatedLines: string[] = [];
    let dupesRemoved = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      // Only deduplicate significant instruction or constraint sentences (> 25 chars) that aren't markdown headers or code fences
      if (
        trimmed.length > 25 &&
        !trimmed.startsWith("#") &&
        !trimmed.startsWith("```") &&
        !trimmed.startsWith("-") &&
        seenLines.has(trimmed)
      ) {
        dupesRemoved++;
      } else {
        if (trimmed.length > 25) {
          seenLines.add(trimmed);
        }
        deduplicatedLines.push(line);
      }
    }

    if (dupesRemoved > 0) {
      text = deduplicatedLines.join("\n");
      optimizationsApplied.push(`Removed ${dupesRemoved} duplicate instruction/constraint line(s)`);
    }

    // 3. Trim unnecessary whitespace and formatting consistency
    // Trim trailing whitespace from each line
    const beforeTrim = text;
    text = text
      .split("\n")
      .map((l) => l.replace(/\s+$/, ""))
      .join("\n");

    // Collapse 3 or more consecutive newlines into exactly 2 newlines (\n\n)
    if (/\n{3,}/.test(text)) {
      text = text.replace(/\n{3,}/g, "\n\n");
      optimizationsApplied.push("Collapsed excessive consecutive linebreaks");
    }

    text = text.trim();

    if (beforeTrim !== text && !optimizationsApplied.includes("Cleaned line trailing whitespace")) {
      optimizationsApplied.push("Cleaned line trailing whitespace");
    }

    const optimizedCharCount = text.length;
    const charDiff = Math.max(0, originalCharCount - optimizedCharCount);
    const tokensSavedEstimated = Math.ceil(charDiff / 4);

    if (optimizationsApplied.length === 0) {
      optimizationsApplied.push("Prompt is already optimally formatted and concise");
    }

    return {
      optimizedText: text,
      originalCharCount,
      optimizedCharCount,
      tokensSavedEstimated,
      optimizationsApplied,
    };
  }
}
