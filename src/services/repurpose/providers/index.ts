import type { IRepurposeProvider } from "../provider.interface";
import { MockRepurposeProvider } from "./mock.provider";

/**
 * Factory returning the configured Multi-Platform Repurpose provider.
 */
export function getRepurposeProvider(): IRepurposeProvider {
  const providerType = process.env.REPURPOSE_PROVIDER ?? "mock";

  switch (providerType.toLowerCase()) {
    case "mock":
    default:
      return new MockRepurposeProvider();
  }
}
