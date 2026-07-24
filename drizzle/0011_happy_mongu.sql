CREATE TABLE "competitor_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"base_profile_id" uuid NOT NULL,
	"competitor_profile_id" uuid NOT NULL,
	"similarity_score" integer,
	"strategic_relevance" varchar(50),
	"stage_delta" integer,
	"learning_priority" integer,
	"evidence" jsonb DEFAULT '[]',
	"discovered_at" timestamp with time zone DEFAULT now(),
	"last_verified_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"content_type" varchar(50) NOT NULL,
	"content_state" varchar(50) DEFAULT 'Draft' NOT NULL,
	"content_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"lineage" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by" varchar(100) DEFAULT 'Adaptive Copilot',
	"last_edited_by" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instagram_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"platform_post_id" varchar(255) NOT NULL,
	"thumbnail_url" text,
	"url" text,
	"caption" text,
	"likes" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"type" varchar(50) NOT NULL,
	"posted_at" timestamp with time zone,
	"last_scraped_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "instagram_posts_platform_post_id_unique" UNIQUE("platform_post_id")
);
--> statement-breakpoint
CREATE TABLE "instagram_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"display_name" varchar(255),
	"bio" text,
	"profile_picture_url" text,
	"category" varchar(255),
	"external_url" text,
	"is_private" boolean DEFAULT false,
	"is_verified" boolean DEFAULT false,
	"last_scraped_at" timestamp with time zone,
	"next_refresh_at" timestamp with time zone DEFAULT now(),
	"refresh_priority" varchar(50) DEFAULT 'medium',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "instagram_profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "intelligence_datasets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dataset_type" varchar(100) NOT NULL,
	"target_id" varchar(255),
	"version" integer DEFAULT 1 NOT NULL,
	"dataset_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"config_key" text NOT NULL,
	"config_value" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platform_configurations_config_key_unique" UNIQUE("config_key")
);
--> statement-breakpoint
CREATE TABLE "post_intelligence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"hook_type" varchar(255),
	"content_pillar" varchar(255),
	"cta_classification" varchar(255),
	"emotional_tone" varchar(255),
	"visual_style" varchar(255),
	"caption_structure" text,
	"viral_score" numeric(5, 2),
	"raw_intelligence" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "post_intelligence_post_id_unique" UNIQUE("post_id")
);
--> statement-breakpoint
CREATE TABLE "profile_intelligence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"account_type" varchar(50),
	"niche" varchar(100),
	"growth_stage" varchar(50),
	"primary_objective" varchar(100),
	"ai_reasoning" text,
	"evidence" jsonb DEFAULT '[]',
	"confidence_score" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"knowledge_confidence" integer DEFAULT 0,
	"provenance" jsonb DEFAULT '[]',
	"enrichment_version" integer DEFAULT 1 NOT NULL,
	"last_evaluated_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_metrics_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"follower_count" integer DEFAULT 0,
	"following_count" integer DEFAULT 0,
	"post_count" integer DEFAULT 0,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_strategies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"strategic_gaps" jsonb DEFAULT '[]',
	"growth_opportunities" jsonb DEFAULT '[]',
	"execution_plan" jsonb DEFAULT '[]',
	"success_metrics" jsonb DEFAULT '[]',
	"confidence_score" integer,
	"generated_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trend_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trend_type" varchar(100) NOT NULL,
	"dataset_type" varchar(100),
	"target_id" varchar(255),
	"previous_version" integer,
	"current_version" integer,
	"detected_change" text,
	"description" text NOT NULL,
	"severity" varchar(50) DEFAULT 'Minor' NOT NULL,
	"confidence_score" numeric(3, 2) DEFAULT '0.00',
	"significance_score" numeric(5, 2),
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_workspace_id_unique";--> statement-breakpoint
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "usage" DROP CONSTRAINT "usage_workspace_id_workspaces_id_fk";
--> statement-breakpoint
DROP INDEX "idx_projects_workspace";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "usage" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_tracking" ADD CONSTRAINT "competitor_tracking_base_profile_id_instagram_profiles_id_fk" FOREIGN KEY ("base_profile_id") REFERENCES "public"."instagram_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_tracking" ADD CONSTRAINT "competitor_tracking_competitor_profile_id_instagram_profiles_id_fk" FOREIGN KEY ("competitor_profile_id") REFERENCES "public"."instagram_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_assets" ADD CONSTRAINT "content_assets_profile_id_instagram_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."instagram_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instagram_posts" ADD CONSTRAINT "instagram_posts_profile_id_instagram_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."instagram_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_intelligence" ADD CONSTRAINT "post_intelligence_post_id_instagram_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."instagram_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_intelligence" ADD CONSTRAINT "profile_intelligence_profile_id_instagram_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."instagram_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_metrics_history" ADD CONSTRAINT "profile_metrics_history_profile_id_instagram_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."instagram_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_strategies" ADD CONSTRAINT "profile_strategies_profile_id_instagram_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."instagram_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_competitor_tracking_base" ON "competitor_tracking" USING btree ("base_profile_id");--> statement-breakpoint
CREATE INDEX "idx_content_assets_profile_type" ON "content_assets" USING btree ("profile_id","content_type");--> statement-breakpoint
CREATE INDEX "idx_content_assets_state" ON "content_assets" USING btree ("content_state");--> statement-breakpoint
CREATE INDEX "idx_instagram_posts_platform_id" ON "instagram_posts" USING btree ("platform_post_id");--> statement-breakpoint
CREATE INDEX "idx_instagram_posts_profile_posted" ON "instagram_posts" USING btree ("profile_id","posted_at");--> statement-breakpoint
CREATE INDEX "idx_instagram_profiles_username" ON "instagram_profiles" USING btree ("username");--> statement-breakpoint
CREATE INDEX "idx_intelligence_datasets_type_target_version" ON "intelligence_datasets" USING btree ("dataset_type","target_id","version");--> statement-breakpoint
CREATE INDEX "idx_platform_configs_key" ON "platform_configurations" USING btree ("config_key");--> statement-breakpoint
CREATE INDEX "idx_profile_intelligence_profile_id" ON "profile_intelligence" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_profile_metrics_profile_time" ON "profile_metrics_history" USING btree ("profile_id","captured_at");--> statement-breakpoint
CREATE INDEX "idx_profile_strategies_profile_version" ON "profile_strategies" USING btree ("profile_id","version");--> statement-breakpoint
ALTER TABLE "audit_logs" DROP COLUMN "workspace_id";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "workspace_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "workspace_id";--> statement-breakpoint
ALTER TABLE "usage" DROP COLUMN "workspace_id";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id");