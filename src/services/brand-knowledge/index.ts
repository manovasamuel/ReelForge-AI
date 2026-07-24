import { BrandKnowledgeService } from "./brand-knowledge.service";
import { BrandKnowledgeRepository } from "./brand-knowledge.repository";
import { SupabaseStorageProvider } from "./providers/supabase.storage.provider";
import { LocalStorageProvider } from "./providers/local.storage.provider";

let serviceInstance: BrandKnowledgeService;

export function getBrandKnowledgeService(): BrandKnowledgeService {
  if (serviceInstance) return serviceInstance;

  const repository = new BrandKnowledgeRepository();
  
  // Use Supabase in production/preview, Local in pure offline dev
  const useLocal = process.env.NODE_ENV !== "production" && !process.env.NEXT_PUBLIC_SUPABASE_URL;
  const storage = useLocal ? new LocalStorageProvider() : new SupabaseStorageProvider();

  serviceInstance = new BrandKnowledgeService(repository, storage);
  return serviceInstance;
}
