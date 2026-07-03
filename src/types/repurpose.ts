// Domain types for Phase 9 — Multi-Platform Repurpose Engine (MVP)

export interface PlatformContentMetrics {
  wordCount: number;
  characterCount: number;
  readingTimeSeconds: number; // e.g. based on ~200 wpm reading speed
}

export interface LinkedInRepurpose {
  professionalHook: string;
  longFormPost: string;
  cta: string;
  hashtags: string[];
  metrics: PlatformContentMetrics;
}

export interface XThreadTweet {
  tweetNumber: number;
  content: string;
}

export interface XRepurpose {
  thread: XThreadTweet[];
  cta: string;
  metrics: PlatformContentMetrics;
}

export interface ThreadsRepurpose {
  conversationalPost: string;
  cta: string;
  metrics: PlatformContentMetrics;
}

export interface FacebookRepurpose {
  communityPost: string;
  cta: string;
  metrics: PlatformContentMetrics;
}

export interface YouTubeShortsRepurpose {
  title: string;
  description: string;
  tags: string[];
  cta: string;
  metrics: PlatformContentMetrics;
}

export interface RepurposeReport {
  id: string;
  createdAt: string;
  sourcePackageId: string;
  instagram: {
    title: string;
    caption: string;
    cta: string;
    hashtags: string;
    metrics: PlatformContentMetrics;
  };
  linkedIn: LinkedInRepurpose;
  x: XRepurpose;
  threads: ThreadsRepurpose;
  facebook: FacebookRepurpose;
  youtubeShorts: YouTubeShortsRepurpose;
}
