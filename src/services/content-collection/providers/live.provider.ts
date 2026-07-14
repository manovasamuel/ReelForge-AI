import type { CollectedContentItem, ContentType } from "@/types/content-collection";
import type { IContentCollectionProvider } from "../provider.interface";
import type { IInstagramProvider } from "@/services/instagram/provider.interface";
import { getInstagramProvider } from "@/services/instagram/providers";
import { InstagramError } from "@/lib/errors";

/**
 * LiveContentCollectionProvider — bridges the verified Instagram ingestion engine
 * to the Content Collection domain for Stage 3B Phase 1.
 *
 * Invokes getProfile(username) once per collectContent() execution through the configured
 * live Instagram provider (or injected test provider). Upstream duplicate endpoint calls
 * (e.g., retries or Actor behaviors) are handled separately by provider policies.
 *
 * Mapping Principles & Accuracy Requirements:
 * - Real values returned by scraper: likes, comments, caption, thumbnail_url, timestamp, id.
 * - Derived values: type ("video" mapped to "reel"), hashtags (extracted via regex from caption).
 * - Unavailable / defaulted fields:
 *     - views: 0 (Strictly treated as unavailable/defaulted from profile item list, NOT an empirically measured zero-view count).
 *     - isPinned: false (Strictly treated as defaulted/unknown, NOT confirmed real data).
 *     - publishDate: post.timestamp || "" (Missing timestamp is explicitly preserved as empty string "" within the string type contract, preventing recency fabrication via new Date().toISOString()).
 * - Permalink safety: post.url is an Instagram permalink (not a direct playable MP4 video file), so videoUrl is not fabricated.
 */
export class LiveContentCollectionProvider implements IContentCollectionProvider {
  constructor(private readonly instagramProvider?: IInstagramProvider) {}

  async collectContent(competitorUsername: string): Promise<CollectedContentItem[]> {
    const cleaned = competitorUsername.trim().replace(/^@/, "").toLowerCase();
    if (!cleaned) {
      throw new InstagramError("Competitor username cannot be empty.");
    }

    // 1. Resolve live Instagram provider (disallowing silent fallback to MockProvider when not testing with fixture)
    const provider =
      this.instagramProvider ??
      getInstagramProvider(process.env.INSTAGRAM_PROVIDER || "apify", false);

    if (!this.instagramProvider && provider.id === "mock") {
      throw new InstagramError(
        "LiveContentCollectionProvider requires a configured live Instagram provider, but 'mock' was resolved."
      );
    }

    const profile = await provider.getProfile(cleaned);

    if (!profile.posts || !Array.isArray(profile.posts)) {
      return [];
    }

    // 2. Map real InstagramPost[] to domain CollectedContentItem[]
    return profile.posts.map((post, index) => {
      let type: ContentType = "post";
      if (post.type === "video") {
        type = "reel";
      } else if (post.type === "carousel") {
        type = "carousel";
      } else if (post.type === "image") {
        type = "image";
      }

      const caption = post.caption || "";
      const hashtagMatches = caption.match(/#[a-zA-Z0-9_]+/g);
      const hashtags = hashtagMatches ? Array.from(new Set(hashtagMatches)) : [];

      return {
        id: post.id || `post-${cleaned}-${index + 1}`,
        competitorUsername: profile.username || cleaned,
        thumbnailUrl: post.thumbnail_url || profile.profile_picture_url || "",
        type,
        // views: 0 is strictly treated as unavailable/defaulted, NOT empirically measured zero views.
        views: 0,
        viewsAvailable: false,
        likes: typeof post.likes === "number" ? post.likes : 0,
        comments: typeof post.comments === "number" ? post.comments : 0,
        // Smallest type-safe solution: preserve missing timestamp as empty string "" within string contract.
        // Do NOT replace with new Date().toISOString() to avoid fabricating publication recency.
        publishDate: post.timestamp || "",
        caption,
        hashtags,
        // isPinned: false is strictly treated as defaulted/unknown, NOT confirmed real data.
        isPinned: false,
      };
    });
  }
}
