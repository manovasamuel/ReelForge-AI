const fs = require('fs');

const missingPhase4to5 = `
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
`;

const missingPhase8to10 = `
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
  draftId: uuid("draft_id").notNull().references(() => publishingDrafts.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").notNull().references(() => socialAccounts.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  platformPostId: varchar("platform_post_id", { length: 255 }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
`;

const aiiePhase11 = `
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
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  usernameIdx: index("idx_instagram_profiles_username").on(table.username),
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
  datasetData: jsonb("dataset_data").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  typeTargetIdx: index("idx_intelligence_datasets_type_target").on(table.datasetType, table.targetId),
}));

export const trendEvents = pgTable("trend_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  trendType: varchar("trend_type", { length: 100 }).notNull(),
  description: text("description").notNull(),
  significanceScore: numeric("significance_score", { precision: 5, scale: 2 }),
  detectedAt: timestamp("detected_at", { withTimezone: true }).defaultNow().notNull(),
});
`;

const relationsToAdd = `
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
  draft: one(publishingDrafts, {
    fields: [publishingPosts.draftId],
    references: [publishingDrafts.id],
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
`;

let schemaContent = fs.readFileSync('src/lib/db/schema.ts', 'utf8');

// Ensure customType and vector are there
if (!schemaContent.includes('vector(768)')) {
  schemaContent = schemaContent.replace(
    'uniqueIndex,\n  index,\n} from "drizzle-orm/pg-core";',
    'uniqueIndex,\n  index,\n  customType,\n} from "drizzle-orm/pg-core";\n\nconst vector = customType<{ data: number[]; driverData: string }>({ dataType() { return "vector(768)"; }, toDriver(value: number[]): string { return `[\${value.join(",")}]`; } });\n'
  );
}

// Add workspaceId to projects if missing
if (!schemaContent.includes('workspaceId: uuid("workspace_id")')) {
  schemaContent = schemaContent.replace(
    'userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),',
    'userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),\n    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),'
  );
}

// Add missing tables
const splitAt = '// ============================================================================\n// RELATIONS DEFINITIONS';
const parts = schemaContent.split(splitAt);

let finalTables = parts[0] + missingPhase4to5 + missingPhase8to10 + aiiePhase11 + splitAt;
let finalRelations = parts[1] + relationsToAdd;

fs.writeFileSync('src/lib/db/schema.ts', finalTables + finalRelations);
console.log("Rebuilt schema successfully!");
