import type { IContentDNAProvider } from "../provider.interface";
import { MockContentDNAProvider } from "./mock.provider";

/**
 * Factory returning the configured Content DNA provider.
 */
export function getContentDNAProvider(): IContentDNAProvider {
  const providerType = process.env.CONTENT_DNA_PROVIDER ?? "mock";

  switch (providerType.toLowerCase()) {
    case "mock":
    default:
      return new MockContentDNAProvider();
  }
}
