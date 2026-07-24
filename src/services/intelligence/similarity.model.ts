import type { ProfileIntelligenceResult } from "./profile-intelligence.service";
import type { SimilarityWeights } from "./configuration.service";

export interface CompetitorRelationship {
  similarityScore: number;
  stageDelta: number;
  strategicRelevance: string; // 'Direct Match', 'Aspirational', 'Out of Scope'
  learningPriority: number;
  evidence: string[];
}

const STAGE_ORDER: Record<string, number> = {
  "Incubation": 1,
  "Traction": 2,
  "Scaling": 3,
  "Maturity": 4
};

/**
 * ProfileSimilarityModel
 * 
 * Reusable mathematical/heuristic engine to score the strategic relevance 
 * between two profiles, evaluating their identity, stage, and objective.
 */
export class ProfileSimilarityModel {
  
  public evaluateRelationship(
    base: ProfileIntelligenceResult, 
    candidate: ProfileIntelligenceResult,
    weights: SimilarityWeights
  ): CompetitorRelationship {
    
    let similarityScore = 0;
    const evidence: string[] = [];

    // 1. Evaluate Identity / Niche
    if (base.accountType === candidate.accountType) {
      similarityScore += weights.accountType;
      evidence.push(`Same Account Type (${base.accountType})`);
    } else {
      evidence.push(`Different Account Type (${candidate.accountType} vs ${base.accountType})`);
    }

    if (base.niche === candidate.niche) {
      similarityScore += weights.niche;
      evidence.push(`Direct Niche Match (${base.niche})`);
    } else {
      evidence.push(`Different Niche (${candidate.niche} vs ${base.niche})`);
    }

    // 2. Evaluate Objective
    if (base.primaryObjective === candidate.primaryObjective) {
      similarityScore += weights.primaryObjective;
      evidence.push(`Aligned Primary Objective (${base.primaryObjective})`);
    } else {
      evidence.push(`Divergent Objective (${candidate.primaryObjective} vs ${base.primaryObjective})`);
    }

    // 3. Evaluate Stage Delta
    const baseStageVal = STAGE_ORDER[base.growthStage] || 0;
    const candStageVal = STAGE_ORDER[candidate.growthStage] || 0;
    
    // If either stage is unknown, we assume delta is 0
    let stageDelta = 0;
    if (baseStageVal > 0 && candStageVal > 0) {
      stageDelta = candStageVal - baseStageVal;
    }

    let strategicRelevance = "Out of Scope";
    let learningPriority = similarityScore;

    if (stageDelta === 0) {
      strategicRelevance = "Direct Match";
      learningPriority += 5; // Slight bonus for peers
      evidence.push(`Same Growth Stage (${base.growthStage})`);
    } else if (stageDelta === 1 || stageDelta === 2) {
      strategicRelevance = "Aspirational";
      learningPriority += 25; // Massive learning bonus for being ahead
      evidence.push(`Aspirational Stage (${candidate.growthStage} is +${stageDelta} stages ahead)`);
    } else if (stageDelta > 2) {
      strategicRelevance = "Out of Scope"; // Too far ahead
      learningPriority -= 30;
      evidence.push(`Too advanced to replicate (${candidate.growthStage} is +${stageDelta} stages ahead)`);
    } else {
      strategicRelevance = "Out of Scope"; // Behind the base profile
      learningPriority -= 50; 
      evidence.push(`Less mature stage (${candidate.growthStage} is behind base profile)`);
    }

    // Normalize
    similarityScore = Math.max(0, Math.min(100, similarityScore));
    learningPriority = Math.max(0, Math.min(100, learningPriority));

    return {
      similarityScore,
      stageDelta,
      strategicRelevance,
      learningPriority,
      evidence
    };
  }
}

export const profileSimilarityModel = new ProfileSimilarityModel();
