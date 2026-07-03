import type { IInstagramProvider } from "../provider.interface";
import type { InstagramProfile, InstagramPost } from "@/types/instagram";

const MOCK_POSTS: InstagramPost[] = [
  {
    id: "post_001",
    thumbnail_url:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    url: "https://www.instagram.com/p/mock001/",
    caption:
      "Golden hour at its finest 🌅 Nothing beats the view from 3,000 meters. #mountains #landscape #travel",
    likes: 48320,
    comments: 412,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: "image",
  },
  {
    id: "post_002",
    thumbnail_url:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop",
    url: "https://www.instagram.com/p/mock002/",
    caption:
      "The road less traveled always leads somewhere worth going 🛤️ #adventure #wanderlust",
    likes: 62105,
    comments: 738,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    type: "video",
  },
  {
    id: "post_003",
    thumbnail_url:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop",
    url: "https://www.instagram.com/p/mock003/",
    caption: "Stars don't compete — they just shine ✨ #nightsky #astrophotography #nature",
    likes: 91450,
    comments: 1203,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: "image",
  },
  {
    id: "post_004",
    thumbnail_url:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=400&fit=crop",
    url: "https://www.instagram.com/p/mock004/",
    caption:
      "Where the forest meets the fog 🌿 A morning well spent. #forest #nature #hiking",
    likes: 34780,
    comments: 294,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    type: "carousel",
  },
  {
    id: "post_005",
    thumbnail_url:
      "https://images.unsplash.com/photo-1476611338391-6f395a0dd82e?w=400&h=400&fit=crop",
    url: "https://www.instagram.com/p/mock005/",
    caption: "Ocean therapy hits different when you go alone 🌊 #ocean #solitude #peace",
    likes: 55920,
    comments: 567,
    timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    type: "video",
  },
  {
    id: "post_006",
    thumbnail_url:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop",
    url: "https://www.instagram.com/p/mock006/",
    caption: "Peak season, peak vibes 🏔️ Every climb is worth the view. #climbing #peaks",
    likes: 27340,
    comments: 181,
    timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    type: "image",
  },
];

/**
 * MockInstagramProvider — Phase 1 only.
 *
 * Returns realistic hardcoded profile data with a simulated network delay.
 * Makes loading states, success states, and error states fully testable
 * without any API key or external dependency.
 *
 * Replace with ApifyProvider, RapidApiProvider, etc. by updating the factory
 * in ./index.ts — zero changes required anywhere else.
 */
export class MockInstagramProvider implements IInstagramProvider {
  private readonly SIMULATED_DELAY_MS = 1200;

  async getProfile(username: string): Promise<InstagramProfile> {
    // Simulate realistic network latency
    await this.delay(this.SIMULATED_DELAY_MS);

    // Simulate private account
    if (username.toLowerCase() === "private") {
      throw new Error("This account is private.");
    }

    // Simulate not found
    if (username.toLowerCase() === "notfound") {
      throw new Error("No account found with username @notfound.");
    }

    return {
      username: username,
      display_name: this.toDisplayName(username),
      bio: "Travel photographer & storyteller 📷 | Capturing the world one frame at a time | Workshops open 🗓️",
      profile_picture_url:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face",
      follower_count: 248500,
      following_count: 892,
      post_count: 1340,
      category: "Photographer",
      external_url: "https://murugavel.photography",
      is_private: false,
      is_verified: username.length > 6,
      posts: MOCK_POSTS,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private toDisplayName(username: string): string {
    return username
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
