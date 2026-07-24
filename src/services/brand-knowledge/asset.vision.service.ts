import fs from "fs";
import path from "path";
import { BrandKnowledgeRepository } from "./brand-knowledge.repository";
import { AIService } from "@/services/ai/ai.service";
import type { VisionResult } from "@/types/brand-knowledge";
import type { ImagePayload } from "@/services/ai/provider.interface";

export class AssetVisionService {
  private assetRepo: BrandKnowledgeRepository;
  private aiService: AIService;

  constructor() {
    this.assetRepo = new BrandKnowledgeRepository();
    this.aiService = new AIService();
  }

  /**
   * Asynchronously processes a newly uploaded visual asset (detached promise).
   * Extracts AI-driven visual metadata and updates the BrandAsset record.
   */
  public async processAsset(userId: string, assetId: string): Promise<void> {
    try {
      const asset = await this.assetRepo.getAssetById(userId, assetId);
      if (!asset) {
        console.warn(`[AssetVisionService] Asset ${assetId} not found for user ${userId}.`);
        return;
      }

      // Only process images (or other supported visual assets)
      if (asset.assetType !== "image" && asset.assetType !== "logo") {
        await this.assetRepo.updateAsset(userId, assetId, { status: "available" });
        return;
      }

      await this.assetRepo.updateAsset(userId, assetId, { status: "processing" });

      const absolutePath = path.join(process.cwd(), ".local_storage", "brands", asset.storageKey);
      if (!fs.existsSync(absolutePath)) {
        console.warn(`[AssetVisionService] File not found at ${absolutePath}`);
        await this.assetRepo.updateAsset(userId, assetId, { status: "failed" });
        return;
      }

      const fileBuffer = fs.readFileSync(absolutePath);
      const base64Data = fileBuffer.toString("base64");

      const imagePayload: ImagePayload = {
        data: base64Data,
        mimeType: asset.mimeType,
      };

      const fallback: VisionResult = {
        tags: ["auto-tag-failed"],
        caption: "Vision analysis unavailable",
      };

      const { data: visionMetadata, telemetry } = await this.aiService.analyzeVisionAsset(imagePayload, fallback);

      visionMetadata.providerUsed = telemetry.providerId;
      visionMetadata.processingTimeMs = telemetry.latencyMs;

      await this.assetRepo.updateAsset(userId, assetId, {
        status: "available",
        visionMetadata,
      });

      console.info(`[AssetVisionService] Successfully processed asset ${assetId}`);
    } catch (error) {
      console.error(`[AssetVisionService] Failed to process asset ${assetId}:`, error);
      // Failsafe: keep it available but without vision metadata, rather than totally failing it
      await this.assetRepo.updateAsset(userId, assetId, { status: "available" });
    }
  }
}
