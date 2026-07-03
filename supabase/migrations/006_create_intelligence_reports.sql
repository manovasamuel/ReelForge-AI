-- Migration 006: Create intelligence_reports table
-- Stores consolidated intelligence reports per analysis session

CREATE TABLE IF NOT EXISTS intelligence_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  market_positioning JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_gaps JSONB NOT NULL DEFAULT '{}'::jsonb,
  opportunities JSONB NOT NULL DEFAULT '{}'::jsonb,
  trend_predictions JSONB NOT NULL DEFAULT '{}'::jsonb,
  summary TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One report per session (UNIQUE constraint above enforces this)
