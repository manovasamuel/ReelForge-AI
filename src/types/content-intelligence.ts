// Domain types for Phase 6 — Content Intelligence Engine

import type { ContentType } from "./content-collection";

export interface HookAnalysis {
  hookType: string; // e.g. "Negative Hook / Problem Agitation", "Curiosity Gap", "Contrarian Statement"
  hookStrength: number; // 0 to 100
  patternInterrupt: string; // e.g. "Dynamic visual smash-cut + bold text overlay"
  first3Seconds: string; // Breakdown of first 3 seconds
}

export interface CaptionIntelligence {
  length: string; // e.g. "142 words (Optimal Scannable Length)"
  cta: string; // e.g. "Explicit Direct Lead Magnet CTA ('Comment GUIDE')"
  emojiUsage: string; // e.g. "3 emojis used as structural line breaks"
  storytelling: string; // e.g. "PAS (Problem-Agitate-Solution) Narrative Arc"
  readability: string; // e.g. "High — Grade 6 Reading Level, Single-sentence paragraphs"
}

export interface VisualIntelligence {
  editingPace: string; // e.g. "Fast (Cut every 2.4s)"
  cameraStyle: string; // e.g. "4K Talking Head + Dynamic B-Roll Inserts"
  textOverlay: string; // e.g. "High contrast yellow/white animated captions"
  colorStyle: string; // e.g. "High contrast cinematic dark grading"
}

export interface EngagementIntelligence {
  views: number;
  viewsAvailable?: boolean; // true when empirically measured, false when unavailable
  likes: number;
  comments: number;
  estimatedSaveRate: number; // percentage e.g. 4.8 (0 when viewsAvailable is false to avoid synthetic rates)
  estimatedShareRate: number; // percentage e.g. 3.2 (0 when viewsAvailable is false to avoid synthetic rates)
  interactionProxyRate?: number; // clearly labelled relative interaction ratio/heuristic when viewsAvailable is false
}

export interface PsychologyMetrics {
  curiosity: number; // 0 to 100
  emotion: number; // 0 to 100
  authority: number; // 0 to 100
  socialProof: number; // 0 to 100
  scarcity: number; // 0 to 100
  relatability: number; // 0 to 100
}

export interface ViralityScore {
  viralityScore: number; // 0 to 100 (0 when viralityAvailable is false / reach is unavailable)
  successProbability: string; // e.g. "Very High (88% chance of top tier reach)"
  confidence: number; // 0 to 100
  viralityAvailable?: boolean; // true when calculated from measured views/reach, false when unavailable
  interactionProxyScore?: number; // relative interaction benchmark (likes + comments) when virality is unavailable
}

export interface ReusabilityScore {
  score: number; // 0 to 100
  reusabilityLevel: string; // e.g. "High Reusability (Evergreen Template)"
  confidence: number; // 0 to 100
}

export interface ContentIntelligenceReport {
  id: string;
  contentItemId: string;
  thumbnailUrl: string;
  type: ContentType;
  caption: string;
  publishDate: string;
  hook: HookAnalysis;
  captionIntelligence: CaptionIntelligence;
  visual: VisualIntelligence;
  engagement: EngagementIntelligence;
  psychology: PsychologyMetrics;
  virality: ViralityScore;
  winningFactors: string[]; // Additional Requirement 1
  failureFactors: string[]; // Additional Requirement 2
  reusability: ReusabilityScore; // Additional Requirement 3
  whyItWorked: string[];
}
