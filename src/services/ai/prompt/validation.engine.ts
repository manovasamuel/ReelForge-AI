import type { PromptModuleDefinition } from "../library";
import { PromptVariableResolver } from "./variable.resolver";

export interface PromptValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    charCount: number;
    wordCount: number;
    moduleCount: number;
  };
}

/**
 * Prompt Validation Engine — ReelForge AI v2.1 Phase 7.3.
 *
 * Validates prompt integrity before transmission to AI models.
 * Checks for required variables, missing sections, duplicate modules,
 * prompt length constraints, and unresolved placeholders.
 *
 * Returns structured validation results internally instead of failing unexpectedly.
 */
export class PromptValidationEngine {
  /**
   * Performs comprehensive validation on the compiled prompt text and loaded modules.
   */
  public static validate(
    compiledText: string,
    loadedModules: PromptModuleDefinition[],
    variables: Record<string, any>
  ): PromptValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Check Required Variables
    for (const mod of loadedModules) {
      if (mod.requiredVariables && Array.isArray(mod.requiredVariables)) {
        for (const reqVar of mod.requiredVariables) {
          const val = PromptVariableResolver.getVariableValue(reqVar, variables);
          if (val === undefined || val === null || val === "") {
            errors.push(`Missing required variable '${reqVar}' required by module '${mod.id}' (${mod.category}).`);
          }
        }
      }
    }

    // 2. Check Missing Sections
    const loadedCategories = new Set(loadedModules.map((m) => m.category));
    if (!loadedCategories.has("system")) {
      errors.push("Missing required prompt section: 'system' module was not loaded.");
    }
    if (!loadedCategories.has("tone")) {
      warnings.push("No tone module specified; prompt will rely on general default tone.");
    }
    if (!loadedCategories.has("constraints")) {
      warnings.push("No constraints module loaded; output formatting may be less predictable.");
    }

    // 3. Check Duplicate Modules
    const seenCategories = new Set<string>();
    const seenIds = new Set<string>();
    for (const mod of loadedModules) {
      if (seenCategories.has(mod.category)) {
        errors.push(`Duplicate module category loaded: '${mod.category}' (ID: '${mod.id}').`);
      }
      seenCategories.add(mod.category);

      const uniqueKey = `${mod.category}:${mod.id}`;
      if (seenIds.has(uniqueKey)) {
        errors.push(`Duplicate module loaded: '${uniqueKey}'.`);
      }
      seenIds.add(uniqueKey);
    }

    // 4. Check Prompt Length
    const charCount = compiledText.length;
    const wordCount = compiledText.trim().split(/\s+/).filter(Boolean).length;
    if (charCount > 30000) {
      errors.push(`Prompt length exceeds maximum safe context limit (${charCount.toLocaleString()} chars > 30,000 max).`);
    } else if (charCount > 15000) {
      warnings.push(`Prompt is very long (${charCount.toLocaleString()} chars); verify target AI provider context window.`);
    }
    if (wordCount === 0) {
      errors.push("Compiled prompt is empty.");
    }

    // 5. Check Unresolved Placeholders
    // Check for leftover {{...}} tags
    const unresolvedBraces = compiledText.match(/\{\{\s*[^}]+\s*\}\}/g);
    if (unresolvedBraces) {
      for (const tag of unresolvedBraces) {
        errors.push(`Unresolved template variable tag remaining in compiled prompt: '${tag}'.`);
      }
    }

    // Check for our explicit fallback marker [VAR_NOT_SPECIFIED]
    const unresolvedMarkers = compiledText.match(/\[([a-zA-Z0-9_.]+)_NOT_SPECIFIED\]/g);
    if (unresolvedMarkers) {
      for (const marker of unresolvedMarkers) {
        errors.push(`Unresolved variable placeholder in prompt: '${marker}'.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stats: {
        charCount,
        wordCount,
        moduleCount: loadedModules.length,
      },
    };
  }
}
