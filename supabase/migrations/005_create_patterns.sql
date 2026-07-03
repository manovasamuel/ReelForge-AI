-- Migration 005: Create patterns table
-- Stores extracted patterns from reel analysis

CREATE TABLE IF NOT EXISTS patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  pattern_name TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score REAL NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patterns_session_id ON patterns (session_id);
CREATE INDEX IF NOT EXISTS idx_patterns_category ON patterns (category);
