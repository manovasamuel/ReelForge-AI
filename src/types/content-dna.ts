// Domain types for Phase 7B — Content DNA Engine (MVP)

export interface SectionConfidence {
  confidence: number; // 0 to 100
  sampleCount: number; // integer
  reliability: string; // e.g. "Very High", "High", "Moderate"
}

export interface DNASnapshot {
  sampleSize: number;
  avgVirality: number;
  avgReusability: number;
  dominantHook: string;
  dominantCTA: string;
  dominantPsychology: string;
  overallDNAScore: number;
  /** True when items have empirical reach/views. False when derived from profile scraper where views are unavailable. */
  viralityAvailable?: boolean;
  /** Relative interaction proxy score (0-100) based on likes and comments density when reach is unavailable. */
  interactionProxyScore?: number;
  /** Relative interaction proxy rate (likes + comments density) when reach is unavailable. */
  interactionProxyRate?: number;
}

export interface WinningHookItem {
  hookType: string;
  frequency: number;
  avgVirality: number;
  /** True when items have empirical reach/views. False when derived from profile scraper where views are unavailable. */
  viralityAvailable?: boolean;
  /** Relative interaction proxy score (0-100) for this hook type when reach is unavailable. */
  interactionProxyScore?: number;
}

export interface WinningHooksSection {
  topHooks: WinningHookItem[];
  confidenceMeta: SectionConfidence;
}

export interface WinningCTAItem {
  ctaStyle: string;
  usagePercentage: number;
}

export interface WinningCTASection {
  topCTAs: WinningCTAItem[];
  confidenceMeta: SectionConfidence;
}

export interface WinningCaptionStyleSection {
  avgLength: string;
  emojiDensity: string;
  storytellingStyle: string;
  readability: string;
  confidenceMeta: SectionConfidence;
}

export interface WinningEditingStyleSection {
  editingPace: string;
  cameraStyle: string;
  textOverlay: string;
  sceneChanges: string;
  confidenceMeta: SectionConfidence;
}

export interface WinningPsychologySection {
  topTriggers: string[];
  authority: number;
  curiosity: number;
  relatability: number;
  socialProof: number;
  scarcity: number;
  confidenceMeta: SectionConfidence;
}

export interface WinningVisualStyleSection {
  dominantColors: string[];
  thumbnailStyle: string;
  lighting: string;
  framing: string;
  confidenceMeta: SectionConfidence;
}

export interface WinningStructureStep {
  stepOrder: number;
  name: string;
  description: string;
}

export interface WinningStructureSection {
  steps: WinningStructureStep[];
  formulaString: string;
  confidenceMeta: SectionConfidence;
}

export interface AvoidPatternsSection {
  failureChecklist: string[];
  confidenceMeta: SectionConfidence;
}

export interface BlueprintExport {
  formulaSteps: string[];
  description: string;
}

export interface DNAScoreSummary {
  overallScore: number;
  confidence: number;
  sampleSize: number;
  topPerformingPattern: string;
}

export interface ContentDNAReport {
  id: string;
  snapshot: DNASnapshot;
  winningHooks: WinningHooksSection;
  winningCTA: WinningCTASection;
  winningCaptionStyle: WinningCaptionStyleSection;
  winningEditingStyle: WinningEditingStyleSection;
  winningPsychology: WinningPsychologySection;
  winningVisualStyle: WinningVisualStyleSection;
  winningStructure: WinningStructureSection;
  avoidPatterns: AvoidPatternsSection;
  blueprintExport: BlueprintExport;
  dnaInsights: string[];
  dnaScore: DNAScoreSummary;
}
