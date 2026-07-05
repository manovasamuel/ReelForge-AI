import type { IInstagramProvider } from "../provider.interface";
import type { InstagramProfile, InstagramPost } from "@/types/instagram";
import { InstagramError } from "@/lib/errors";

/**
 * RapidApiProvider — Live Instagram data ingestion via RapidAPI Instagram Scraper endpoints.
 * Communicates strictly with RapidAPI and returns only internal InstagramProfile model.
 */
export class RapidApiProvider implements IInstagramProvider {
  readonly id = "rapidapi";
  readonly name = "RapidAPI Scraper";

  isAvailable(): boolean {
    return !!process.env.RAPIDAPI_KEY && !!process.env.RAPIDAPI_HOST;
  }

  async getProfile(username: string): Promise<InstagramProfile> {
    const key = process.env.RAPIDAPI_KEY;
    const host = process.env.RAPIDAPI_HOST || "instagram-scraper-api2.p.rapidapi.com";

    if (!key) {
      throw new InstagramError("RapidAPI key is not configured.");
    }

    const endpoint = `https://${host}/v1/info?username_or_id_or_url=${encodeURIComponent(username)}`;

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "x-rapidapi-key": key,
          "x-rapidapi-host": host,
        },
      });
    } catch (e) {
      throw new InstagramError(`RapidAPI network failure: ${e instanceof Error ? e.message : "Unknown error"}`);
    }

    if (response.status === 429) {
      throw new InstagramError("RapidAPI rate limit exceeded (HTTP 429).");
    }

    if (!response.ok) {
      throw new InstagramError(`RapidAPI returned HTTP ${response.status}: ${response.statusText}`);
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new InstagramError("Failed to parse RapidAPI JSON response.");
    }

    const item = data.data || data.user || data;
    if (!item || !item.username) {
      throw new InstagramError(`No Instagram profile found for @${username} on RapidAPI.`);
    }

    if (item.is_private) {
      throw new InstagramError("This Instagram account is private.");
    }

    const rawPosts = item.edge_owner_to_timeline_media?.edges || item.posts || [];
    const posts: InstagramPost[] = Array.isArray(rawPosts)
      ? rawPosts.slice(0, 12).map((edge: any, index: number): InstagramPost => {
          const post = edge.node || edge;
          return {
            id: String(post.id || post.shortcode || `rapid_${index}`),
            thumbnail_url: post.display_url || post.thumbnail_src || null,
            url: post.shortcode ? `https://www.instagram.com/p/${post.shortcode}/` : null,
            caption: post.edge_media_to_caption?.edges?.[0]?.node?.text || post.caption || null,
            likes: Number(post.edge_liked_by?.count || post.like_count || 0),
            comments: Number(post.edge_media_to_comment?.count || post.comment_count || 0),
            timestamp: post.taken_at_timestamp ? new Date(post.taken_at_timestamp * 1000).toISOString() : null,
            type: post.is_video ? "video" : post.__typename === "GraphSidecar" ? "carousel" : "image",
          };
        })
      : [];

    return {
      username: item.username || username,
      display_name: item.full_name || item.username || username,
      bio: item.biography || null,
      profile_picture_url: item.profile_pic_url_hd || item.profile_pic_url || null,
      follower_count: Number(item.edge_followed_by?.count || item.follower_count || 0),
      following_count: Number(item.edge_follow?.count || item.following_count || 0),
      post_count: Number(item.edge_owner_to_timeline_media?.count || item.media_count || 0),
      category: item.category_name || null,
      external_url: item.external_url || null,
      is_private: Boolean(item.is_private),
      is_verified: Boolean(item.is_verified),
      posts,
    };
  }
}
