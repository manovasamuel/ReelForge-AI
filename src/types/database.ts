// Global type definitions for the application

// Database entity types (mirrors Supabase schema)

export interface Profile {
  id: string;
  instagram_url: string;
  username: string;
  bio: string | null;
  follower_count: number | null;
  following_count: number | null;
  post_count: number | null;
  profile_picture_url: string | null;
  category: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

export interface Competitor {
  id: string;
  profile_id: string;
  username: string;
  instagram_url: string;
  relevance_score: number;
  relevance_reason: string | null;
  metadata: Record<string, unknown> | null;
  is_manual: boolean;
  created_at: string;
}

export interface AnalysisSession {
  id: string;
  profile_id: string;
  status: "pending" | "running" | "completed" | "failed";
  settings: Record<string, unknown> | null;
  started_at: string;
  completed_at: string | null;
}

export interface Reel {
  id: string;
  competitor_id: string;
  session_id: string;
  instagram_reel_id: string;
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagement_rate: number;
  duration_seconds: number;
  audio_name: string | null;
  hashtags: string[];
  posted_at: string | null;
  analyzed_at: string;
}

export interface Pattern {
  id: string;
  session_id: string;
  category: string;
  pattern_name: string;
  description: string;
  confidence_score: number;
  evidence: {
    reel_ids: string[];
    examples: string[];
  };
  created_at: string;
}

export interface IntelligenceReport {
  id: string;
  session_id: string;
  market_positioning: Record<string, unknown>;
  content_gaps: Record<string, unknown>;
  opportunities: Record<string, unknown>;
  trend_predictions: Record<string, unknown>;
  summary: string;
  created_at: string;
}

export interface GeneratedContent {
  id: string;
  session_id: string;
  report_id: string | null;
  content_type: string;
  hook: string;
  shot_list: ShotListItem[];
  full_script: string;
  camera_directions: string;
  editing_notes: string;
  caption: string;
  cta: string;
  hashtags: string[];
  reasoning: ContentReasoning;
  custom_brief: string | null;
  version: number;
  created_at: string;
  is_archived: boolean;
}

export interface RepurposedContent {
  id: string;
  generated_content_id: string;
  platform: string;
  adapted_content: string;
  adaptation_notes: Record<string, unknown>;
  platform_metadata: Record<string, unknown>;
  created_at: string;
}

// Supporting types

export interface ShotListItem {
  shot_number: number;
  description: string;
  duration_seconds: number;
  visual_notes: string;
}

export interface ContentReasoning {
  hook: string;
  shot_list: string;
  full_script: string;
  camera_directions: string;
  editing_notes: string;
  caption: string;
  cta: string;
  hashtags: string;
  overall_strategy: string;
}

// API response types

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiListResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

// Analysis status for UI
export type AnalysisStatus = AnalysisSession["status"];
