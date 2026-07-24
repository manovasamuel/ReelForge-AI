import { db } from "@/lib/db";
import { publishingPosts, contentAssets, socialAccounts } from "@/lib/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// ---------------------------------------------------------
// 1. Provider Adapter Interface
// ---------------------------------------------------------
export interface SocialProviderInterface {
  connect(credentials: any): Promise<boolean>;
  publish(asset: any): Promise<{ success: boolean; platformPostId?: string; error?: string }>;
  getStatus(platformPostId: string): Promise<string>;
}

// ---------------------------------------------------------
// 2. Instagram Provider (Mock Implementation for MVP)
// ---------------------------------------------------------
export class InstagramProvider implements SocialProviderInterface {
  async connect(credentials: any) {
    return true; 
  }
  
  async publish(asset: any) {
    console.log(`[InstagramProvider] Simulating publishing for asset: ${asset.title}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 95% success rate for simulation
    if (Math.random() > 0.05) {
      return { success: true, platformPostId: `ig_${uuidv4()}` };
    } else {
      return { success: false, error: "Instagram API Rate Limit Exceeded" };
    }
  }

  async getStatus(platformPostId: string) {
    return "published";
  }
}

// ---------------------------------------------------------
// 3. Publishing Engine Service
// ---------------------------------------------------------
export class PublishingEngineService {
  private providers: Record<string, SocialProviderInterface> = {
    'Instagram': new InstagramProvider(),
    // Future providers: 'LinkedIn': new LinkedInProvider(), etc.
  };

  /**
   * Schedule an asset for publishing.
   */
  async schedulePost(workspaceId: string, assetId: string, accountId: string, scheduledFor: Date) {
    const [scheduledPost] = await db.insert(publishingPosts).values({
      workspaceId,
      contentAssetId: assetId,
      accountId,
      scheduledFor,
      status: 'Scheduled'
    }).returning();

    // Update asset state
    await db.update(contentAssets)
      .set({ contentState: 'Scheduled' })
      .where(eq(contentAssets.id, assetId));

    return scheduledPost;
  }

  /**
   * Background Cron Job: Find due posts and execute them.
   */
  async executePublishingJob() {
    console.log(`[PublishingEngine] Running execution job...`);

    // 1. Find all 'Scheduled' or 'Retrying' posts where scheduledFor <= now
    const duePosts = await db.select()
      .from(publishingPosts)
      .where(
        and(
          lte(publishingPosts.scheduledFor, new Date()),
          eq(publishingPosts.status, 'Scheduled') // Simplification for MVP (should also include Retrying)
        )
      );

    if (duePosts.length === 0) return { success: true, message: "No posts due." };

    let successCount = 0;
    let failCount = 0;

    // 2. Process each post
    for (const post of duePosts) {
      try {
        // Mark as Queued/Publishing
        await db.update(publishingPosts).set({ status: 'Publishing' }).where(eq(publishingPosts.id, post.id));

        // Get Provider
        const account = await db.select().from(socialAccounts).where(eq(socialAccounts.id, post.accountId)).limit(1);
        if (account.length === 0) throw new Error("Account not found");
        
        const provider = this.providers[account[0].platform] || this.providers['Instagram'];

        // Get Asset Content
        const asset = await db.select().from(contentAssets).where(eq(contentAssets.id, post.contentAssetId)).limit(1);
        
        // Execute Publish
        const result = await provider.publish(asset[0]);

        if (result.success) {
          // Update Post
          await db.update(publishingPosts).set({
            status: 'Published',
            platformPostId: result.platformPostId,
            publishedAt: new Date()
          }).where(eq(publishingPosts.id, post.id));

          // Update Asset & Sync Metadata
          await db.update(contentAssets).set({
            contentState: 'Published',
            platform: account[0].platform,
            platformPostId: result.platformPostId,
            publishedAt: new Date()
          }).where(eq(contentAssets.id, asset[0].id));

          successCount++;
        } else {
          throw new Error(result.error);
        }

      } catch (error: any) {
        failCount++;
        
        const nextRetry = post.retryCount + 1;
        const newStatus = nextRetry >= 3 ? 'Failed' : 'Retrying';
        
        await db.update(publishingPosts).set({
          status: newStatus,
          errorMessage: error.message,
          retryCount: nextRetry
        }).where(eq(publishingPosts.id, post.id));
      }
    }

    return { success: true, message: `Processed ${duePosts.length} posts. Success: ${successCount}, Failed: ${failCount}` };
  }
}

export const publishingEngine = new PublishingEngineService();
