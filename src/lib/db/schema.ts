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
  customType,
} from "drizzle-orm/pg-core";

const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(768)";
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  }
});
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
// 18. PROFILE CACHE TABLE (Stage 3B Phase 4A - Scraper TTL Cache)
// ============================================================================
export const profileCache = pgTable(
  "profile_cache",
  {
    usernameClean: varchar("username_clean", { length: 255 }).primaryKey(),
    rawProfile: jsonb("raw_profile").notNull(),
    lastScrapedAt: timestamp("last_scraped_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    expiresAtIdx: index("idx_profile_cache_expires_at").on(table.expiresAt),
  })
);

// ============================================================================
// 19. AI CACHE TABLE (Stage 3B Phase 4D - 14-Day Intelligence Cache)
// ============================================================================
export const aiCache = pgTable(
  "ai_cache",
  {
    key: varchar("key", { length: 255 }).primaryKey(),
    type: varchar("type", { length: 100 }).notNull(),
    data: jsonb("data").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    expiresAtIdx: index("idx_ai_cache_expires_at").on(table.expiresAt),
  })
);

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

// ============================================================================
// BRAND PROFILES (Phase 5)
// ============================================================================
export const brandProfiles = pgTable("brand_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  version: integer("version").default(1).notNull(),
  metadata: jsonb("metadata").notNull(),
  visualIdentity: jsonb("visual_identity").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const brandAssets = pgTable("brand_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  brandId: uuid("brand_id").notNull().references(() => brandProfiles.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  assetType: varchar("asset_type", { length: 50 }).notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  description: text("description"),
  tags: jsonb("tags").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  version: integer("version").default(1).notNull(),
  storageKey: varchar("storage_key", { length: 500 }).notNull().unique(),
  status: varchar("status", { length: 50 }).default("available").notNull(),
  visionMetadata: jsonb("vision_metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// CONVERSATIONAL MEMORY (Phase 4)
// ============================================================================
export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: uuid("project_id"),
  brandId: uuid("brand_id").references(() => brandProfiles.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull(),
  content: text("content").notNull(),
  toolCalls: jsonb("tool_calls"),
  toolResult: jsonb("tool_result"),
  embeddingStatus: varchar("embedding_status", { length: 50 }).default("Pending").notNull(),
  embedding: vector("embedding"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const longTermMemories = pgTable("long_term_memories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  scope: varchar("scope", { length: 50 }).notNull(),
  scopeId: uuid("scope_id"),
  memoryType: varchar("memory_type", { length: 50 }).notNull(),
  content: text("content").notNull(),
  embedding: vector("embedding"),
  importance: integer("importance").default(5).notNull(),
  accessCount: integer("access_count").default(0).notNull(),
  lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  scopeIdx: index("idx_ltm_scope").on(table.userId, table.scope, table.scopeId),
}));

// ============================================================================
// WORKSPACES & TEAM (Phase 8)
// ============================================================================
export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workspaceMembers = pgTable("workspace_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).default("member").notNull(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userWorkspaceIdx: uniqueIndex("idx_workspace_members_user").on(table.workspaceId, table.userId),
}));

// ============================================================================
// AI TELEMETRY (Phase 9)
// ============================================================================
export const aiExecutions = pgTable("ai_executions", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  providerId: varchar("provider_id", { length: 50 }).notNull(),
  modelUsed: varchar("model_used", { length: 100 }).notNull(),
  requestedModel: varchar("requested_model", { length: 100 }),
  latencyMs: integer("latency_ms").notNull(),
  promptTokens: integer("prompt_tokens").default(0).notNull(),
  completionTokens: integer("completion_tokens").default(0).notNull(),
  totalTokens: integer("total_tokens").default(0).notNull(),
  costEstimateUsd: numeric("cost_estimate_usd", { precision: 10, scale: 4 }).default("0.0000").notNull(),
  fallbackUsed: boolean("fallback_used").default(false).notNull(),
  reason: varchar("reason", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  workspaceTimeIdx: index("idx_ai_executions_workspace_time").on(table.workspaceId, table.createdAt),
  providerIdx: index("idx_ai_executions_provider").on(table.providerId, table.modelUsed),
}));

export const memoryTelemetry = pgTable("memory_telemetry", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  operation: varchar("operation", { length: 50 }).notNull(),
  durationMs: integer("duration_ms").notNull(),
  itemsProcessed: integer("items_processed").default(0).notNull(),
  successful: boolean("successful").default(true).notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  workspaceTimeIdx: index("idx_memory_telemetry_workspace_time").on(table.workspaceId, table.createdAt),
}));

