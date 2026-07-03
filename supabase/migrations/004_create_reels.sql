-- Migration 004: Create reels table
-- Stores individual reel data from competitor analysis

CREATE TABLE IF NOT EXISTS reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  instagram_reel_id TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  saves INTEGER NOT NULL DEFAULT 0,
  engagement_rate REAL NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  audio_name TEXT,
  hashtags JSONB DEFAULT '[]'::jsonb,
  posted_at TIMESTAMPTZ,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reels_competitor_id ON reels (competitor_id);
CREATE INDEX IF NOT EXISTS idx_reels_session_id ON reels (session_id);
CREATE INDEX IF NOT EXISTS idx_reels_engagement_rate ON reels (engagement_rate DESC);
