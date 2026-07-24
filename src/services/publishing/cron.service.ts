import { db } from "@/lib/db";
import { publishingPosts } from "@/lib/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { PublishingService } from "./publishing.service";

export class PublishingCronService {
  constructor(private readonly publishingService: PublishingService) {}

  /**
   * Processes all pending posts that are scheduled for now or in the past.
   * Ensures idempotency by checking status='pending' and 'scheduledFor' <= now.
   */
  async processScheduledPosts(): Promise<{ processed: number; success: number; failed: number }> {
    const now = new Date();

    // 1. Find all pending posts scheduled up to now
    const postsToPublish = await db!.query.publishingPosts.findMany({
      where: and(
        eq(publishingPosts.status, "pending"),
        lte(publishingPosts.scheduledFor, now)
      )
    });

    if (postsToPublish.length === 0) {
      return { processed: 0, success: 0, failed: 0 };
    }

    let successCount = 0;
    let failedCount = 0;

    // 2. Iterate and publish each
    for (const post of postsToPublish) {
      try {
        // Immediate publish handles updating the post status to 'published' or 'failed'
        const result = await this.publishingService.publishNow(post.workspaceId, post.contentAssetId, post.accountId);
        if (result?.status === "published") {
          successCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        console.error(`Failed to process scheduled post ${post.id}:`, error);
        failedCount++;
      }
    }

    return {
      processed: postsToPublish.length,
      success: successCount,
      failed: failedCount
    };
  }
}
