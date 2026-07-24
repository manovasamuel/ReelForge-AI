// Domain types for Phase 8 — Strategy + Script Generation Engine (MVP)
// @deprecated: ReelContentPackage and related interfaces are deprecated in favor of ProductionBlueprint (v1.0).

export interface ContentStrategySection {
  contentGoal: string;
  targetAudience: string;
  emotion: string;
  contentPillar: string;
  hookStyle: string;
  ctaStyle: string;
  difficulty: string;
  estimatedPerformance: string;
  confidence: number;
}

export interface ReelIdeaSection {
  title: string;
  summary: string;
  uniqueAngle: string;
  expectedOutcome: string;
}

export interface HookSection {
  firstSentence: string;
  openingVisual: string;
  openingShot: string;
  textOverlay: string;
  voiceover: string;
}

export interface SceneScriptItem {
  sceneNumber: number;
  title: string;
  visual: string;
  camera: string;
  voiceover: string;
  textOverlay: string;
  duration: string;
  transition: string;
}

export interface CaptionSection {
  fullCaption: string;
}

export interface CTASection {
  primaryCTA: string;
  alternativeCTA: string;
  pinnedComment: string;
}

export interface HashtagGroup {
  category: "High Reach" | "Medium Reach" | "Niche";
  tags: string[];
}

export interface HashtagsSection {
  groups: HashtagGroup[];
  allTagsString: string;
}

export interface PostingRecommendationSection {
  bestTime: string;
  bestDay: string;
  coverStyle: string;
  firstComment: string;
}

export interface ContentChecklistSection {
  hookReady: boolean;
  captionReady: boolean;
  ctaReady: boolean;
  hashtagsReady: boolean;
  coverReady: boolean;
  postReady: boolean;
}

export interface ProductionSummarySection {
  estimatedShootTime: string;
  estimatedReelDuration: string;
  editingDifficulty: string;
  equipmentNeeded: string[];
  bRollCount: number;
}

export interface ProductionScoreSection {
  overallScore: number;
  confidence: number;
  difficulty: string;
  estimatedPerformance: string;
}

/**
 * @deprecated Use ProductionBlueprint instead.
 */
export interface ReelContentPackage {
  id: string;
  createdAt: string;
  strategy: ContentStrategySection;
  reelIdea: ReelIdeaSection;
  hook: HookSection;
  scenes: SceneScriptItem[];
  caption: CaptionSection;
  cta: CTASection;
  hashtags: HashtagsSection;
  postingRecommendation: PostingRecommendationSection;
  checklist: ContentChecklistSection;
  productionSummary: ProductionSummarySection;
  productionScore: ProductionScoreSection;
}

// ============================================================================
// REELFORGE PRODUCT TRANSFORMATION: PRODUCTION BLUEPRINT (v1.0)
// ============================================================================

export interface GenerationMetadata {
  confidence: number;
  reasoning: string;
  generatedAt: string;
  model: string;
  version: string;
}

export interface CreativeConcept {
  id: string;
  title: string;
  hook: string;
  coreIdea: string;
  audienceEmotion: string;
  visualHook: string;
  whyItWorks: string;
}

export interface BlueprintStrategy {
  objective: string;
  targetAudience: string;
  desiredEmotion: string;
  competitorInsight: string;
  metadata?: GenerationMetadata;
}

export interface BlueprintHook {
  hookText: string;
  whyItWorks: string;
  patternInterrupt: string;
  first3Seconds: string;
  metadata?: GenerationMetadata;
}

export interface BlueprintProduction {
  openingShot: string;
  cameraAngle: string;
  cameraMovement: string;
  lighting: string;
  background: string;
  actorPosition: string;
  metadata?: GenerationMetadata;
}

export interface BlueprintDialogue {
  tanglishVersion: string;
  englishVersion: string;
  deliveryNotes: string;
  pauseTiming: string;
  metadata?: GenerationMetadata;
}

export interface BlueprintVisualFlow {
  sceneBreakdown: string[];
  bRoll: string[];
  textOverlays: string[];
  transitions: string[];
  metadata?: GenerationMetadata;
}

export interface BlueprintRetention {
  curiosityLoops: string;
  patternInterrupts: string;
  engagementMoments: string;
  metadata?: GenerationMetadata;
}

export interface BlueprintCTA {
  spokenCTA: string;
  visualCTA: string;
  endScreen: string;
  metadata?: GenerationMetadata;
}

export interface BlueprintCaption {
  captionText: string;
  emojiStrategy: string;
  keywords: string[];
  metadata?: GenerationMetadata;
}

export interface BlueprintDiscovery {
  hashtags: string[];
  seoKeywords: string[];
  postingSuggestions: string;
  metadata?: GenerationMetadata;
}

export interface ProductionBlueprint {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: "1.0"; // Enforces versioning
  
  // Independent modular sections
  // Optional to support incremental generation
  strategy?: BlueprintStrategy;
  hook?: BlueprintHook;
  production?: BlueprintProduction;
  dialogue?: BlueprintDialogue;
  visualFlow?: BlueprintVisualFlow;
  retention?: BlueprintRetention;
  cta?: BlueprintCTA;
  caption?: BlueprintCaption;
  discovery?: BlueprintDiscovery;
}