// ============================================================================
// PUBLISHING SUBSYSTEM (Phase 10)
// ============================================================================
export const socialAccounts = pgTable("social_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 50 }).notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  encryptedAccessToken: text("encrypted_access_token").notNull(),
  encryptedRefreshToken: text("encrypted_refresh_token"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const publishingDrafts = pgTable("publishing_drafts", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  mediaUrls: jsonb("media_urls").default([]).notNull(),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const publishingPosts = pgTable("publishing_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  contentAssetId: uuid("content_asset_id").notNull().references(() => contentAssets.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").notNull().references(() => socialAccounts.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).default("Scheduled").notNull(), // 'Scheduled', 'Queued', 'Publishing', 'Published', 'Failed', 'Retrying', 'Cancelled'
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  platformPostId: varchar("platform_post_id", { length: 255 }),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// ADAPTIVE INSTAGRAM INTELLIGENCE ENGINE (AIIE) - PHASE 11
// ============================================================================
export const instagramProfiles = pgTable("instagram_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }),
  bio: text("bio"),
  profilePictureUrl: text("profile_picture_url"),
  category: varchar("category", { length: 255 }),
  externalUrl: text("external_url"),
  isPrivate: boolean("is_private").default(false),
  isVerified: boolean("is_verified").default(false),
  lastScrapedAt: timestamp("last_scraped_at", { withTimezone: true }),
  nextRefreshAt: timestamp("next_refresh_at", { withTimezone: true }).defaultNow(),
  refreshPriority: varchar("refresh_priority", { length: 50 }).default("medium"), // 'high' (daily), 'medium' (3 days), 'low' (weekly), 'archived' (monthly)
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  usernameIdx: index("idx_instagram_profiles_username").on(table.username),
}));

export const profileIntelligence = pgTable("profile_intelligence", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").notNull().references(() => instagramProfiles.id, { onDelete: "cascade" }),
  
  // Identity
  accountType: varchar("account_type", { length: 50 }), // 'Creator', 'Brand', 'Agency', 'Curator'
  niche: varchar("niche", { length: 100 }), // e.g., 'Fitness', 'SaaS', 'Real Estate'
  
  // Adaptive Stage
  growthStage: varchar("growth_stage", { length: 50 }), // 'Incubation', 'Traction', 'Scaling', 'Maturity'
  
  // Strategic Objective
  primaryObjective: varchar("primary_objective", { length: 100 }), // 'Audience Growth', 'Lead Generation', 'Brand Awareness', 'Direct Sales'
  
  // Context & Evidence
  aiReasoning: text("ai_reasoning"),
  evidence: jsonb("evidence").default('[]'), // Array of supporting signals
  
  // Confidence
  confidenceScore: integer("confidence_score"),

  // Versioning/Tracking
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  // AKP v1.1 Enhancements
  knowledgeConfidence: integer("knowledge_confidence").default(0), // 0-100
  provenance: jsonb("provenance").default('[]'),
  enrichmentVersion: integer("enrichment_version").default(1).notNull(),

  lastEvaluatedAt: timestamp("last_evaluated_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  profileIdx: index("idx_profile_intelligence_profile_id").on(table.profileId),
}));

export const platformConfigurations = pgTable("platform_configurations", {
  id: uuid("id").defaultRandom().primaryKey(),
  configKey: text("config_key").notNull().unique(),
  configValue: jsonb("config_value").notNull(),
  version: integer("version").default(1).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  keyIdx: index("idx_platform_configs_key").on(table.configKey),
}));

export const competitorTracking = pgTable("competitor_tracking", {
  id: uuid("id").defaultRandom().primaryKey(),
  baseProfileId: uuid("base_profile_id").notNull().references(() => instagramProfiles.id, { onDelete: "cascade" }),
  competitorProfileId: uuid("competitor_profile_id").notNull().references(() => instagramProfiles.id, { onDelete: "cascade" }),
  
  // Adaptive Similarity
  similarityScore: integer("similarity_score"), // 0-100
  strategicRelevance: varchar("strategic_relevance", { length: 50 }), // 'Direct Match', 'Aspirational', 'Out of Scope'
  stageDelta: integer("stage_delta"), // e.g., +1, 0, -1
  learningPriority: integer("learning_priority"), // e.g., 0-100
  evidence: jsonb("evidence").default('[]'), // Array of reasons
  
  // Tracking
  discoveredAt: timestamp("discovered_at", { withTimezone: true }).defaultNow(),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  baseIdx: index("idx_competitor_tracking_base").on(table.baseProfileId),
}));

