import { InstagramProfile, InstagramPost } from "@/types/instagram";

/**
 * NormalizationService standardizes raw API payloads from various 
 * Instagram data providers into the Canonical Domain Models.
 */
export class NormalizationService {
  /**
   * Maps a raw Apify item into the canonical InstagramProfile.
   * Handles null-safety and type enforcement.
   */
  public mapApifyProfile(username: string, item: any): InstagramProfile {
    const posts: InstagramPost[] = Array.isArray(item.latestPosts)
      ? item.latestPosts.map((post: any, index: number) => this.mapApifyPost(post, index))
      : [];

    return {
      username: item.username || username,
      display_name: item.fullName || item.username || username,
      bio: item.biography || null,
      profile_picture_url: item.profilePicUrl || item.profilePicUrlHD || null,
      follower_count: Number(item.followersCount || 0),
      following_count: Number(item.followsCount || 0),
      post_count: Number(item.postsCount || 0),
      category: item.businessCategoryName || null,
      external_url: item.externalUrl || null,
      is_private: Boolean(item.isPrivate),
      is_verified: Boolean(item.isVerified),
      posts,
    };
  }

  /**
   * Maps a raw Apify post into the canonical InstagramPost.
   */
  public mapApifyPost(post: any, index: number): InstagramPost {
    return {
      id: String(post.id || post.shortCode || `apify_${index}`),
      thumbnail_url: post.displayUrl || post.thumbnailUrl || null,
      url: post.url || (post.shortCode ? `https://www.instagram.com/p/${post.shortCode}/` : null),
      caption: post.caption || null,
      likes: Number(post.likesCount || 0),
      comments: Number(post.commentsCount || 0),
      timestamp: post.timestamp ? new Date(post.timestamp).toISOString() : null,
      type: post.type === "Video" ? "video" : post.type === "Sidecar" ? "carousel" : "image",
    };
  }
}

export const normalizationService = new NormalizationService();
