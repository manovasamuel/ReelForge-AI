import type { IConnector } from "./connectors/base.connector";

/**
 * Registry to manage active Hermes connectors.
 * Connectors must be registered here before their tools can be discovered and executed.
 */
export class ConnectorRegistry {
  private static instance: ConnectorRegistry;
  private connectors: Map<string, IConnector> = new Map();

  private constructor() {}

  public static getInstance(): ConnectorRegistry {
    if (!ConnectorRegistry.instance) {
      ConnectorRegistry.instance = new ConnectorRegistry();
    }
    return ConnectorRegistry.instance;
  }

  /**
   * Registers a new connector instance.
   */
  public register(connector: IConnector): void {
    if (this.connectors.has(connector.id)) {
      console.warn(`[Hermes] Connector with ID ${connector.id} is already registered. Overwriting.`);
    }
    this.connectors.set(connector.id, connector);
    console.info(`[Hermes] Registered connector: ${connector.name} (${connector.id})`);
  }

  /**
   * Removes a connector by ID.
   */
  public unregister(connectorId: string): void {
    this.connectors.delete(connectorId);
  }

  /**
   * Retrieves a connector by its ID.
   */
  public getConnector(connectorId: string): IConnector | undefined {
    return this.connectors.get(connectorId);
  }

  /**
   * Returns a list of all registered connectors.
   */
  public getAllConnectors(): IConnector[] {
    return Array.from(this.connectors.values());
  }

  /**
   * Clears all registered connectors (useful for tests or hard resets).
   */
  public clear(): void {
    this.connectors.clear();
  }
}

/**
 * Convenience export for global singleton access.
 */
export const connectorRegistry = ConnectorRegistry.getInstance();
