import type { InstagramProfile } from "@/types/instagram";

/**
 * Contract that every Instagram data provider must implement.
 * The service layer depends only on this interface — never on a concrete provider.
 *
 * To add a new provider (e.g. Apify, RapidAPI, BrightData):
 *   1. Create a new file in ./providers/ implementing this interface
 *   2. Register it in ./providers/index.ts
 *   3. Set INSTAGRAM_PROVIDER env var — zero other changes required
 */
export interface IInstagramProvider {
  readonly id: string;
  readonly name: string;
  /**
   * Checks whether the provider is configured and available (e.g., API tokens present).
   */
  isAvailable(): boolean;
  /**
   * Fetch a public Instagram profile by username.
   * @param username — plain username, no @ prefix, no URL
   * @throws InstagramError on private accounts, not found, or provider failure
   */
  getProfile(username: string): Promise<InstagramProfile>;
}
