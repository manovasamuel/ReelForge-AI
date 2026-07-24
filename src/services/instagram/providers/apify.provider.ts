import type { IInstagramProvider } from "../provider.interface";
import type { InstagramProfile, InstagramPost } from "@/types/instagram";
import { InstagramError } from "@/lib/errors";
import { normalizationService } from "@/services/intelligence/normalization.service";

/**
 * ApifyProvider — Live Instagram data ingestion via Apify Instagram Profile Scraper Actor.
 * Communicates strictly with Apify API and returns only internal InstagramProfile model.
 */
export class ApifyProvider implements IInstagramProvider {
  readonly id = "apify";
  readonly name = "Apify Scraper";

  isAvailable(): boolean {
    return !!process.env.APIFY_API_TOKEN;
  }

  async getProfile(username: string): Promise<InstagramProfile> {
    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      throw new InstagramError("Apify API token is not configured.");
    }

    const endpoint = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${token}`;

    const controller = new AbortController();
    const abortTimeout = setTimeout(() => controller.abort(), 45000);

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: [username] }),
        signal: controller.signal,
      });
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        throw new InstagramError("Apify request timed out after 45000ms.");
      }
      throw new InstagramError(`Apify network failure: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      clearTimeout(abortTimeout);
    }

    if (response.status === 429) {
      throw new InstagramError("Apify rate limit exceeded (HTTP 429).");
    }

    if (!response.ok) {
      throw new InstagramError(`Apify API returned HTTP ${response.status}: ${response.statusText}`);
    }

    let data: any[];
    try {
      data = await response.json();
    } catch {
      throw new InstagramError("Failed to parse Apify API JSON response.");
    }

    if (!Array.isArray(data) || data.length === 0 || !data[0]) {
      throw new InstagramError(`No Instagram profile found for @${username} on Apify.`);
    }

    const item = data[0];

    if (item.isPrivate) {
      throw new InstagramError("This Instagram account is private.");
    }

    // Map raw Apify item to internal InstagramProfile domain model using NormalizationService
    return normalizationService.mapApifyProfile(username, item);
  }
}
