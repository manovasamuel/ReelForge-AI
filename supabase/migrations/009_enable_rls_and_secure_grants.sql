-- Migration 009: Enable Row Level Security (RLS) and secure table grants on all public tables
-- Resolves Supabase Security Advisor finding: rls_disabled_in_public

-- 1. Helper function for resolving authenticated user ID
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id FROM public.users 
  WHERE clerk_id = (SELECT coalesce(auth.jwt() ->> 'sub', (auth.uid())::text))
     OR id = (SELECT CASE WHEN (auth.uid())::text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                          THEN (auth.uid())::uuid 
                          ELSE NULL END)
  LIMIT 1;
$$;

-- Restrict execution of helper function
REVOKE EXECUTE ON FUNCTION public.current_user_id() FROM anon;
GRANT EXECUTE ON FUNCTION public.current_user_id() TO authenticated, service_role, postgres;

-- 2. Enable RLS on all 44 tables in public schema
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publishing_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publishing_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.long_term_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profile_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collected_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repurpose_packages ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.instagram_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_metrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_configurations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akp_learned_patterns ENABLE ROW LEVEL SECURITY;

-- 3. Revoke all privileges from anon role on all public tables
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;

-- 4. Revoke privileges on server-only tables from authenticated role
REVOKE ALL ON TABLE 
  public.stripe_webhook_events, 
  public.audit_logs, 
  public.ai_cache, 
  public.profile_cache, 
  public.ai_executions, 
  public.memory_telemetry, 
  public.workflow_states, 
  public.akp_learned_patterns 
FROM authenticated;

-- 5. Ensure service_role and postgres maintain full privileges
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role, postgres;

-- 6. Create RLS Policies for authenticated role

-- USERS
CREATE POLICY users_authenticated_select ON public.users
  FOR SELECT TO authenticated
  USING (clerk_id = (SELECT coalesce(auth.jwt() ->> 'sub', (auth.uid())::text)) OR id = (SELECT public.current_user_id()));

CREATE POLICY users_authenticated_update ON public.users
  FOR UPDATE TO authenticated
  USING (clerk_id = (SELECT coalesce(auth.jwt() ->> 'sub', (auth.uid())::text)) OR id = (SELECT public.current_user_id()))
  WITH CHECK (clerk_id = (SELECT coalesce(auth.jwt() ->> 'sub', (auth.uid())::text)) OR id = (SELECT public.current_user_id()));

-- USER PREFERENCES
CREATE POLICY user_preferences_authenticated_all ON public.user_preferences
  FOR ALL TO authenticated
  USING (user_id = (SELECT public.current_user_id()))
  WITH CHECK (user_id = (SELECT public.current_user_id()));

-- PROJECTS
CREATE POLICY projects_authenticated_all ON public.projects
  FOR ALL TO authenticated
  USING (user_id = (SELECT public.current_user_id()))
  WITH CHECK (user_id = (SELECT public.current_user_id()));

-- SUBSCRIPTIONS & USAGE (SELECT ONLY for owner)
CREATE POLICY subscriptions_authenticated_select ON public.subscriptions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT public.current_user_id()));

CREATE POLICY usage_authenticated_select ON public.usage
  FOR SELECT TO authenticated
  USING (user_id = (SELECT public.current_user_id()));

-- EXPORTS
CREATE POLICY exports_authenticated_all ON public.exports
  FOR ALL TO authenticated
  USING (user_id = (SELECT public.current_user_id()))
  WITH CHECK (user_id = (SELECT public.current_user_id()));

-- WORKSPACES & WORKSPACE-LINKED (social_accounts, publishing_drafts, publishing_posts)
CREATE POLICY workspaces_authenticated_select ON public.workspaces
  FOR SELECT TO authenticated
  USING (id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = (SELECT public.current_user_id())));

CREATE POLICY workspace_members_authenticated_select ON public.workspace_members
  FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = (SELECT public.current_user_id())));

CREATE POLICY social_accounts_authenticated_all ON public.social_accounts
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = (SELECT public.current_user_id())))
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = (SELECT public.current_user_id())));

CREATE POLICY publishing_drafts_authenticated_all ON public.publishing_drafts
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = (SELECT public.current_user_id())))
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = (SELECT public.current_user_id())));

CREATE POLICY publishing_posts_authenticated_all ON public.publishing_posts
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = (SELECT public.current_user_id())))
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = (SELECT public.current_user_id())));

-- BRANDS & ASSETS
CREATE POLICY brand_profiles_authenticated_all ON public.brand_profiles
  FOR ALL TO authenticated
  USING (user_id = (SELECT public.current_user_id()))
  WITH CHECK (user_id = (SELECT public.current_user_id()));

