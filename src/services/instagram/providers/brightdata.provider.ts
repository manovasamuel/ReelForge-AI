import type { IInstagramProvider } from "../provider.interface";
import type { InstagramProfile, InstagramPost } from "@/types/instagram";
import { InstagramError } from "@/lib/errors";

/**
 * BrightDataProvider — Live Instagram data ingestion via Bright Data Web Scraper API.
 * Communicates strictly with Bright Data API and returns only internal InstagramProfile model.
 */
export class BrightDataProvider implements IInstagramProvider {
  readonly id = "brightdata";
  readonly name = "Bright Data Scraper";

  isAvailable(): boolean {
    return !!process.env.BRIGHTDATA_API_TOKEN;
  }

  async getProfile(username: string): Promise<InstagramProfile> {
    const token = process.env.BRIGHTDATA_API_TOKEN;
    if (!token) {
      throw new InstagramError("Bright Data API token is not configured.");
    }

    // Bright Data dataset endpoint for Instagram Profile Scraper
    const endpoint = "https://api.brightdata.com/datasets/v3/scrape?dataset_id=gd_l1viktl72bvl7bjuj0&include_errors=true";

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ url: `https://www.instagram.com/${username}/` }]),
      });
    } catch (e) {
      throw new InstagramError(`Bright Data network failure: ${e instanceof Error ? e.message : "Unknown error"}`);
    }

    if (response.status === 429) {
      throw new InstagramError("Bright Data rate limit exceeded (HTTP 429).");
    }

    if (!response.ok) {
      throw new InstagramError(`Bright Data API returned HTTP ${response.status}: ${response.statusText}`);
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new InstagramError("Failed to parse Bright Data API JSON response.");
    }

    const items = Array.isArray(data) ? data : data.items || data.data || [];
    if (items.length === 0 || !items[0]) {
      throw new InstagramError(`No Instagram profile found for @${username} on Bright Data.`);
    }

    const item = items[0];

    if (item.is_private || item.private) {
      throw new InstagramError("This Instagram account is private.");
    }

    const rawPosts = item.posts || item.recent_posts || [];
    const posts: InstagramPost[] = Array.isArray(rawPosts)
      ? rawPosts.slice(0, 12).map((post: any, index: number): InstagramPost => ({
          id: String(post.id || post.shortcode || `bd_${index}`),
          thumbnail_url: post.display_url || post.thumbnail || post.image_url || null,
          url: post.url || (post.shortcode ? `https://www.instagram.com/p/${post.shortcode}/` : null),
          caption: post.caption || post.description || null,
          likes: Number(post.likes || post.likes_count || 0),
          comments: Number(post.comments || post.comments_count || 0),
          timestamp: post.date || post.timestamp ? new Date(post.date || post.timestamp).toISOString() : null,
          type: post.is_video || post.type === "video" ? "video" : post.type === "carousel" ? "carousel" : "image",
        }))
      : [];

    return {
      username: item.username || username,
      display_name: item.full_name || item.name || item.username || username,
      bio: item.biography || item.bio || null,
      profile_picture_url: item.profile_pic_url || item.profile_image || null,
      follower_count: Number(item.followers || item.followers_count || 0),
      following_count: Number(item.following || item.following_count || 0),
      post_count: Number(item.posts_count || item.media_count || 0),
      category: item.category || null,
      external_url: item.external_url || item.website || null,
      is_private: Boolean(item.is_private || item.private),
      is_verified: Boolean(item.is_verified || item.verified),
      posts,
    };
  }
}
