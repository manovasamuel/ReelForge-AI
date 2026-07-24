import { IInstagramProvider } from "@/services/instagram/provider.interface";
import { FailoverInstagramProvider } from "@/services/instagram/providers/failover.provider";
import { InstagramProfile, InstagramPost } from "@/types/instagram";

/**
 * ProviderOrchestrator is the central entry point for all data acquisition in AIIE.
 * The rest of the platform should never know which specific provider (Apify, RapidAPI, etc.)
 * is fulfilling the request.
 */
export class ProviderOrchestrator {
  private provider: IInstagramProvider;

  constructor() {
    // The FailoverProvider internally manages primary (Apify) and fallback providers,
    // as well as retry logic and caching.
    this.provider = new FailoverInstagramProvider();
  }

  /**
   * Fetch a complete profile, including its latest posts.
   */
  async fetchProfile(username: string): Promise<InstagramProfile> {
    const profile = await this.provider.getProfile(username);
    return profile;
  }

  /**
   * Fetch recent posts for a given username.
   */
  async fetchPosts(username: string): Promise<InstagramPost[]> {
    const profile = await this.provider.getProfile(username);
    return profile.posts || [];
  }

  /**
   * Fetch comments for a specific post.
   * Note: This may require an extension to the underlying provider interface in the future.
   */
  async fetchComments(postUrl: string): Promise<any[]> {
    console.warn("[ProviderOrchestrator] fetchComments not yet supported by underlying providers.");
    return [];
  }

  /**
   * Fetch posts related to a specific hashtag.
   */
  async fetchHashtags(hashtag: string): Promise<InstagramPost[]> {
    console.warn("[ProviderOrchestrator] fetchHashtags not yet supported by underlying providers.");
    return [];
  }

  /**
   * Fetch posts using a specific audio track.
   */
  async fetchAudio(audioId: string): Promise<InstagramPost[]> {
    console.warn("[ProviderOrchestrator] fetchAudio not yet supported by underlying providers.");
    return [];
  }
}

export const providerOrchestrator = new ProviderOrchestrator();
