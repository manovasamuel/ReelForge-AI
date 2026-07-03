// Domain types for Phase 5 — Content Collection Engine

export type ContentType = "reel" | "post" | "carousel" | "image" | "video";

export type CategoryOption = "all" | "reels" | "posts" | "carousel" | "images" | "videos";

export type FilterOption =
  | "all"
  | "pinned"
  | "high-engagement"
  | "newest"
  | "oldest"
  | "most-viewed"
  | "most-liked"
  | "most-commented";

export type SortOption = "views" | "likes" | "comments" | "newest" | "oldest";

export interface CollectedContentItem {
  id: string;
  competitorUsername: string;
  thumbnailUrl: string;
  type: ContentType;
  views: number;
  likes: number;
  comments: number;
  publishDate: string; // ISO string
  caption: string;
  hashtags: string[];
  durationSeconds?: number; // for reels / videos
  mediaCount?: number; // for carousels
  isPinned: boolean;
}
