import { ISettingsProvider } from "../provider.interface";
import { LocalSettingsProvider } from "./local.provider";

let settingsProviderSingleton: ISettingsProvider | null = null;

export function getSettingsProvider(): ISettingsProvider {
  if (!settingsProviderSingleton) {
    settingsProviderSingleton = new LocalSettingsProvider();
  }
  return settingsProviderSingleton;
}
