import type { BrandProfile, BrandAsset, BrandKnowledgeEventPayload } from "@/types/brand-knowledge";
import type { IBrandKnowledgeRepository } from "./repository.interface";
import type { IStorageProvider } from "./storage.interface";

export interface IBrandKnowledgeService {
  createProfile(userId: string, data: any): Promise<BrandProfile>;
  getProfile(userId: string, brandId: string): Promise<BrandProfile>;
  listProfiles(userId: string): Promise<BrandProfile[]>;
  updateProfile(userId: string, brandId: string, data: any): Promise<BrandProfile>;
  deleteProfile(userId: string, brandId: string): Promise<boolean>;

  uploadAsset(userId: string, brandId: string, file: Buffer, metadata: any): Promise<BrandAsset>;
  getAssetUrl(userId: string, assetId: string): Promise<string>;
  deleteAsset(userId: string, assetId: string): Promise<boolean>;
}

export class BrandKnowledgeService implements IBrandKnowledgeService {
  constructor(
    private readonly repository: IBrandKnowledgeRepository,
    private readonly storage: IStorageProvider
  ) {}

  async createProfile(userId: string, data: Partial<BrandProfile>): Promise<BrandProfile> {
    const profile = await this.repository.createProfile(userId, data);
    this.emitEvent({ eventName: "BrandCreated", brandId: profile.id, userId, timestamp: new Date().toISOString() });
    return profile;
  }

  async getProfile(userId: string, brandId: string): Promise<BrandProfile> {
    const profile = await this.repository.getProfileById(userId, brandId);
    if (!profile) throw new Error("Brand profile not found");
    // Also fetch assets
    const assets = await this.repository.getAssetsByBrandId(userId, brandId);
    profile.assets = assets;
    return profile;
  }

  async listProfiles(userId: string): Promise<BrandProfile[]> {
    return this.repository.getProfilesByUserId(userId);
  }

  async updateProfile(userId: string, brandId: string, data: Partial<BrandProfile>): Promise<BrandProfile> {
    const profile = await this.repository.updateProfile(userId, brandId, data);
    this.emitEvent({ eventName: "BrandUpdated", brandId: profile.id, userId, timestamp: new Date().toISOString() });
    return profile;
  }

  async deleteProfile(userId: string, brandId: string): Promise<boolean> {
    return this.repository.runInTransaction(async (txRepo) => {
      // 1. Fetch all assets to delete from storage
      const assets = await txRepo.getAssetsByBrandId(userId, brandId);
      
      // 2. Delete profile (cascades asset metadata deletion in DB)
      const deleted = await txRepo.deleteProfile(userId, brandId);
      if (!deleted) return false;

      // 3. Clean up physical storage asynchronously (best effort)
      for (const asset of assets) {
        this.storage.deleteAsset(asset.storageKey).catch(console.error);
      }

      this.emitEvent({ eventName: "BrandDeleted", brandId, userId, timestamp: new Date().toISOString() });
      return true;
    });
  }

  async uploadAsset(userId: string, brandId: string, file: Buffer, metadata: any): Promise<BrandAsset> {
    // 1. Ensure brand exists
    const profile = await this.repository.getProfileById(userId, brandId);
    if (!profile) throw new Error("Brand profile not found");

    // 2. Upload to storage
    const storageKey = await this.storage.uploadAsset(userId, brandId, file, metadata.mimeType);

    // 3. Create metadata record
    const asset = await this.repository.createAsset(userId, brandId, {
      ...metadata,
      storageKey,
      status: "available"
    });

    this.emitEvent({ eventName: "AssetUploaded", brandId, userId, assetId: asset.id, timestamp: new Date().toISOString() });
    return asset;
  }

  async getAssetUrl(userId: string, assetId: string): Promise<string> {
    const asset = await this.repository.getAssetById(userId, assetId);
    if (!asset) throw new Error("Asset not found");

    // Return a 15-minute signed URL
    return this.storage.getSignedUrl(asset.storageKey, 900);
  }

  async deleteAsset(userId: string, assetId: string): Promise<boolean> {
    const asset = await this.repository.getAssetById(userId, assetId);
    if (!asset) return false;

    return this.repository.runInTransaction(async (txRepo) => {
      const deleted = await txRepo.deleteAsset(userId, assetId);
      if (deleted) {
        await this.storage.deleteAsset(asset.storageKey);
        this.emitEvent({ eventName: "AssetDeleted", brandId: asset.brandId, userId, assetId, timestamp: new Date().toISOString() });
      }
      return deleted;
    });
  }

  /**
   * Internal event emitter for extension points (e.g., kicking off OCR/Embedding workers).
   */
  protected emitEvent(payload: BrandKnowledgeEventPayload): void {
    console.log(`[BrandKnowledgeService] Event Emitted: ${payload.eventName}`, payload);
    // In Phase 2+, this would push to a pub/sub or queue
  }
}
