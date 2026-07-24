import { db } from "@/lib/db";
import { platformConfigurations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface SimilarityWeights {
  niche: number;
  accountType: number;
  growthStage: number;
  primaryObjective: number;
}

const DEFAULT_SIMILARITY_WEIGHTS: SimilarityWeights = {
  niche: 40,
  accountType: 30,
  growthStage: 20,
  primaryObjective: 10,
};

/**
 * ConfigurationService
 * 
 * Central registry for platform-wide configurations. 
 * Implements a hybrid load strategy (Database -> Code Default).
 */
export class ConfigurationService {
  
  /**
   * Retrieves the similarity weights.
   * If not found in the DB, it creates a record with the hardcoded defaults and returns them.
   */
  async getSimilarityWeights(): Promise<SimilarityWeights> {
    const key = "similarity_weights";
    
    const records = await db.select()
      .from(platformConfigurations)
      .where(eq(platformConfigurations.configKey, key))
      .limit(1);

    if (records.length > 0) {
      return records[0].configValue as unknown as SimilarityWeights;
    }

    console.log(`[ConfigurationService] No DB config found for '${key}'. Saving code defaults.`);
    
    try {
      await db.insert(platformConfigurations).values({
        configKey: key,
        configValue: DEFAULT_SIMILARITY_WEIGHTS,
        version: 1,
      });
    } catch (err) {
      console.warn(`[ConfigurationService] Failed to insert default config for '${key}'. It may have been created concurrently.`);
    }

    return DEFAULT_SIMILARITY_WEIGHTS;
  }
}

export const configurationService = new ConfigurationService();
