import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { IStorageProvider } from "../storage.interface";

export class LocalStorageProvider implements IStorageProvider {
  private readonly storageRoot: string;

  constructor(storageRoot?: string) {
    this.storageRoot = storageRoot || path.join(process.cwd(), ".local_storage", "brands");
    if (!fs.existsSync(this.storageRoot)) {
      fs.mkdirSync(this.storageRoot, { recursive: true });
    }
  }

  async uploadAsset(userId: string, brandId: string, file: Buffer, mimeType: string): Promise<string> {
    const extension = mimeType.split("/")[1] || "bin";
    const filename = `${crypto.randomUUID()}.${extension}`;
    
    // storageKey: users/{userId}/brands/{brandId}/assets/{filename}
    const storageKey = `users/${userId}/brands/${brandId}/assets/${filename}`;
    const absolutePath = path.join(this.storageRoot, storageKey);
    
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(absolutePath, file);
    return storageKey;
  }

  async getSignedUrl(storageKey: string, expiresInSec: number): Promise<string> {
    // In local dev, we just return a local API endpoint that serves the file
    // Real implementation would return a cryptographically signed URL
    return `/api/local-storage/assets?key=${encodeURIComponent(storageKey)}`;
  }

  async deleteAsset(storageKey: string): Promise<boolean> {
    const absolutePath = path.join(this.storageRoot, storageKey);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return true;
    }
    return false;
  }
}
