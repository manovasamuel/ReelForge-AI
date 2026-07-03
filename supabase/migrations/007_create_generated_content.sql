-- Migration 007: Create generated_content table
-- Stores AI-generated Instagram content packages

CREATE TABLE IF NOT EXISTS generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  report_id UUID REFERENCES intelligence_reports(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL DEFAULT 'reel',
  hook TEXT NOT NULL DEFAULT '',
  shot_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  full_script TEXT NOT NULL DEFAULT '',
  camera_directions TEXT NOT NULL DEFAULT '',
  editing_notes TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  cta TEXT NOT NULL DEFAULT '',
  hashtags JSONB NOT NULL DEFAULT '[]'::jsonb,
  reasoning JSONB NOT NULL DEFAULT '{}'::jsonb,
  custom_brief TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_archived BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_content_session_id ON generated_content (session_id);
CREATE INDEX IF NOT EXISTS idx_content_archived ON generated_content (is_archived);
