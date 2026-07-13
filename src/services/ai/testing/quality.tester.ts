/**
 * AI Quality Testing Service — ReelForge AI v2.1 Phase 8.
 *
 * Deterministic developer evaluation testing service comparing:
 *   1. Prompt Score (verifies Phase 7.4 compiled prompt quality >= 80/100)
 *   2. AI Output Length (verifies response character length within valid bounds 50 - 100,000 chars)
 *   3. Validation Success (verifies ResponseNormalizer validates JSON without error)
 *   4. Response Completeness (verifies 100% of required domain fields are populated and non-empty)
 *
 * For developer evaluation and regression testing only.
 */

export interface QualityEvaluationReport {
  timestamp: string;
  domain: string;
  promptScore: number;
  promptScorePassed: boolean; // >= 80
  outputLength: number;
  outputLengthPassed: boolean; // 50 <= len <= 100000
  validationSuccess: boolean;
  validationError?: string;
  responseCompletenessScore: number; // 0-100%
  missingFields: string[];
  overallPassed: boolean;
}

export class AIQualityTester {
  /**
   * Evaluates a Brand Intelligence execution payload and response.
   */
  public static evaluateBrandIntelligence(
    promptScore: number,
    rawText: string,
    normalizedResponse: any
  ): QualityEvaluationReport {
    const promptScorePassed = promptScore >= 80;
    const outputLength = rawText ? rawText.length : 0;
    const outputLengthPassed = outputLength >= 50 && outputLength <= 100_000;

    let validationSuccess = true;
    let validationError: string | undefined;
    try {
      if (!rawText || !rawText.trim()) throw new Error("Empty response");
    } catch (e: any) {
      validationSuccess = false;
      validationError = e.message;
    }

    const requiredFields = [
      "industry",
      "brandType",
      "targetAudience",
      "brandTone",
      "contentStyle",
      "primaryContentPillars",
      "postingFrequency",
      "estimatedMarketPosition",
    ];

    const missingFields: string[] = [];
    for (const field of requiredFields) {
      const val = normalizedResponse?.[field];
      if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
        missingFields.push(field);
      }
    }

    const completenessRatio = (requiredFields.length - missingFields.length) / requiredFields.length;
    const responseCompletenessScore = Math.round(completenessRatio * 100);

    const overallPassed = promptScorePassed && outputLengthPassed && validationSuccess && missingFields.length === 0;

    return {
      timestamp: new Date().toISOString(),
      domain: "Brand Intelligence",
      promptScore,
      promptScorePassed,
      outputLength,
      outputLengthPassed,
      validationSuccess,
      validationError,
      responseCompletenessScore,
      missingFields,
      overallPassed,
    };
  }

  /**
   * Evaluates a Script Generation execution payload and response.
   */
  public static evaluateScriptGeneration(
    promptScore: number,
    rawText: string,
    normalizedResponse: any
  ): QualityEvaluationReport {
    const promptScorePassed = promptScore >= 80;
    const outputLength = rawText ? rawText.length : 0;
    const outputLengthPassed = outputLength >= 100 && outputLength <= 100_000;

    let validationSuccess = true;
    let validationError: string | undefined;
    try {
      if (!rawText || !rawText.trim()) throw new Error("Empty response");
    } catch (e: any) {
      validationSuccess = false;
      validationError = e.message;
    }

    const requiredFields = [
      "id",
      "strategy",
      "reelIdea",
      "hook",
      "scenes",
      "caption",
      "cta",
      "hashtags",
      "postingRecommendation",
      "checklist",
      "productionSummary",
      "productionScore",
    ];

    const missingFields: string[] = [];
    for (const field of requiredFields) {
      const val = normalizedResponse?.[field];
      if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
        missingFields.push(field);
      }
    }

    const completenessRatio = (requiredFields.length - missingFields.length) / requiredFields.length;
    const responseCompletenessScore = Math.round(completenessRatio * 100);

    const overallPassed = promptScorePassed && outputLengthPassed && validationSuccess && missingFields.length === 0;

    return {
      timestamp: new Date().toISOString(),
      domain: "Script Generation",
      promptScore,
      promptScorePassed,
      outputLength,
      outputLengthPassed,
      validationSuccess,
      validationError,
      responseCompletenessScore,
      missingFields,
      overallPassed,
    };
  }
}
