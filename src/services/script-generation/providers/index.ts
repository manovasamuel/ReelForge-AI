import type { IScriptGenerationProvider } from "../provider.interface";
import { MockScriptGenerationProvider } from "./mock.provider";

/**
 * Factory returning the configured Script Generation provider.
 */
export function getScriptGenerationProvider(): IScriptGenerationProvider {
  const providerType = process.env.SCRIPT_GENERATION_PROVIDER ?? "mock";

  switch (providerType.toLowerCase()) {
    case "mock":
    default:
      return new MockScriptGenerationProvider();
  }
}
