import type { IInstagramProvider } from "./provider.interface";
import type { InstagramProfile } from "@/types/instagram";
import { InstagramError } from "@/lib/errors";

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
    const cleaned = username.trim().replace(/^@/, "").toLowerCase();

    if (!cleaned || cleaned.length < 1) {
      throw new InstagramError("Username cannot be empty.");
    }

    if (!/^[a-zA-Z0-9._]{1,30}$/.test(cleaned)) {
      throw new InstagramError(
        `"${cleaned}" is not a valid Instagram username.`
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
