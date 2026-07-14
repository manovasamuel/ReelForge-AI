import type { IInstagramProvider } from "../provider.interface";
import type { InstagramProfile } from "@/types/instagram";
import { InstagramError } from "@/lib/errors";
import { ApifyProvider } from "./apify.provider";
import { BrightDataProvider } from "./brightdata.provider";
import { RapidApiProvider } from "./rapidapi.provider";
import { MockInstagramProvider } from "./mock.provider";
import { CircuitBreakerStore } from "@/lib/reliability/circuit-breaker";
import { ProfileRepository } from "@/lib/db/repositories/profile.repository";
import { normalizeInstagramUsername, isValidInstagramProfile } from "../instagram.utils";

/**
 * FailoverInstagramProvider — Dedicated Provider Orchestrator for Live Instagram Data Ingestion.
 *
 * Implements:
 * - Dynamic priority ordering (User Settings -> Env Config -> Health Status -> Available Credentials)
 * - Configurable timeout per provider attempt (default 15s)
 * - Exponential backoff retry strategy (1 retry per provider on transient failures)
 * - In-memory provider health tracking & circuit breaking (60s cooldown on 3 consecutive failures)
 * - Stage 3B Phase 4A: Shared Supabase Empirical Profile Cache lookup & upsert (0 scraper calls on hit)
 * - Structured logging & telemetry
 * - Graceful degradation to permanent MockProvider fallback
 */
export class FailoverInstagramProvider implements IInstagramProvider {
  readonly id = "failover";
  readonly name = "Failover Orchestrator";

  private readonly TIMEOUT_MS = 15000; // 15 seconds per provider attempt
  private readonly MAX_RETRIES = 1; // 1 retry per provider before failing over
  private readonly COOLDOWN_MS = 60000; // 60s cooldown for unhealthy providers

  private readonly allProviders: IInstagramProvider[];
  private readonly mockProvider: MockInstagramProvider;

  constructor(
    preferredProviderType?: string,
    private readonly allowMockFallback: boolean = true
  ) {
    this.mockProvider = new MockInstagramProvider();
    const apify = new ApifyProvider();
    const brightdata = new BrightDataProvider();
    const rapidapi = new RapidApiProvider();

    // Determine dynamic priority chain:
    // 1. Preferred provider (from UI request/Settings or INSTAGRAM_PROVIDER env)
    // 2. Remaining live providers
    // 3. Permanent fallback to MockProvider (only when allowMockFallback is true)
    const activePreference = (preferredProviderType || process.env.INSTAGRAM_PROVIDER || "mock").toLowerCase();

    const liveMap: Record<string, IInstagramProvider> = {
      apify,
      brightdata,
      rapidapi,
    };

    const ordered: IInstagramProvider[] = [];
    if (activePreference !== "mock" && liveMap[activePreference]) {
      ordered.push(liveMap[activePreference]!);
    }

    // Add remaining live providers in default order
    for (const key of ["apify", "brightdata", "rapidapi"]) {
      if (key !== activePreference && liveMap[key]) {
        ordered.push(liveMap[key]!);
      }
    }

    // Terminate with MockProvider only when fallback is allowed
    if (this.allowMockFallback) {
      ordered.push(this.mockProvider);
    }
    this.allProviders = ordered;
  }

  isAvailable(): boolean {
    if (!this.allowMockFallback) {
      return this.allProviders.some((provider) => provider.isAvailable());
    }
    return true;
  }

  async getProfile(username: string): Promise<InstagramProfile> {
    const cleanUsername = normalizeInstagramUsername(username);
    if (!cleanUsername) {
      throw new InstagramError(`"${username}" is not a valid Instagram username or URL.`);
    }

    // 0. Check empirical profile cache before making any live scraper calls
    const cachedProfile = await ProfileRepository.getFreshByUsername(cleanUsername);
    if (cachedProfile) {
      this.log("INFO", `Serving @${cleanUsername} from Supabase empirical profile cache (0 scraper calls).`);
      return cachedProfile;
    }

    const errors: string[] = [];

    for (const provider of this.allProviders) {
      // 1. Check if provider is available (credentials present)
      if (!provider.isAvailable()) {
        this.log("DEBUG", `Skipping [${provider.name}] — credentials not configured or provider unavailable.`);
        continue;
      }

      // 2. Check provider health status
      if (!(await this.isProviderHealthy(provider.id))) {
        this.log("WARN", `Skipping [${provider.name}] — provider currently marked UNHEALTHY (circuit breaker open).`);
        continue;
      }

      this.log("INFO", `Attempting profile ingestion for @${cleanUsername} via [${provider.name}]...`);

      // Determine provider-specific timeout and retry rules
      // Apify requires a 50s outer boundary (with 45s internal fetch abort) and 0 retries to prevent duplicate billing.
      const isApify = provider.id === "apify";
      const timeoutMs = isApify ? 50000 : this.TIMEOUT_MS;
      const maxRetries = isApify ? 0 : this.MAX_RETRIES;

      // 3. Execute with retry strategy and timeout
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
          const backoffMs = Math.pow(2, attempt - 1) * 1000; // Exponential backoff: 1000ms
          this.log("WARN", `Retrying [${provider.name}] attempt ${attempt + 1}/${maxRetries + 1} after ${backoffMs}ms backoff...`);
          await this.delay(backoffMs);
        }

        try {
          const profile = await this.executeWithTimeout(provider.getProfile(cleanUsername), timeoutMs);
          
          // Success: reset health status
          this.recordSuccess(provider.id);
          this.log("INFO", `Successfully ingested @${cleanUsername} via [${provider.name}].`);

          // Cache successful live profile results (never cache mock provider results or malformed/error responses)
          if (provider.id !== "mock" && isValidInstagramProfile(profile)) {
            await ProfileRepository.save(profile);
          }

          return profile;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown provider error";
          
          // If the account is private or not found, do NOT fail over or mark unhealthy — throw immediately!
          if (message.toLowerCase().includes("private") || message.toLowerCase().includes("not found")) {
            this.log("INFO", `Account @${cleanUsername} returned fatal business error via [${provider.name}]: ${message}`);
            throw new InstagramError(message);
          }

          this.log("WARN", `[${provider.name}] Attempt ${attempt + 1} failed for @${cleanUsername}: ${message}`);
          
          if (attempt === maxRetries) {
            errors.push(`[${provider.name}]: ${message}`);
            this.recordFailure(provider.id);
          }
        }
      }

      this.log("WARN", `Failing over from [${provider.name}] to next configured provider in chain...`);
    }

    // This should never be reached because MockProvider always succeeds unless username is 'private'/'notfound'
    throw new InstagramError(`All Instagram ingestion providers failed: ${errors.join(" | ")}`);
  }

  private async isProviderHealthy(providerId: string): Promise<boolean> {
    return CircuitBreakerStore.isHealthy(providerId, 3, this.COOLDOWN_MS);
  }

  private recordSuccess(providerId: string): void {
    void CircuitBreakerStore.recordSuccess(providerId);
  }

  private recordFailure(providerId: string): void {
    void CircuitBreakerStore.recordFailure(providerId, this.COOLDOWN_MS);
  }

  private executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Provider request timed out after ${timeoutMs}ms.`));
      }, timeoutMs);

      promise
        .then((res) => {
          clearTimeout(timer);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private log(level: "INFO" | "WARN" | "DEBUG", message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [InstagramIngestionEngine:${level}] ${message}`);
  }
}
