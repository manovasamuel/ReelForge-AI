import type { CollectedContentItem } from "@/types/content-collection";
import type { IContentCollectionProvider } from "../provider.interface";
import { inferContentCollection } from "../content-collection.utils";

/**
 * Deterministic MockContentCollectionProvider simulating latency
 * and returning realistic content library.
 */
export class MockContentCollectionProvider implements IContentCollectionProvider {
  private readonly SIMULATED_DELAY_MS = 800;

  async collectContent(competitorUsername: string): Promise<CollectedContentItem[]> {
    await new Promise((resolve) => setTimeout(resolve, this.SIMULATED_DELAY_MS));
    return inferContentCollection(competitorUsername);
  }
}
