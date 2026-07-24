import type { BrandProfile, BrandAsset } from "@/types/brand-knowledge";

export interface IBrandKnowledgeRepository {
  /** Executes a batch of operations within a single database transaction */
  runInTransaction<T>(fn: (txRepo: IBrandKnowledgeRepository) => Promise<T>): Promise<T>;
  /** Creates a new brand profile */
  createProfile(userId: string, data: Partial<BrandProfile>): Promise<BrandProfile>;
  
  /** Retrieves a brand profile by ID, ensuring tenant isolation */
  getProfileById(userId: string, brandId: string): Promise<BrandProfile | null>;
  
  /** Retrieves all brand profiles for a user */
  getProfilesByUserId(userId: string): Promise<BrandProfile[]>;
  
  /** Updates an existing brand profile */
  updateProfile(userId: string, brandId: string, updates: Partial<BrandProfile>): Promise<BrandProfile>;
  
  /** Deletes a brand profile and all associated assets */
  deleteProfile(userId: string, brandId: string): Promise<boolean>;

  /** Creates a new asset metadata record */
  createAsset(userId: string, brandId: string, asset: Partial<BrandAsset>): Promise<BrandAsset>;
  
  /** Retrieves asset metadata by ID */
  getAssetById(userId: string, assetId: string): Promise<BrandAsset | null>;
  
  /** Retrieves all assets for a given brand */
  getAssetsByBrandId(userId: string, brandId: string): Promise<BrandAsset[]>;
  
  /** Updates asset metadata (e.g., status changes) */
  updateAsset(userId: string, assetId: string, updates: Partial<BrandAsset>): Promise<BrandAsset>;
  
  /** Deletes asset metadata */
  deleteAsset(userId: string, assetId: string): Promise<boolean>;
}
