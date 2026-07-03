import type { IProjectProvider } from "../provider.interface";
import { LocalProjectProvider } from "./local.provider";

export function getProjectProvider(): IProjectProvider {
  const providerType = process.env.PROJECT_STORAGE_PROVIDER || "local";

  switch (providerType) {
    case "local":
    default:
      return new LocalProjectProvider();
  }
}
