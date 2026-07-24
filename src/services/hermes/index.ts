import { HermesGateway } from "./hermes.gateway";
import { connectorRegistry } from "./connector.registry";
import { BrandKnowledgeConnector } from "./connectors/brand-knowledge.connector";
import { FilesystemConnector } from "./connectors/filesystem.connector";

let initialized = false;

export function initHermes() {
  if (initialized) return;
  
  // Register default connectors
  connectorRegistry.register(new BrandKnowledgeConnector());
  connectorRegistry.register(new FilesystemConnector());
  
  initialized = true;
  console.info("[Hermes] Initialized default connectors.");
}

// Export everything for consumers
export * from "./types";
export * from "./hermes.gateway";
export * from "./connector.registry";
export * from "./connectors/base.connector";