export const profileStrategies = pgTable("profile_strategies", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").notNull().references(() => instagramProfiles.id, { onDelete: "cascade" }),
  version: integer("version").default(1).notNull(), // Append-only versioning
  
  // Strategic Output
  strategicGaps: jsonb("strategic_gaps").default('[]'),
  growthOpportunities: jsonb("growth_opportunities").default('[]'),
  executionPlan: jsonb("execution_plan").default('[]'),
  successMetrics: jsonb("success_metrics").default('[]'),
  
  confidenceScore: integer("confidence_score"), // 0-100
  
  // Tracking
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }), 
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  profileVersionIdx: index("idx_profile_strategies_profile_version").on(table.profileId, table.version),
}));

export const profileMetricsHistory = pgTable("profile_metrics_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").notNull().references(() => instagramProfiles.id, { onDelete: "cascade" }),
  followerCount: integer("follower_count").default(0),
  followingCount: integer("following_count").default(0),
  postCount: integer("post_count").default(0),
  capturedAt: timestamp("captured_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  profileTimeIdx: index("idx_profile_metrics_profile_time").on(table.profileId, table.capturedAt),
}));

export const instagramPosts = pgTable("instagram_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").notNull().references(() => instagramProfiles.id, { onDelete: "cascade" }),
  platformPostId: varchar("platform_post_id", { length: 255 }).notNull().unique(),
  thumbnailUrl: text("thumbnail_url"),
  url: text("url"),
  caption: text("caption"),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  type: varchar("type", { length: 50 }).notNull(), // 'image' | 'video' | 'carousel'
  postedAt: timestamp("posted_at", { withTimezone: true }),
  lastScrapedAt: timestamp("last_scraped_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  platformIdIdx: index("idx_instagram_posts_platform_id").on(table.platformPostId),
  profilePostedIdx: index("idx_instagram_posts_profile_posted").on(table.profileId, table.postedAt),
}));

export const postIntelligence = pgTable("post_intelligence", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id").notNull().unique().references(() => instagramPosts.id, { onDelete: "cascade" }),
  hookType: varchar("hook_type", { length: 255 }),
  contentPillar: varchar("content_pillar", { length: 255 }),
  ctaClassification: varchar("cta_classification", { length: 255 }),
  emotionalTone: varchar("emotional_tone", { length: 255 }),
  visualStyle: varchar("visual_style", { length: 255 }),
  captionStructure: text("caption_structure"),
  viralScore: numeric("viral_score", { precision: 5, scale: 2 }),
  rawIntelligence: jsonb("raw_intelligence").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const intelligenceDatasets = pgTable("intelligence_datasets", {
  id: uuid("id").defaultRandom().primaryKey(),
  datasetType: varchar("dataset_type", { length: 100 }).notNull(), // e.g. 'hooks', 'ctas', 'competitor_dna'
  targetId: varchar("target_id", { length: 255 }), // e.g. username or industry
  version: integer("version").default(1).notNull(),
  datasetData: jsonb("dataset_data").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  typeTargetVersionIdx: index("idx_intelligence_datasets_type_target_version").on(table.datasetType, table.targetId, table.version),
}));

