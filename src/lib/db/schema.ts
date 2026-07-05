import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  jsonb,
  timestamp,
  serial,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// 1. USERS TABLE
// ============================================================================
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    fullName: varchar("full_name", { length: 255 }),
    avatarUrl: text("avatar_url"),
    tier: varchar("tier", { length: 50 }).default("free").notNull(), // 'free' | 'pro' | 'enterprise'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    clerkIdIdx: uniqueIndex("idx_users_clerk_id").on(table.clerkId),
    emailIdx: uniqueIndex("idx_users_email").on(table.email),
  })
);

// ============================================================================
// 2. PROJECTS TABLE
// ============================================================================
export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    targetUsername: varchar("target_username", { length: 255 }).notNull(),
    status: varchar("status", { length: 50 }).default("PENDING").notNull(), // 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
    currentPhase: integer("current_phase").default(1).notNull(),
    errorMessage: text("error_message"),
    metadata: jsonb("metadata").default({}).notNull(),
    stateSnapshot: jsonb("state_snapshot"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userStatusIdx: index("idx_projects_user_status").on(table.userId, table.status),
    createdAtIdx: index("idx_projects_created_at").on(table.createdAt),
  })
);

// ============================================================================
// 3. PROFILE ANALYSES (Phase 1)
// ============================================================================
export const profileAnalyses = pgTable("profile_analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .unique()
    .references(() => projects.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }),
  bio: text("bio"),
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  postsCount: integer("posts_count").default(0),
  engagementRate: numeric("engagement_rate", { precision: 5, scale: 2 }).default("0.00"),
  profilePicUrl: text("profile_pic_url"),
  isVerified: boolean("is_verified").default(false),
  rawSnapshot: jsonb("raw_snapshot").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 4. BRAND REPORTS (Phase 2)
// ============================================================================
export const brandReports = pgTable("brand_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .unique()
    .references(() => projects.id, { onDelete: "cascade" }),
  archetype: varchar("archetype", { length: 100 }).notNull(),
  toneVoice: varchar("tone_voice", { length: 100 }).notNull(),
  industryVertical: varchar("industry_vertical", { length: 100 }).notNull(),
  contentPillars: jsonb("content_pillars").notNull(),
  targetAudience: jsonb("target_audience").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 5. COMPETITORS (Phase 3)
// ============================================================================
export const competitors = pgTable(
  "competitors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    username: varchar("username", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 255 }),
    followersCount: integer("followers_count").default(0),
    similarityScore: numeric("similarity_score", { precision: 5, scale: 2 }).default("0.00"),
    reasonMatched: text("reason_matched"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectUserUnique: uniqueIndex("idx_competitors_project_username").on(table.projectId, table.username),
  })
);

