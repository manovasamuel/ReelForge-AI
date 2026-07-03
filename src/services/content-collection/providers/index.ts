import type { IContentCollectionProvider } from "../provider.interface";
import { MockContentCollectionProvider } from "./mock.provider";

/**
 * Factory returning active Content Collection provider based on env.
 */
export function getContentCollectionProvider(): IContentCollectionProvider {
  const provider = process.env.CONTENT_COLLECTION_PROVIDER ?? "mock";

  switch (provider) {
    case "mock":
    default:
      return new MockContentCollectionProvider();
  }
}
