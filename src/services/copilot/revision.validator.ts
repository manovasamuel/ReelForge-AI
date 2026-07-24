import { z } from "zod";
import type { RevisionResult } from "@/types/copilot";
import type { AIResponse } from "@/services/ai/provider.interface";

export class RevisionValidator {
  /**
   * Validates the AI response and constructs the unified RevisionResult.
   */
  public static validate<T>(
    response: AIResponse<any>,
    originalNode: any
  ): RevisionResult<T> {
    const data = response.data;
    const warnings: string[] = [];
    const errors: string[] = [];
    let passed = true;

    // 1. Empty Response Detection
    if (!data) {
      return this.failResult(response, ["AI returned an empty response."]);
    }

    if (typeof data !== "object" || Object.keys(data).length === 0) {
      return this.failResult(response, ["AI returned an empty or invalid JSON object."]);
    }

    // 2. Safe Parsing & Structural Validation
    // We expect the LLM to return an object that at least matches the keys of the original node.
    try {
      if (typeof originalNode === "object" && !Array.isArray(originalNode) && originalNode !== null) {
        const expectedKeys = Object.keys(originalNode);
        for (const key of expectedKeys) {
          if (data[key] === undefined) {
             warnings.push(`Revised node is missing expected key: '${key}'`);
          }
        }
      }
    } catch (e: any) {
      errors.push(`Validation threw an unexpected error: ${e.message}`);
      passed = false;
    }

    // 3. Fallback to basic Zod shape check (generic record check for micro-revisions)
    try {
      z.record(z.string(), z.any()).or(z.array(z.any())).parse(data);
    } catch (zodError) {
      passed = false;
      errors.push("Revised node failed basic structural parsing.");
    }

    // 4. Determine Confidence
    let confidence: "high" | "medium" | "low" = "high";
    if (warnings.length > 0) confidence = "medium";
    if (!passed) confidence = "low";

    if (!passed) {
      return this.failResult(response, errors);
    }

    return {
      success: true,
      revisedNode: data as T,
      validation: {
        passed: true,
        confidence,
      },
      telemetry: {
        modelUsed: response.telemetry.modelUsed,
        durationMs: response.telemetry.latencyMs,
        // Approximate token savings: Full generation (~2000) vs Micro (~200)
        tokensSaved: 1800, 
      },
      warnings,
      errors: []
    };
  }

  private static failResult(response: AIResponse<any> | null, errors: string[]): RevisionResult<any> {
    return {
      success: false,
      validation: {
        passed: false,
        confidence: "low",
        errors
      },
      telemetry: {
        modelUsed: response?.telemetry?.modelUsed || "unknown",
        durationMs: response?.telemetry?.latencyMs || 0,
        tokensSaved: 0
      },
      warnings: [],
      errors
    };
  }
}
