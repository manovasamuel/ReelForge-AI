import type { CollectedContentItem } from "@/types/content-collection";
import type { IContentCollectionProvider } from "./provider.interface";
import { AppError } from "@/lib/errors";

export class ContentCollectionError extends AppError {
  constructor(message: string) {
    super(`[Content Collection] ${message}`, "CONTENT_COLLECTION_ERROR", 500);
    this.name = "ContentCollectionError";
  }
}

export class ContentCollectionService {
  constructor(private readonly provider: IContentCollectionProvider) {}

  async collectContent(competitorUsername: string): Promise<CollectedContentItem[]> {
    if (!competitorUsername || typeof competitorUsername !== "string") {
      throw new ContentCollectionError("Valid competitor username is required.");
    }

    try {
      return await this.provider.collectContent(competitorUsername);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : "Failed to collect competitor content.";
      throw new ContentCollectionError(message);
    }
  }
}
