import { z } from "zod";

// Instagram URL validation
const INSTAGRAM_URL_REGEX = /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+(\/?|\/?\?.*|\/?#.*)$/;

export const instagramUrlSchema = z
  .string()
  .url("Please enter a valid URL")
  .regex(INSTAGRAM_URL_REGEX, "Please enter a valid Instagram profile URL (e.g., https://instagram.com/username)");

// Extract username from Instagram URL
export function extractUsername(url: string): string {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length > 0 && parts[0]) {
      return parts[0];
    }
  } catch {}
  const match = url.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
  if (!match || !match[1]) {
    throw new Error("Could not extract username from URL");
  }
  return match[1];
}

// Profile analysis request
export const analyzeProfileSchema = z.object({
  instagramUrl: instagramUrlSchema,
});

// Competitor management
export const addCompetitorSchema = z.object({
  profileId: z.string().uuid(),
  username: z.string().min(1, "Username is required"),
  instagramUrl: instagramUrlSchema,
});

// Content generation request
export const generateContentSchema = z.object({
  sessionId: z.string().uuid(),
  reportId: z.string().uuid().optional(),
  customBrief: z.string().max(1000, "Brief must be under 1000 characters").optional(),
});

// Repurpose request
export const repurposeContentSchema = z.object({
  contentId: z.string().uuid(),
  platforms: z
    .array(z.enum(["linkedin", "x", "facebook", "threads", "youtube_shorts"]))
    .min(1, "Select at least one platform"),
});

// Generic pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Type exports
export type AnalyzeProfileInput = z.infer<typeof analyzeProfileSchema>;
export type AddCompetitorInput = z.infer<typeof addCompetitorSchema>;
export type GenerateContentInput = z.infer<typeof generateContentSchema>;
export type RepurposeContentInput = z.infer<typeof repurposeContentSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
