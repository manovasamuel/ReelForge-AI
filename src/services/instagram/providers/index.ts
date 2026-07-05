import type { IInstagramProvider } from "../provider.interface";
import { FailoverInstagramProvider } from "./failover.provider";

/**
 * Provider factory — the single point of truth for Instagram data ingestion.
 *
 * Instantiates the FailoverInstagramProvider orchestrator, passing in the
 * user's preferred provider choice (from Settings / header or environment variable).
 *
 * The orchestrator manages dynamic priority, retry, health tracking,
 * and permanent fallback to MockProvider.
 */
export function getInstagramProvider(preferredType?: string): IInstagramProvider {
  return new FailoverInstagramProvider(preferredType);
}

