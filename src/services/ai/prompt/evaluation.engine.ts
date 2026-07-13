import type { PromptModuleDefinition } from "../library";
import type { PromptValidationResult } from "./validation.engine";

export interface PromptCategoryScores {
  clarity: number;
  completeness: number;
  structure: number;
  marketingStrength: number;
  psychologicalEffectiveness: number;
  ctaQuality: number;
  readability: number;
  tokenEfficiency: number;
  promptConsistency: number;
}

export interface PromptEvaluationReport {
  overallScore: number;
  categoryScores: PromptCategoryScores;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
}

/**
 * Prompt Evaluation Engine — ReelForge AI v2.1 Phase 7.4.
 *
 * Deterministic quality scoring engine that evaluates compiled prompts across
 * 9 critical dimensions: Clarity, Completeness, Structure, Marketing Strength,
 * Psychological Effectiveness, CTA Quality, Readability, Token Efficiency, and Consistency.
 *
 * Serves as the automated quality gate between the Prompt Compiler and AI Providers.
 */
export class PromptEvaluationEngine {
  /**
   * Evaluates prompt quality deterministically and generates a structured quality report.
   */
  public static evaluate(
    promptText: string,
    loadedModules: PromptModuleDefinition[],
    variables: Record<string, any>,
    validation?: PromptValidationResult
  ): PromptEvaluationReport {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    const lowerText = promptText.toLowerCase();
    const loadedCategories = new Set(loadedModules.map((m) => m.category));

    // 1. Clarity (0-100)
    let clarity = 70;
    if (validation && validation.valid && validation.errors.length === 0) {
      clarity += 15;
    } else if (validation && validation.errors.length > 0) {
      clarity -= 25;
      weaknesses.push("Prompt contains validation errors or unresolved placeholders.");
    }
    if (/\b(must|generate|analyze|return|output|strict|only)\b/i.test(promptText)) {
      clarity += 15;
    }
    clarity = Math.max(0, Math.min(100, clarity));
    if (clarity >= 85) {
      strengths.push("High instruction clarity with explicit imperative directives.");
    }

    // 2. Completeness (0-100)
    let completeness = 50;
    if (loadedCategories.has("system")) completeness += 15;
    if (loadedCategories.has("industry")) completeness += 10;
    if (loadedCategories.has("constraints")) completeness += 10;
    if (loadedCategories.has("examples")) completeness += 10;
    if (loadedCategories.has("tone")) completeness += 5;
    completeness = Math.max(0, Math.min(100, completeness));
    if (completeness >= 90) {
      strengths.push("Comprehensive context: includes system role, vertical data, constraints, and examples.");
    } else if (completeness < 70) {
      weaknesses.push("Missing foundational prompt modules (e.g. constraints or examples).");
      suggestions.push("Load additional prompt modules to enrich context for the AI model.");
    }

    // 3. Structure (0-100)
    let structure = 60;
    if (/<[a-z0-9_-]+>|###|---|```/i.test(promptText)) {
      structure += 20;
      strengths.push("Clean structural formatting using XML tags or markdown delimiters.");
    }
    if (/\n\n/.test(promptText)) {
      structure += 20;
    } else {
      structure -= 20;
      weaknesses.push("Dense prompt layout lacking clear section breaks.");
      suggestions.push("Separate distinct instructions and data blocks with double newlines.");
    }
    structure = Math.max(0, Math.min(100, structure));

    // 4. Marketing Strength (0-100)
    let marketingStrength = 60;
    if (loadedCategories.has("framework") || /\b(hormozi|pas|storybrand|aida|bab|value equation|offer|roi)\b/i.test(lowerText)) {
      marketingStrength += 20;
    }
    if (/\b(target audience|demographic|customer|conversion|lead|viral|retention)\b/i.test(lowerText)) {
      marketingStrength += 20;
    }
    marketingStrength = Math.max(0, Math.min(100, marketingStrength));
    if (marketingStrength >= 80) {
      strengths.push("Strong marketing potency leveraging proven copywriting frameworks.");
    } else {
      suggestions.push("Incorporate a copywriting framework module (e.g. Hormozi or PAS) to boost conversion appeal.");
    }

    // 5. Psychological Effectiveness (0-100)
    let psychologicalEffectiveness = 60;
    if (loadedCategories.has("hook") || /\b(curiosity|secret|hidden|authority|proven|fear|mistake|story|epiphany|contrarian)\b/i.test(lowerText)) {
      psychologicalEffectiveness += 25;
    }
    if (/\b(urgent|exclusive|guarantee|warning|mistake|breakthrough)\b/i.test(lowerText)) {
      psychologicalEffectiveness += 15;
    }
    psychologicalEffectiveness = Math.max(0, Math.min(100, psychologicalEffectiveness));
    if (psychologicalEffectiveness >= 80) {
      strengths.push("High psychological impact with strong viral hook and curiosity triggers.");
    }

    // 6. CTA Quality (0-100)
    let ctaQuality = 60;
    if (loadedCategories.has("cta") || /\b(comment|dm|link in bio|click|follow|save|share|download|keyword)\b/i.test(lowerText)) {
      ctaQuality += 25;
    }
    if (/\b(keyword|reply|send|guide|audit)\b/i.test(lowerText)) {
      ctaQuality += 15;
    }
    ctaQuality = Math.max(0, Math.min(100, ctaQuality));
    if (ctaQuality >= 80) {
      strengths.push("Clear, conversion-focused Call to Action (e.g. keyword comment DM capture).");
    } else {
      weaknesses.push("Call to Action instructions could be more specific or action-oriented.");
      suggestions.push("Specify exact keyword DM or engagement CTA instructions.");
    }

    // 7. Readability (0-100)
    let readability = 70;
    if (/[-*•]\s+|^\d+\.\s+/m.test(promptText)) {
      readability += 15;
    }
    const sentences = promptText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const words = promptText.trim().split(/\s+/).filter(Boolean);
    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 15;
    if (avgWordsPerSentence < 25) {
      readability += 15;
    } else {
      readability -= 15;
      weaknesses.push("Sentences are lengthy or complex, which may degrade model instruction adherence.");
    }
    readability = Math.max(0, Math.min(100, readability));

    // 8. Token Efficiency (0-100)
    let tokenEfficiency = 80;
    if (promptText.length > 15000) {
      tokenEfficiency -= 25;
      weaknesses.push("Prompt is lengthy (>15,000 characters); may consume excessive token budget.");
      suggestions.push("Apply automatic optimizer to trim unnecessary whitespace and redundant phrasing.");
    } else if (promptText.length > 10000) {
      tokenEfficiency -= 10;
    }
    if (!/\b(please note that|as an ai language model|thank you|it is very important to remember)\b/i.test(lowerText)) {
      tokenEfficiency += 20;
    }
    tokenEfficiency = Math.max(0, Math.min(100, tokenEfficiency));
    if (tokenEfficiency >= 85) {
      strengths.push("High token efficiency: concise phrasing without polite conversational bloat.");
    }

    // 9. Prompt Consistency (0-100)
    let promptConsistency = 80;
    if (validation && validation.valid) {
      promptConsistency += 20;
    }
    // Check for obvious tone contradictions
    if (/\bcalm\b/i.test(lowerText) && /\bhigh-energy\b/i.test(lowerText)) {
      promptConsistency -= 30;
      weaknesses.push("Contradictory tone instructions detected (e.g. calm vs. high-energy).");
      suggestions.push("Ensure selected tone modules align cleanly with brand identity.");
    }
    promptConsistency = Math.max(0, Math.min(100, promptConsistency));

    // Calculate overall weighted score
    const categoryScores: PromptCategoryScores = {
      clarity,
      completeness,
      structure,
      marketingStrength,
      psychologicalEffectiveness,
      ctaQuality,
      readability,
      tokenEfficiency,
      promptConsistency,
    };

    const overallScore = Math.round(
      (clarity * 1.3 +
        completeness * 1.2 +
        structure * 1.1 +
        marketingStrength * 1.2 +
        psychologicalEffectiveness * 1.2 +
        ctaQuality * 1.1 +
        readability * 1.0 +
        tokenEfficiency * 1.0 +
        promptConsistency * 1.1) /
        10.2
    );

    if (suggestions.length === 0) {
      suggestions.push("Prompt meets high quality standards across all evaluated dimensions.");
    }

    return {
      overallScore: Math.min(100, Math.max(0, overallScore)),
      categoryScores,
      strengths,
      weaknesses,
      improvementSuggestions: suggestions,
    };
  }
}
