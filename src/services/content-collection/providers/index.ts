import type { IContentCollectionProvider } from "../provider.interface";
import { MockContentCollectionProvider } from "./mock.provider";
import { LiveContentCollectionProvider } from "./live.provider";

/**
 * Factory returning active Content Collection provider based on env.
 *
 * Stage 3B Phase 1: Activates live collection only through explicit configuration:
 * CONTENT_COLLECTION_PROVIDER=live.
 * Preserves the existing MockContentCollectionProvider as the explicit fallback/testing provider.
 */
export function getContentCollectionProvider(): IContentCollectionProvider {
  const provider = process.env.CONTENT_COLLECTION_PROVIDER ?? "mock";

  switch (provider) {
    case "live":
      return new LiveContentCollectionProvider();
    case "mock":
    default:
      return new MockContentCollectionProvider();
  }
}