export const trendEvents = pgTable("trend_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  trendType: varchar("trend_type", { length: 100 }).notNull(), // e.g. 'Hook Trend'
  datasetType: varchar("dataset_type", { length: 100 }), 
  targetId: varchar("target_id", { length: 255 }),
  previousVersion: integer("previous_version"),
  currentVersion: integer("current_version"),
  detectedChange: text("detected_change"), // JSON string or text explaining delta
  description: text("description").notNull(),
  severity: varchar("severity", { length: 50 }).notNull().default("Minor"), // Minor, Moderate, Major, Critical
  confidenceScore: numeric("confidence_score", { precision: 3, scale: 2 }).default("0.00"),
  significanceScore: numeric("significance_score", { precision: 5, scale: 2 }), // Deprecated but kept for backward compat
  detectedAt: timestamp("detected_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// CONTENT WORKSPACE (Phase 12 / Sprint 3)
// ============================================================================
export const contentAssets = pgTable("content_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").notNull().references(() => instagramProfiles.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  contentType: varchar("content_type", { length: 50 }).notNull(), // 'Reels', 'Carousels', 'Static', 'Stories', 'Captions', 'Hooks', 'Ideas'
  contentState: varchar("content_state", { length: 50 }).notNull().default("Draft"), // 'Draft', 'AIRefined', 'UserEdited', 'Approved', 'Scheduled', 'Published', 'Archived'
  contentData: jsonb("content_data").default({}).notNull(),
  lineage: jsonb("lineage").default({}).notNull(),
  tags: jsonb("tags").default([]),
  linkedAssetIds: jsonb("linked_asset_ids").default([]),
  platform: varchar("platform", { length: 50 }),
  platformPostId: varchar("platform_post_id", { length: 255 }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  version: integer("version").default(1).notNull(),
  createdBy: varchar("created_by", { length: 100 }).default("Adaptive Copilot"),
  lastEditedBy: varchar("last_edited_by", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  profileTypeIdx: index("idx_content_assets_profile_type").on(table.profileId, table.contentType),
  stateIdx: index("idx_content_assets_state").on(table.contentState),
}));

// ============================================================================
// AIOS WORKFLOW STATE (Phase 4)
// ============================================================================
export const workflowStates = pgTable("workflow_states", {
  id: varchar("id", { length: 255 }).primaryKey(), // workflowId
  workflowVersion: integer("workflow_version").default(1).notNull(),
  blueprintVersion: integer("blueprint_version").default(1).notNull(),
  status: varchar("status", { length: 50 }).default('Pending').notNull(), // 'Pending' | 'Running' | 'Paused' | 'Completed' | 'Failed' | 'Cancelled'
  nodeStates: jsonb("node_states").default({}).notNull(),
  contextStore: jsonb("context_store").default({}).notNull(),
  finalOutput: jsonb("final_output"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
// ============================================================================
// PERFORMANCE INTELLIGENCE (Sprint 4)
// ============================================================================
export const akpLearnedPatterns = pgTable("akp_learned_patterns", {
  id: uuid("id").defaultRandom().primaryKey(),
  patternType: varchar("pattern_type", { length: 100 }).notNull(), // 'Hook', 'Caption', 'Posting Time', 'Visual Style', 'Content Length', 'CTA', 'Thumbnail', 'Hashtags'
  pattern: text("pattern").notNull(),
  confidenceScore: integer("confidence_score").default(0).notNull(), // 0-100
  sampleSize: integer("sample_size").default(0).notNull(),
  averageLift: numeric("average_lift", { precision: 5, scale: 2 }).default("0.00"),
  applicableTo: jsonb("applicable_to").default({}).notNull(),
  status: varchar("status", { length: 50 }).default("Candidate").notNull(), // 'Candidate', 'Validated', 'Rejected'
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  typeIdx: index("idx_akp_patterns_type").on(table.patternType),
  statusIdx: index("idx_akp_patterns_status").on(table.status),
}));

// ============================================================================
// RELATIONS DEFINITIONS
// ============================================================================
export const contentAssetsRelations = relations(contentAssets, ({ one }) => ({
  profile: one(instagramProfiles, {
    fields: [contentAssets.profileId],
    references: [instagramProfiles.id],
  }),
}));

export const socialAccountsRelations = relations(socialAccounts, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [socialAccounts.workspaceId],
    references: [workspaces.id],
  }),
  posts: many(publishingPosts),
}));

export const publishingDraftsRelations = relations(publishingDrafts, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [publishingDrafts.workspaceId],
    references: [workspaces.id],
  }),
  posts: many(publishingPosts),
}));

export const publishingPostsRelations = relations(publishingPosts, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [publishingPosts.workspaceId],
    references: [workspaces.id],
  }),
  account: one(socialAccounts, {
    fields: [publishingPosts.accountId],
    references: [socialAccounts.id],
  }),
}));

export const instagramProfilesRelations = relations(instagramProfiles, ({ many }) => ({
  metricsHistory: many(profileMetricsHistory),
  posts: many(instagramPosts),
}));

export const profileMetricsHistoryRelations = relations(profileMetricsHistory, ({ one }) => ({
  profile: one(instagramProfiles, {
    fields: [profileMetricsHistory.profileId],
    references: [instagramProfiles.id],
  }),
}));

export const instagramPostsRelations = relations(instagramPosts, ({ one }) => ({
  profile: one(instagramProfiles, {
    fields: [instagramPosts.profileId],
    references: [instagramProfiles.id],
  }),
  intelligence: one(postIntelligence, {
    fields: [instagramPosts.id],
    references: [postIntelligence.postId],
  }),
}));

export const postIntelligenceRelations = relations(postIntelligence, ({ one }) => ({
  post: one(instagramPosts, {
    fields: [postIntelligence.postId],
    references: [instagramPosts.id],
  }),
}));
