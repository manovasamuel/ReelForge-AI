import type { AIProviderId, IAIProvider, ProviderCapability } from "../provider.interface";

/**
 * Provider Registry for AI Platform Infrastructure V2
 * 
 * Central registry for dynamically loading, resolving, and managing AI providers.
 * No provider should be instantiated directly outside this registry.
 */
export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<AIProviderId, IAIProvider> = new Map();

  private constructor() {}

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  /**
   * Registers a provider instance. If a provider with the same ID already exists,
   * it will be overwritten.
   */
  public register(provider: IAIProvider): void {
    this.providers.set(provider.id, provider);
  }

  /**
   * Retrieves a provider by its unique ID.
   */
  public getProvider(id: AIProviderId): IAIProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * Returns all registered providers.
   */
  public getAllProviders(): IAIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Returns only providers that are currently available (e.g. have valid API keys).
   */
  public getAvailableProviders(): IAIProvider[] {
    return this.getAllProviders().filter(p => p.isAvailable());
  }

  // Diagnostics & Tooling Methods

  public getRegisteredProviders(): AIProviderId[] {
    return Array.from(this.providers.keys());
  }

  public getProviderMetadata(id: AIProviderId) {
    return this.providers.get(id)?.metadata;
  }

  public getCapabilities(id: AIProviderId) {
    return this.providers.get(id)?.capabilities;
  }

  public isRegistered(id: AIProviderId): boolean {
    return this.providers.has(id);
  }
}

// Export a singleton instance for easier consumption
export const aiProviderRegistry = ProviderRegistry.getInstance();