CREATE POLICY brand_assets_authenticated_all ON public.brand_assets
  FOR ALL TO authenticated
  USING (user_id = (SELECT public.current_user_id()) OR brand_id IN (SELECT id FROM public.brand_profiles WHERE user_id = (SELECT public.current_user_id())))
  WITH CHECK (user_id = (SELECT public.current_user_id()) OR brand_id IN (SELECT id FROM public.brand_profiles WHERE user_id = (SELECT public.current_user_id())));

-- CONVERSATIONS & MESSAGES
CREATE POLICY conversations_authenticated_all ON public.conversations
  FOR ALL TO authenticated
  USING (user_id = (SELECT public.current_user_id()))
  WITH CHECK (user_id = (SELECT public.current_user_id()));

CREATE POLICY messages_authenticated_all ON public.messages
  FOR ALL TO authenticated
  USING (conversation_id IN (SELECT id FROM public.conversations WHERE user_id = (SELECT public.current_user_id())))
  WITH CHECK (conversation_id IN (SELECT id FROM public.conversations WHERE user_id = (SELECT public.current_user_id())));

CREATE POLICY long_term_memories_authenticated_all ON public.long_term_memories
  FOR ALL TO authenticated
  USING (user_id = (SELECT public.current_user_id()))
  WITH CHECK (user_id = (SELECT public.current_user_id()));

-- PROJECT-LINKED CONTENT
CREATE POLICY profile_analyses_authenticated_all ON public.profile_analyses
  FOR ALL TO authenticated
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = (SELECT public.current_user_id())))
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = (SELECT public.current_user_id())));

CREATE POLICY brand_reports_authenticated_all ON public.brand_reports
  FOR ALL TO authenticated
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = (SELECT public.current_user_id())))
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = (SELECT public.current_user_id())));

CREATE POLICY competitors_authenticated_all ON public.competitors
  FOR ALL TO authenticated
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = (SELECT public.current_user_id())))
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = (SELECT public.current_user_id())));

CREATE POLICY competitor_analyses_authenticated_all ON public.competitor_analyses
  FOR ALL TO authenticated
  USING (competitor_id IN (SELECT id FROM public.competitors WHERE project_id IN (SELECT id FROM public.projects WHERE user_id = (SELECT public.current_user_id()))))
  WITH CHECK (competitor_id IN (SELECT id FROM public.competitors WHERE project_id IN (SELECT id FROM public.projects WHERE user_id = (SELECT public.current_user_id()))));

CREATE POLICY collected_content_authenticated_all ON public.collected_content
  FOR ALL TO authenticated
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = (SELECT public.current_user_id())))
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = (SELECT public.current_user_id())));

CREATE POLICY content_intelligence_authenticated_all ON public.content_intelligence
  FOR ALL TO authenticated
  USING (collected_content_id IN (SELECT id FROM public.collected_content WHERE project_id IN (SELECT id FROM public.projects WHERE user_id = (SELECT public.current_user_id()))))
  WITH CHECK (collected_content_id IN (SELECT id FROM public.collected_content WHERE project_id IN (SELECT id FROM public.projects WHERE user_id = (SELECT public.current_user_id()))));

CREATE POLICY content_dna_authenticated_all ON public.content_dna
  FOR ALL TO authenticated
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = (SELECT public.current_user_id())))
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = (SELECT public.current_user_id())));

CREATE POLICY generated_scripts_authenticated_all ON public.generated_scripts
  FOR ALL TO authenticated
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = (SELECT public.current_user_id())))
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = (SELECT public.current_user_id())));

CREATE POLICY repurpose_packages_authenticated_all ON public.repurpose_packages
  FOR ALL TO authenticated
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = (SELECT public.current_user_id())))
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = (SELECT public.current_user_id())));

-- PLATFORM & INTELLIGENCE (AUTHENTICATED READ-ONLY)
CREATE POLICY instagram_profiles_authenticated_select ON public.instagram_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY instagram_posts_authenticated_select ON public.instagram_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY profile_intelligence_authenticated_select ON public.profile_intelligence FOR SELECT TO authenticated USING (true);
CREATE POLICY post_intelligence_authenticated_select ON public.post_intelligence FOR SELECT TO authenticated USING (true);
CREATE POLICY intelligence_datasets_authenticated_select ON public.intelligence_datasets FOR SELECT TO authenticated USING (true);
CREATE POLICY trend_events_authenticated_select ON public.trend_events FOR SELECT TO authenticated USING (true);
CREATE POLICY content_assets_authenticated_select ON public.content_assets FOR SELECT TO authenticated USING (true);
CREATE POLICY profile_strategies_authenticated_select ON public.profile_strategies FOR SELECT TO authenticated USING (true);
CREATE POLICY profile_metrics_history_authenticated_select ON public.profile_metrics_history FOR SELECT TO authenticated USING (true);
CREATE POLICY competitor_tracking_authenticated_select ON public.competitor_tracking FOR SELECT TO authenticated USING (true);
CREATE POLICY platform_configurations_authenticated_select ON public.platform_configurations FOR SELECT TO authenticated USING (true);
