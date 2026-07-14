import type { ICompetitorProvider } from "../provider.interface";
import type { Competitor } from "@/types/competitor";
import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import { getAIOrchestrator } from "@/services/ai/providers";
import { PromptBuilder } from "@/services/ai/prompt.builder";
import { normalizeInstagramUsername } from "@/services/instagram/instagram.utils";
import { ProfileRepository } from "@/lib/db/repositories/profile.repository";
import { inferCompetitors } from "../competitors.utils";

/**
 * LiveCompetitorProvider — Stage 3B Phase 4C Real Competitor Discovery & Cache Bridge.
 *
 * Implements the approved budget-conscious Candidate State Model:
 *   Brand Intelligence → AI Candidate Proposal → Cache Check → User Selection → Single-Scrape Verification
 *
 * Critical Truthfulness Rule:
 * - AI-generated handles are NOT treated as real/verified accounts by default.
 * - Until verified empirically via ProfileRepository (cache hit) or single-scrape (collectContent),
 *   candidates carry discoveryState = 'AI_SUGGESTED' (or 'UNVERIFIED') and isVerifiedAccount = false.
 */
export class LiveCompetitorProvider implements ICompetitorProvider {
  readonly id = "live";
  readonly name = "Live AI Candidate & Cache Bridge";

  async discoverCompetitors(report: BrandIntelligenceReport): Promise<Competitor[]> {
    let rawCandidates: Competitor[] = [];

    // 1. Check if deterministic mode is explicitly preferred
    const isDeterministicMode = process.env.COMPETITORS_PROVIDER === "deterministic" || process.env.AI_PROVIDER === "deterministic";

    if (!isDeterministicMode) {
      // 2. Attempt AI candidate generation via AIOrchestratorProvider
      try {
        const aiProvider = getAIOrchestrator();
        if (aiProvider.isAvailable() || process.env.AI_PROVIDER === "gemini" || process.env.COMPETITORS_PROVIDER === "live") {
          const fallback = inferCompetitors(report);
          const payload = PromptBuilder.buildCompetitorDiscoveryPrompt(report, fallback);
          const response = await aiProvider.generateStructured<Competitor[]>(payload);
          if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
            rawCandidates = response.data;
          }
        }
      } catch (err) {
        console.warn("[LiveCompetitorProvider] AI candidate generation failed or unavailable. Using heuristic candidate fallback.", err);
      }
    }

    // 3. Fallback to heuristic candidate generator if deterministic or AI candidates are not returned
    if (!rawCandidates || rawCandidates.length === 0) {
      rawCandidates = inferCompetitors(report);
    }

    // 3. Candidate State Model & Cache Verification Bridge
    // Check ProfileRepository for each candidate (HIT -> CACHE_VERIFIED, MISS -> AI_SUGGESTED / UNVERIFIED)
    const verifiedCandidates = await Promise.all(
      rawCandidates.map(async (cand) => {
        const cleaned = normalizeInstagramUsername(cand.username);
        if (!cleaned) {
          return { ...cand, discoveryState: "UNVERIFIED" as const, isVerifiedAccount: false };
        }

        const cachedProfile = await ProfileRepository.getFreshByUsername(cleaned);
        if (cachedProfile) {
          return {
            ...cand,
            username: cleaned,
            displayName: cachedProfile.display_name || cand.displayName || `@${cleaned}`,
            profilePictureUrl: cachedProfile.profile_picture_url || cand.profilePictureUrl,
            followers: cachedProfile.follower_count || cand.followers || 0,
            discoveryState: "CACHE_VERIFIED" as const,
            isVerifiedAccount: true,
          };
        }

        return {
          ...cand,
          username: cleaned,
          discoveryState: cand.discoveryState || "AI_SUGGESTED",
          isVerifiedAccount: false,
        };
      })
    );

    return verifiedCandidates;
  }
}
