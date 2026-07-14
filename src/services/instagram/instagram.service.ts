import type { IInstagramProvider } from "./provider.interface";
import type { InstagramProfile } from "@/types/instagram";
import { InstagramError } from "@/lib/errors";
import { normalizeInstagramUsername } from "./instagram.utils";

/**
 * InstagramService — orchestration layer for Instagram profile data.
 *
 * Receives a provider via constructor injection.
 * Validates input, delegates to the provider, and maps errors uniformly.
 * Route handlers call this — never the provider directly.
 */
export class InstagramService {
  constructor(private readonly provider: IInstagramProvider) {}

  /**
   * Fetch a public Instagram profile by username.
   * @param username — plain username (no @, no URL)
   * @returns InstagramProfile
   * @throws InstagramError with a user-friendly message
   */
  async fetchProfile(username: string): Promise<InstagramProfile> {
    const cleaned = normalizeInstagramUsername(username);

    if (!cleaned || cleaned.length < 1) {
      throw new InstagramError(
        `"${username}" is not a valid Instagram username or URL.`
      );
    }

    try {
      const profile = await this.provider.getProfile(cleaned);
      return profile;
    } catch (error) {
      if (error instanceof InstagramError) {
        throw error;
      }

      // Wrap unknown provider errors into a typed InstagramError
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch Instagram profile. Please try again.";

      throw new InstagramError(message);
    }
  }
}
