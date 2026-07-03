import type { CollectedContentItem } from "@/types/content-collection";

/**
 * Contract for Content Collection provider.
 */
export interface IContentCollectionProvider {
  collectContent(competitorUsername: string): Promise<CollectedContentItem[]>;
}
