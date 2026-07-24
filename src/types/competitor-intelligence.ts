export type GrowthStage = "Foundation" | "Early Growth" | "Growth" | "Established" | "Authority";

export type CompetitorCategory = "Peer" | "Aspirational" | "Leader" | "Emerging";

export interface CompetitorSelectionMatrix {
  peerRatio: number; // Percentage (e.g., 40)
  aspirationalRatio: number; // Percentage
  leaderRatio: number; // Percentage
  emergingRatio: number; // Percentage
}

export interface GrowthStageConfig {
  stage: GrowthStage;
  nextObjective: string;
  matrix: CompetitorSelectionMatrix;
  description: string;
}

export interface ClassificationSignal {
  name: string;
  score: number; // 0 to 100
  weight: number; // 0.0 to 1.0 (Sum of all weights in the active engine should equal 1.0)
  confidence: number; // 0 to 100
}

export interface IClassificationSignalScorer {
  name: string;
  weight: number;
  score(profile: import("@/types/instagram").InstagramProfile): Promise<ClassificationSignal>;
}

export interface ProfileClassificationResult {
  growthStage: GrowthStage;
  totalScore: number;
  signals: ClassificationSignal[];
  nextObjective: string;
  matrix: CompetitorSelectionMatrix;
}

export interface CompetitorIntelligenceConfig {
  mode: "disabled" | "observe" | "adaptive";
  stageThresholds: Record<GrowthStage, number>; // Minimum score required to achieve this stage
  stages: Record<GrowthStage, GrowthStageConfig>;
}

export interface CompetitorIntelligenceTelemetry {
  executed: boolean;
  mode: "disabled" | "observe" | "adaptive";
  success: boolean;
  durationMs: number;
  growthStage?: GrowthStage;
  totalScore?: number;
  matrix?: CompetitorSelectionMatrix;
  fallbackReason?: string;
  timestamp: string;
}
