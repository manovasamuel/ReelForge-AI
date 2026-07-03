-- Migration 002: Create competitors table
-- Stores competitor relationships for each profile

CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  instagram_url TEXT NOT NULL,
  relevance_score REAL NOT NULL DEFAULT 0,
  relevance_reason TEXT,
  metadata JSONB,
  is_manual BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competitors_profile_id ON competitors (profile_id);
