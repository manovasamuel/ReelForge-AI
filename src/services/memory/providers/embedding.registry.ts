import type { IEmbeddingProvider } from "../types";

export class EmbeddingRegistry {
  private static instance: EmbeddingRegistry;
  private providers: Map<string, IEmbeddingProvider> = new Map();
  private defaultProviderId: string | null = null;

  private constructor() {}

  public static getInstance(): EmbeddingRegistry {
    if (!EmbeddingRegistry.instance) {
      EmbeddingRegistry.instance = new EmbeddingRegistry();
    }
    return EmbeddingRegistry.instance;
  }

  public register(provider: IEmbeddingProvider, isDefault: boolean = false): void {
    this.providers.set(provider.id, provider);
    if (isDefault || !this.defaultProviderId) {
      this.defaultProviderId = provider.id;
    }
  }

  public getProvider(id?: string): IEmbeddingProvider {
    const providerId = id || this.defaultProviderId;
    if (!providerId) {
      throw new Error("No embedding provider registered or specified.");
    }
    
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Embedding provider '${providerId}' not found.`);
    }
    
    return provider;
  }

  public getAllProviders(): IEmbeddingProvider[] {
    return Array.from(this.providers.values());
  }
}

export const embeddingRegistry = EmbeddingRegistry.getInstance();
