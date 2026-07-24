import type { IStorageProvider } from "../storage.interface";
import { createServerClient } from "@/lib/supabase/server";

export class SupabaseStorageProvider implements IStorageProvider {
  private readonly bucketName = "brand_assets";

  async uploadAsset(userId: string, brandId: string, file: Buffer, mimeType: string): Promise<string> {
    const supabase = createServerClient();
    const extension = mimeType.split("/")[1] || "bin";
    const filename = `${crypto.randomUUID()}.${extension}`;
    const storageKey = `users/${userId}/brands/${brandId}/assets/${filename}`;

    const { error } = await supabase.storage
      .from(this.bucketName)
      .upload(storageKey, file, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload asset to Supabase: ${error.message}`);
    }

    return storageKey;
  }

  async getSignedUrl(storageKey: string, expiresInSec: number): Promise<string> {
    const supabase = createServerClient();
    
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .createSignedUrl(storageKey, expiresInSec);

    if (error || !data) {
      throw new Error(`Failed to generate signed URL: ${error?.message}`);
    }

    return data.signedUrl;
  }

  async deleteAsset(storageKey: string): Promise<boolean> {
    const supabase = createServerClient();
    
    const { error } = await supabase.storage
      .from(this.bucketName)
      .remove([storageKey]);

    if (error) {
      throw new Error(`Failed to delete asset from Supabase: ${error.message}`);
    }

    return true;
  }
}
