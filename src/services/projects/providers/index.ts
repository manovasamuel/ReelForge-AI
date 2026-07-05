import type { IProjectProvider } from "../provider.interface";
import { LocalProjectProvider } from "./local.provider";
import { CloudProjectProvider } from "./cloud.provider";
import { HybridProjectProvider } from "./hybrid.provider";

export function getProjectProvider(): IProjectProvider {
  const providerType =
    process.env.NEXT_PUBLIC_STORAGE_PROVIDER ||
    process.env.PROJECT_STORAGE_PROVIDER ||
    "hybrid";

  switch (providerType) {
    case "cloud":
      return new CloudProjectProvider();
    case "local":
      return new LocalProjectProvider();
    case "hybrid":
    default:
      return new HybridProjectProvider();
  }
}
