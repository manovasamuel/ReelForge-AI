// Domain types for Phase 8 — Strategy + Script Generation Engine (MVP)

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
