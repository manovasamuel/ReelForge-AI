import { db } from "@/lib/db";
import { publishingDrafts, publishingPosts, socialAccounts } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { connectorRegistry } from "./connectors/registry";
import { AnalyticsService } from "../analytics/analytics.service";
import { encryptString, decryptString } from "@/lib/security/encryption";
import { PublishParams, SocialAccount, PublishingPost } from "./connectors/connector.interface";

export class PublishingService {
  constructor() {}

  // ==========================================================================
  // DRAFT LIFECYCLE
  // ==========================================================================
  async createDraft(workspaceId: string, title: string, content: string = "", mediaUrls: string[] = []) {
    const [draft] = await db!.insert(publishingDrafts).values({
      workspaceId,
      title,
      content,
      mediaUrls,
      status: "draft"
    }).returning();
    return draft;
  }

  async updateDraft(workspaceId: string, draftId: string, updates: Partial<{ title: string; content: string; mediaUrls: string[]; status: string }>) {
    const [draft] = await db!.update(publishingDrafts)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(and(eq(publishingDrafts.id, draftId), eq(publishingDrafts.workspaceId, workspaceId)))
      .returning();
    return draft;
  }

  async markDraftReady(workspaceId: string, draftId: string) {
    return this.updateDraft(workspaceId, draftId, { status: "ready" });
  }

  // ==========================================================================
  // POST SCHEDULING
  // ==========================================================================
  async schedulePost(workspaceId: string, draftId: string, accountId: string, scheduledFor: Date) {
    const [post] = await db!.insert(publishingPosts).values({
      workspaceId,
      contentAssetId: draftId,
      accountId,
      status: "pending",
      scheduledFor
    }).returning();
    return post;
  }

  // ==========================================================================
  // ORCHESTRATION / IMMEDIATE PUBLISH
  // ==========================================================================
  async publishNow(workspaceId: string, draftId: string, accountId: string) {
    const startTime = Date.now();

    // 1. Fetch Draft and Account
    const draft = await db!.query.publishingDrafts.findFirst({
      where: and(eq(publishingDrafts.id, draftId), eq(publishingDrafts.workspaceId, workspaceId))
    });
    if (!draft) throw new Error("Draft not found");

    const account = await db!.query.socialAccounts.findFirst({
      where: and(eq(socialAccounts.id, accountId), eq(socialAccounts.workspaceId, workspaceId))
    });
    if (!account) throw new Error("Account not found");

    // 2. Create Post record
    const [post] = await db!.insert(publishingPosts).values({
      workspaceId,
      contentAssetId: draftId,
      accountId,
      status: "pending",
    }).returning();

    // 3. Decrypt token and get Connector
    let success = false;
    let errorMessage: string | undefined;

    try {
      const connector = connectorRegistry.getConnector(account.platform);
      
      const decryptedAccount: SocialAccount = {
        ...account,
        encryptedAccessToken: decryptString(account.encryptedAccessToken),
        encryptedRefreshToken: account.encryptedRefreshToken ? decryptString(account.encryptedRefreshToken) : null,
      };

      const params: PublishParams = {
        post,
        account: decryptedAccount,
        content: draft.content || "",
        mediaUrls: draft.mediaUrls as string[]
      };

      // 4. Publish
      const result = await connector.publish(params);

      if (result.success) {
        success = true;
        await db!.update(publishingPosts)
          .set({
            status: "published",
            publishedAt: sql`now()`,
            platformPostId: result.platformPostId,
            updatedAt: sql`now()`
          })
          .where(eq(publishingPosts.id, post.id));
      } else {
        errorMessage = result.error;
        throw new Error(result.error);
      }
    } catch (error: any) {
      errorMessage = error.message;
      await db!.update(publishingPosts)
        .set({
          status: "failed",
          errorMessage: error.message,
          updatedAt: sql`now()`
        })
        .where(eq(publishingPosts.id, post.id));
    } finally {
      // 5. Analytics Telemetry
      const durationMs = Date.now() - startTime;
      await AnalyticsService.trackMemoryOperation(workspaceId, `publish_${account.platform}`, {
        durationMs,
        itemsProcessed: 1,
        successful: success,
        errorMessage
      }).catch(console.error); // Do not block on analytics
    }

    return await db!.query.publishingPosts.findFirst({
      where: eq(publishingPosts.id, post.id)
    });
  }

  // ==========================================================================
  // ACCOUNT MANAGEMENT (with encryption)
  // ==========================================================================
  async addSocialAccount(workspaceId: string, platform: string, accountName: string, accessToken: string, refreshToken?: string, expiresAt?: Date) {
    const [account] = await db!.insert(socialAccounts).values({
      workspaceId,
      platform,
      accountName,
      encryptedAccessToken: encryptString(accessToken),
      encryptedRefreshToken: refreshToken ? encryptString(refreshToken) : null,
      expiresAt
    }).returning();
    return account;
  }
}
