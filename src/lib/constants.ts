// App-wide constants

export const APP_NAME = "ReelForge AI";
export const APP_DESCRIPTION =
  "Internal AI Content Intelligence Platform for Instagram competitor analysis and content generation.";

// Platform targets for repurposing
export const PLATFORMS = {
  INSTAGRAM: "instagram",
  LINKEDIN: "linkedin",
  X: "x",
  FACEBOOK: "facebook",
  THREADS: "threads",
  YOUTUBE_SHORTS: "youtube_shorts",
} as const;

export type Platform = (typeof PLATFORMS)[keyof typeof PLATFORMS];

export const PLATFORM_LABELS: Record<Platform, string> = {
  [PLATFORMS.INSTAGRAM]: "Instagram",
  [PLATFORMS.LINKEDIN]: "LinkedIn",
  [PLATFORMS.X]: "X",
  [PLATFORMS.FACEBOOK]: "Facebook",
  [PLATFORMS.THREADS]: "Threads",
  [PLATFORMS.YOUTUBE_SHORTS]: "YouTube Shorts",
};

// Repurpose targets (excludes Instagram since it's the source)
export const REPURPOSE_TARGETS = [
  PLATFORMS.LINKEDIN,
  PLATFORMS.X,
  PLATFORMS.FACEBOOK,
  PLATFORMS.THREADS,
  PLATFORMS.YOUTUBE_SHORTS,
] as const;

export type RepurposeTarget = (typeof REPURPOSE_TARGETS)[number];

// Analysis limits
export const MAX_COMPETITORS = 10;
export const TOP_REELS_COUNT = 10;
export const MIN_COMPETITORS = 5;

// UI breakpoints (matches Tailwind defaults)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1440,
} as const;

// Navigation routes
export const ROUTES = {
  HOME: "/",
  PROFILES: "/profiles",
  PROFILE: (id: string) => `/profiles/${id}`,
  COMPETITORS: (id: string) => `/profiles/${id}/competitors`,
  ANALYSIS: (id: string) => `/profiles/${id}/analysis`,
  ANALYSIS_SESSION: (profileId: string, sessionId: string) =>
    `/profiles/${profileId}/analysis/${sessionId}`,
  REELS: (profileId: string, sessionId: string) =>
    `/profiles/${profileId}/analysis/${sessionId}/reels`,
  PATTERNS: (profileId: string, sessionId: string) =>
    `/profiles/${profileId}/analysis/${sessionId}/patterns`,
  INTELLIGENCE: (profileId: string, sessionId: string) =>
    `/profiles/${profileId}/analysis/${sessionId}/intelligence`,
  CONTENT: (profileId: string) => `/profiles/${profileId}/content`,
  CONTENT_DETAIL: (profileId: string, contentId: string) =>
    `/profiles/${profileId}/content/${contentId}`,
  REPURPOSE: (profileId: string, contentId: string) =>
    `/profiles/${profileId}/content/${contentId}/repurpose`,
} as const;

// Content package sections
export const CONTENT_SECTIONS = [
  "hook",
  "shot_list",
  "full_script",
  "camera_directions",
  "editing_notes",
  "caption",
  "cta",
  "hashtags",
] as const;

export type ContentSection = (typeof CONTENT_SECTIONS)[number];

export const CONTENT_SECTION_LABELS: Record<ContentSection, string> = {
  hook: "Hook",
  shot_list: "Shot List",
  full_script: "Full Script",
  camera_directions: "Camera Directions",
  editing_notes: "Editing Notes",
  caption: "Caption",
  cta: "Call to Action",
  hashtags: "Hashtags",
};
