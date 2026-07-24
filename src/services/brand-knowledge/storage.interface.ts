export interface IStorageProvider {
  /**
   * Uploads a binary asset to the storage provider.
   * @param userId The tenant ID to ensure isolation.
   * @param brandId The brand profile ID.
   * @param file The file buffer.
   * @param mimeType The MIME type of the file.
   * @returns A provider-independent storage key.
   */
  uploadAsset(userId: string, brandId: string, file: Buffer, mimeType: string): Promise<string>;

  /**
   * Retrieves a secure, short-lived signed URL for an asset.
   * @param storageKey The provider-independent storage key.
   * @param expiresInSec Expiration time in seconds.
   */
  getSignedUrl(storageKey: string, expiresInSec: number): Promise<string>;

  /**
   * Permanently deletes a binary asset from storage.
   * @param storageKey The provider-independent storage key.
   */
  deleteAsset(storageKey: string): Promise<boolean>;
}
