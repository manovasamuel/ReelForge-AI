import type { AISchemaType } from "../provider.interface";
import type { IHeuristicEvaluator } from "./heuristic.interface";
import { ScriptGenerationEvaluator } from "./evaluators/script-generation.evaluator";

// Instantiate evaluators once
const scriptGenerationEvaluator = new ScriptGenerationEvaluator();

/**
 * Registry mapping AISchemaType to its specific deterministic heuristic evaluator.
 * Allows AIService to remain agnostic of concrete evaluator implementations.
 */
export function getHeuristicEvaluator(schemaType: AISchemaType): IHeuristicEvaluator<any> | null {
  switch (schemaType) {
    case "script-generation":
      return scriptGenerationEvaluator;
    // Add additional domains here as they are implemented
    case "brand-intelligence":
    case "competitor-discovery":
    case "competitor-analysis":
    case "content-intelligence":
    case "content-dna":
    case "repurpose":
    default:
      return null;
  }
}
