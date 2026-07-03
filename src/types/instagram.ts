// Instagram-specific domain types
// These are decoupled from database types and from any provider's raw API shape.

export interface InstagramPost {
  id: string;
  thumbnail_url: string | null;
  url: string | null;
  caption: string | null;
  likes: number;
  comments: number;
  timestamp: string | null;
  type: "image" | "video" | "carousel";
}

export interface InstagramProfile {
  username: string;
  display_name: string;
  bio: string | null;
  profile_picture_url: string | null;
  follower_count: number;
  following_count: number;
  post_count: number;
  category: string | null;
  external_url: string | null;
  is_private: boolean;
  is_verified: boolean;
  posts: InstagramPost[];
}
