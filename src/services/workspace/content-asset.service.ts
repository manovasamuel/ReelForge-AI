import { db } from "@/lib/db";
import { contentAssets } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export interface CreateContentAssetParams {
  profileId: string;
  title: string;
  contentType: string;
  contentData: any;
  lineage: any;
  createdBy?: string;
}

export class ContentAssetService {
  /**
   * Creates a new content asset (typically from Copilot).
   */
  async createAsset(params: CreateContentAssetParams) {
    console.log(`[ContentAssetService] Creating asset for profile: ${params.profileId}`);
    
    const [asset] = await db.insert(contentAssets).values({
      profileId: params.profileId,
      title: params.title,
      contentType: params.contentType,
      contentState: "Draft",
      contentData: params.contentData,
      lineage: params.lineage,
      createdBy: params.createdBy || "Adaptive Copilot",
    }).returning();
    
    return asset;
  }

  /**
   * Retrieves all assets for a given profile.
   */
  async getAssetsByProfile(profileId: string) {
    return db.select()
      .from(contentAssets)
      .where(eq(contentAssets.profileId, profileId))
      .orderBy(contentAssets.createdAt);
  }

  /**
   * Retrieves a single asset by ID.
   */
  async getAssetById(assetId: string) {
    const assets = await db.select().from(contentAssets).where(eq(contentAssets.id, assetId)).limit(1);
    return assets[0] || null;
  }

  /**
   * Updates an asset's content, bumping the version and updating the state.
   */
  async updateAssetContent(assetId: string, contentData: any, newState: string, editedBy: string) {
    const existing = await this.getAssetById(assetId);
    if (!existing) throw new Error("Asset not found");

    const [updated] = await db.update(contentAssets)
      .set({
        contentData,
        contentState: newState,
        version: existing.version + 1,
        lastEditedBy: editedBy,
        updatedAt: new Date()
      })
      .where(eq(contentAssets.id, assetId))
      .returning();
      
    return updated;
  }
}

export const contentAssetService = new ContentAssetService();
