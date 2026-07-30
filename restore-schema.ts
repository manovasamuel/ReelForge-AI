import * as fs from 'fs';
import * as path from 'path';

const schemaPath = path.join(__dirname, 'src', 'lib', 'db', 'schema.ts');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Check if we need to add workspaceId to projects
if (!schemaContent.includes('workspaceId: uuid("workspace_id")') || !schemaContent.includes('export const projects')) {
    // Add workspaceId to projects
    schemaContent = schemaContent.replace(
        `userId: uuid("user_id")\n      .notNull()\n      .references(() => users.id, { onDelete: "cascade" }),`,
        `userId: uuid("user_id")\n      .notNull()\n      .references(() => users.id, { onDelete: "cascade" }),\n    workspaceId: uuid("workspace_id")\n      .references(() => workspaces.id, { onDelete: "cascade" }),`
    );
}

const missingTables = `

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
  // Note: we can omit vector if not imported, or just import it. We need custom vector type:
  // embedding: customType({ dataType() { return 'vector(768)'; } })("embedding"),
  embeddingStatus: varchar("embedding_status", { length: 50 }).default("Pending").notNull(),
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
  // embedding: customType({ dataType() { return 'vector(768)'; } })("embedding"),
  importance: integer("importance").default(5).notNull(),
  accessCount: integer("access_count").default(0).notNull(),
  lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  scopeIdx: index("idx_ltm_scope").on(table.userId, table.scope, table.scopeId),
}));

`;

if (!schemaContent.includes('export const brandProfiles')) {
    const splitStr = '// ============================================================================\n// RELATIONS DEFINITIONS';
    const parts = schemaContent.split(splitStr);
    schemaContent = parts[0] + missingTables + splitStr + parts[1];
}

schemaContent = schemaContent.replace(`import {
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
} from "drizzle-orm/pg-core";`, `import {
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
    return 'vector(768)';
  },
  toDriver(value: number[]): string {
    return \`[\${value.join(',')}]\`;
  },
});
`);

schemaContent = schemaContent.replace('// embedding: customType', 'embedding: vector("embedding"), // ');

fs.writeFileSync(schemaPath, schemaContent);
console.log('Restored schema.ts');
