import type { IExportProvider } from "../provider.interface";
import { LocalExportProvider } from "./local.provider";

let providerInstance: IExportProvider | null = null;

export function getExportProvider(): IExportProvider {
  if (!providerInstance) {
    providerInstance = new LocalExportProvider();
  }
  return providerInstance;
}