// ============================================================================
// 6. COMPETITOR ANALYSES (Phase 4)
// ============================================================================
export const competitorAnalyses = pgTable("competitor_analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  competitorId: uuid("competitor_id")
    .notNull()
    .unique()
    .references(() => competitors.id, { onDelete: "cascade" }),
  swotMatrix: jsonb("swot_matrix").notNull(),
  contentStrategySummary: text("content_strategy_summary").notNull(),
  topPerformingFormats: jsonb("top_performing_formats").notNull(),
  estimatedAdSpendTier: varchar("estimated_ad_spend_tier", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 7. COLLECTED CONTENT (Phase 5)
// ============================================================================
export const collectedContent = pgTable(
  "collected_content",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    shortcode: varchar("shortcode", { length: 100 }).notNull(),
    mediaType: varchar("media_type", { length: 50 }).default("REEL").notNull(), // 'REEL' | 'CAROUSEL' | 'IMAGE'
    videoUrl: text("video_url"),
    thumbnailUrl: text("thumbnail_url"),
    caption: text("caption"),
    viewsCount: integer("views_count").default(0),
    likesCount: integer("likes_count").default(0),
    commentsCount: integer("comments_count").default(0),
    sharesCount: integer("shares_count").default(0),
    postedAt: timestamp("posted_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectShortcodeUnique: uniqueIndex("idx_collected_project_shortcode").on(table.projectId, table.shortcode),
    projectViewsIdx: index("idx_collected_project_views").on(table.projectId, table.viewsCount),
  })
);

// ============================================================================
// 8. CONTENT INTELLIGENCE (Phase 6)
// ============================================================================
export const contentIntelligence = pgTable("content_intelligence", {
  id: uuid("id").defaultRandom().primaryKey(),
  collectedContentId: uuid("collected_content_id")
    .notNull()
    .unique()
    .references(() => collectedContent.id, { onDelete: "cascade" }),
  hookType: varchar("hook_type", { length: 100 }).notNull(),
  viralityScore: integer("virality_score").default(50),
  psychologicalTriggers: jsonb("psychological_triggers").notNull(),
  pacingCadence: varchar("pacing_cadence", { length: 100 }),
  audioTrendAnalysis: text("audio_trend_analysis"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 9. CONTENT DNA (Phase 7)
// ============================================================================
export const contentDna = pgTable("content_dna", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .unique()
    .references(() => projects.id, { onDelete: "cascade" }),
  winningHookFormulas: jsonb("winning_hook_formulas").notNull(),
  optimalDurationSeconds: integer("optimal_duration_seconds").default(30),
  recommendedPostingWindows: jsonb("recommended_posting_windows").notNull(),
  visualStyleGuide: jsonb("visual_style_guide").notNull(),
  masterBlueprintSummary: text("master_blueprint_summary").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 10. GENERATED SCRIPTS (Phase 8)
// ============================================================================
export const generatedScripts = pgTable("generated_scripts", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .unique()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  logline: text("logline").notNull(),
  targetDurationSeconds: integer("target_duration_seconds").default(30),
  scenes: jsonb("scenes").notNull(),
  teleprompterText: text("teleprompter_text").notNull(),
  directorsNotes: text("directors_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 11. REPURPOSE PACKAGES (Phase 9)
// ============================================================================
export const repurposePackages = pgTable("repurpose_packages", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .unique()
    .references(() => projects.id, { onDelete: "cascade" }),
  linkedinPost: jsonb("linkedin_post").notNull(),
  twitterThread: jsonb("twitter_thread").notNull(),
  threadsPost: jsonb("threads_post").notNull(),
  facebookReelCaption: jsonb("facebook_reel_caption").notNull(),
  youtubeShortsMeta: jsonb("youtube_shorts_meta").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 12. EXPORTS TABLE
// ============================================================================
export const exports = pgTable("exports", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  exportFormat: varchar("export_format", { length: 20 }).notNull(), // 'PDF' | 'MARKDOWN' | 'HTML' | 'JSON'
  storagePath: text("storage_path").notNull(),
  fileSizeBytes: integer("file_size_bytes").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 13. USER PREFERENCES TABLE (Formerly Settings)
// ============================================================================
export const userPreferences = pgTable("user_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  activeScraperProvider: varchar("active_scraper_provider", { length: 50 }).default("apify").notNull(),
  activeAiModel: varchar("active_ai_model", { length: 50 }).default("gemini-2.5-pro").notNull(),
  themePreference: varchar("theme_preference", { length: 20 }).default("dark").notNull(),
  autoSaveEnabled: boolean("auto_save_enabled").default(true).notNull(),
  customPromptOverrides: jsonb("custom_prompt_overrides").default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 14. AUDIT LOGS TABLE
// ============================================================================
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    actionType: varchar("action_type", { length: 100 }).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userActionIdx: index("idx_audit_logs_user_action").on(table.userId, table.actionType),
  })
);

// ============================================================================
// 15. USAGE TABLE
// ============================================================================
export const usage = pgTable(
  "usage",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    billingPeriodStart: timestamp("billing_period_start", { withTimezone: true }).notNull(),
    billingPeriodEnd: timestamp("billing_period_end", { withTimezone: true }).notNull(),
    scraperCallsCount: integer("scraper_calls_count").default(0).notNull(),
    aiPromptTokens: integer("ai_prompt_tokens").default(0).notNull(),
    aiCompletionTokens: integer("ai_completion_tokens").default(0).notNull(),
    totalCostUsd: numeric("total_cost_usd", { precision: 10, scale: 4 }).default("0.0000").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userPeriodUnique: uniqueIndex("idx_usage_user_period").on(table.userId, table.billingPeriodStart),
  })
);

// ============================================================================
// 16. SUBSCRIPTIONS TABLE
// ============================================================================
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).unique(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  planId: varchar("plan_id", { length: 100 }).default("free").notNull(),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 17. STRIPE WEBHOOK EVENTS (Idempotency Tracking - BILL-001)
// ============================================================================
export const stripeWebhookEvents = pgTable("stripe_webhook_events", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 255 }).notNull().unique(),
  eventType: varchar("event_type", { length: 255 }),
  processedAt: timestamp("processed_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// RELATIONS DEFINITIONS
// ============================================================================
export const usersRelations = relations(users, ({ many, one }) => ({
  projects: many(projects),
  exports: many(exports),
  auditLogs: many(auditLogs),
  usageRecords: many(usage),
  userPreferences: one(userPreferences, { fields: [users.id], references: [userPreferences.userId] }),
  subscription: one(subscriptions, { fields: [users.id], references: [subscriptions.userId] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  profileAnalysis: one(profileAnalyses, { fields: [projects.id], references: [profileAnalyses.projectId] }),
  brandReport: one(brandReports, { fields: [projects.id], references: [brandReports.projectId] }),
  competitors: many(competitors),
  collectedContent: many(collectedContent),
  contentDna: one(contentDna, { fields: [projects.id], references: [contentDna.projectId] }),
  generatedScript: one(generatedScripts, { fields: [projects.id], references: [generatedScripts.projectId] }),
  repurposePackage: one(repurposePackages, { fields: [projects.id], references: [repurposePackages.projectId] }),
  exports: many(exports),
}));

export const competitorsRelations = relations(competitors, ({ one }) => ({
  project: one(projects, { fields: [competitors.projectId], references: [projects.id] }),
  analysis: one(competitorAnalyses, { fields: [competitors.id], references: [competitorAnalyses.competitorId] }),
}));

export const collectedContentRelations = relations(collectedContent, ({ one }) => ({
  project: one(projects, { fields: [collectedContent.projectId], references: [projects.id] }),
  intelligence: one(contentIntelligence, { fields: [collectedContent.id], references: [contentIntelligence.collectedContentId] }),
}));
