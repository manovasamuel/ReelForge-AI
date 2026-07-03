-- Migration 008: Create repurposed_content table
-- Stores platform-adapted versions of generated content

CREATE TABLE IF NOT EXISTS repurposed_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_content_id UUID NOT NULL REFERENCES generated_content(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'x', 'facebook', 'threads', 'youtube_shorts')),
  adapted_content TEXT NOT NULL DEFAULT '',
  adaptation_notes JSONB NOT NULL DEFAULT '{}'::jsonb,
  platform_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_repurposed_content_id ON repurposed_content (generated_content_id);
CREATE INDEX IF NOT EXISTS idx_repurposed_platform ON repurposed_content (platform);

-- Prevent duplicate platform entries for the same content
CREATE UNIQUE INDEX IF NOT EXISTS idx_repurposed_unique_platform 
  ON repurposed_content (generated_content_id, platform);
