import { PublishingConnector } from "./connector.interface";
import { InstagramConnector } from "./instagram.connector";
import { MockConnector } from "./mock.connector";

export class ConnectorRegistry {
  private static instance: ConnectorRegistry;
  private connectors: Map<string, PublishingConnector> = new Map();

  private constructor() {}

  public static getInstance(): ConnectorRegistry {
    if (!ConnectorRegistry.instance) {
      ConnectorRegistry.instance = new ConnectorRegistry();
    }
    return ConnectorRegistry.instance;
  }

  public register(connector: PublishingConnector): void {
    this.connectors.set(connector.platform.toLowerCase(), connector);
  }

  public getConnector(platform: string): PublishingConnector {
    const connector = this.connectors.get(platform.toLowerCase());
    if (!connector) {
      throw new Error(`No connector registered for platform: ${platform}`);
    }
    return connector;
  }

  public getRegisteredPlatforms(): string[] {
    return Array.from(this.connectors.keys());
  }
}

export const connectorRegistry = ConnectorRegistry.getInstance();
connectorRegistry.register(new InstagramConnector());
connectorRegistry.register(new MockConnector());
