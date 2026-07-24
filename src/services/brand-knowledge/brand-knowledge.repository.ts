import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { brandProfiles, brandAssets } from "@/lib/db/schema";
import type { IBrandKnowledgeRepository } from "./repository.interface";
import type { BrandProfile, BrandAsset } from "@/types/brand-knowledge";
import { RepositoryError } from "./errors";

export class BrandKnowledgeRepository implements IBrandKnowledgeRepository {
  constructor(private readonly transactionDb?: any) {}

  private getDb() {
    return this.transactionDb || db;
  }

  async runInTransaction<T>(fn: (txRepo: IBrandKnowledgeRepository) => Promise<T>): Promise<T> {
    if (this.transactionDb) {
      // Already in a transaction, just run it
      return fn(this);
    }
    return db!.transaction(async (tx) => {
      const txRepo = new BrandKnowledgeRepository(tx);
      return fn(txRepo);
    });
  }

  async createProfile(userId: string, data: Partial<BrandProfile>): Promise<BrandProfile> {
    try {
      const [row] = await this.getDb()
        .insert(brandProfiles)
        .values({
          userId,
          name: data.name!,
          metadata: data.metadata || {},
          visualIdentity: data.visualIdentity || {},
        })
        .returning();
      return this.mapToProfile(row);
    } catch (err: any) {
      throw new RepositoryError(`Failed to create brand profile: ${err.message}`);
    }
  }

  async getProfileById(userId: string, brandId: string): Promise<BrandProfile | null> {
    const rows = await this.getDb()
      .select()
      .from(brandProfiles)
      .where(and(eq(brandProfiles.id, brandId), eq(brandProfiles.userId, userId)))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapToProfile(rows[0]);
  }

  async getProfilesByUserId(userId: string): Promise<BrandProfile[]> {
    const rows = await this.getDb()
      .select()
      .from(brandProfiles)
      .where(eq(brandProfiles.userId, userId));
    return rows.map((r: any) => this.mapToProfile(r));
  }

  async updateProfile(userId: string, brandId: string, updates: Partial<BrandProfile>): Promise<BrandProfile> {
    try {
      const [row] = await this.getDb()
        .update(brandProfiles)
        .set({
          name: updates.name,
          metadata: updates.metadata,
          visualIdentity: updates.visualIdentity,
          version: updates.version,
          updatedAt: new Date(),
        })
        .where(and(eq(brandProfiles.id, brandId), eq(brandProfiles.userId, userId)))
        .returning();

      if (!row) throw new RepositoryError("Profile not found or unauthorized");
      return this.mapToProfile(row);
    } catch (err: any) {
      throw new RepositoryError(`Failed to update profile: ${err.message}`);
    }
  }

  async deleteProfile(userId: string, brandId: string): Promise<boolean> {
    const rows = await this.getDb()
      .delete(brandProfiles)
      .where(and(eq(brandProfiles.id, brandId), eq(brandProfiles.userId, userId)))
      .returning({ id: brandProfiles.id });
    return rows.length > 0;
  }

  async createAsset(userId: string, brandId: string, asset: Partial<BrandAsset>): Promise<BrandAsset> {
    try {
      const [row] = await this.getDb()
        .insert(brandAssets)
        .values({
          brandId,
          userId,
          assetType: asset.assetType!,
          displayName: asset.displayName!,
          description: asset.description,
          tags: asset.tags || [],
          fileSize: asset.fileSize!,
          mimeType: asset.mimeType!,
          storageKey: asset.storageKey!,
          status: asset.status || "uploading",
        })
        .returning();
      return this.mapToAsset(row);
    } catch (err: any) {
      throw new RepositoryError(`Failed to create asset metadata: ${err.message}`);
    }
  }

  async getAssetById(userId: string, assetId: string): Promise<BrandAsset | null> {
    const rows = await this.getDb()
      .select()
      .from(brandAssets)
      .where(and(eq(brandAssets.id, assetId), eq(brandAssets.userId, userId)))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapToAsset(rows[0]);
  }

  async getAssetsByBrandId(userId: string, brandId: string): Promise<BrandAsset[]> {
    const rows = await this.getDb()
      .select()
      .from(brandAssets)
      .where(and(eq(brandAssets.brandId, brandId), eq(brandAssets.userId, userId)));
    return rows.map((r: any) => this.mapToAsset(r));
  }

  async updateAsset(userId: string, assetId: string, updates: Partial<BrandAsset>): Promise<BrandAsset> {
    try {
      const [row] = await this.getDb()
        .update(brandAssets)
        .set({
          displayName: updates.displayName,
          description: updates.description,
          tags: updates.tags,
          status: updates.status,
          updatedAt: new Date(),
        })
        .where(and(eq(brandAssets.id, assetId), eq(brandAssets.userId, userId)))
        .returning();

      if (!row) throw new RepositoryError("Asset not found or unauthorized");
      return this.mapToAsset(row);
    } catch (err: any) {
      throw new RepositoryError(`Failed to update asset: ${err.message}`);
    }
  }

  async deleteAsset(userId: string, assetId: string): Promise<boolean> {
    const rows = await this.getDb()
      .delete(brandAssets)
      .where(and(eq(brandAssets.id, assetId), eq(brandAssets.userId, userId)))
      .returning({ id: brandAssets.id });
    return rows.length > 0;
  }

  private mapToProfile(row: any): BrandProfile {
    return {
      id: row.id,
      userId: row.userId,
      name: row.name,
      version: row.version,
      metadata: row.metadata,
      visualIdentity: row.visualIdentity,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private mapToAsset(row: any): BrandAsset {
    return {
      id: row.id,
      brandId: row.brandId,
      userId: row.userId,
      assetType: row.assetType as any,
      displayName: row.displayName,
      description: row.description || undefined,
      tags: row.tags,
      fileSize: row.fileSize,
      mimeType: row.mimeType,
      version: row.version,
      storageKey: row.storageKey,
      status: row.status as any,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
