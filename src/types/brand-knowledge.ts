export type AssetStatus = "uploading" | "available" | "processing" | "failed";
export type AssetType = "document" | "logo" | "image" | "font" | "other";

export interface VisionResult {
  caption?: string;
  tags: string[];
  ocr?: string;
  dominantColors?: string[]; // HEX codes
  logoDetected?: boolean;
  objectsDetected?: string[];
  peopleDetected?: boolean;
  typographyStyle?: string;
  visualMood?: string;
  imageOrientation?: "portrait" | "landscape" | "square";
  estimatedQuality?: "low" | "medium" | "high";
  textLanguage?: string;
  brandingConfidenceScore?: number; // 0-100
  metadata?: Record<string, any>; // Provider-specific leftovers
  providerUsed?: string;
  processingTimeMs?: number;
}

export interface BrandAsset {
  id: string; // UUID
  brandId: string;
  userId: string;
  assetType: AssetType;
  displayName: string;
  description?: string;
  tags: string[];
  fileSize: number;
  mimeType: string;
  version: number;
  storageKey: string;
  status: AssetStatus;
  visionMetadata?: VisionResult; // AI-generated vision analysis
  createdAt: string;
  updatedAt: string;
}

export interface BrandMetadata {
  toneOfVoice: string[];
  messagingPillars: string[];
  productsServices: string[];
  audienceProfiles: string[];
}

export interface BrandVisualIdentity {
  primaryColors: string[]; // HEX codes
  typography: string[];
}

export interface BrandProfile {
  id: string; // UUID
  userId: string;
  name: string;
  version: number;
  metadata: BrandMetadata;
  visualIdentity: BrandVisualIdentity;
  assets?: BrandAsset[]; // Populated optionally when fetching the profile
  createdAt: string;
  updatedAt: string;
}

// Event hooks payload definition
export interface BrandKnowledgeEventPayload {
  eventName: "BrandCreated" | "BrandUpdated" | "BrandDeleted" | "AssetUploaded" | "AssetDeleted" | "AssetStatusChanged";
  brandId: string;
  userId: string;
  assetId?: string;
  timestamp: string;
}
