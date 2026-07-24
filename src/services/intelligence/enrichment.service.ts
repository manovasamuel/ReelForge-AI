import { InstagramPost } from "@/types/instagram";
import { AIOrchestratorProvider } from "@/services/ai/providers/orchestrator.provider";
import { db } from "@/lib/db";
import { postIntelligence } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface EnrichedPostIntelligence {
  hookType: string;
  hookPattern: string;
  contentPillar: string;
  emotionalTone: string;
  audienceIntent: string;
  ctaClassification: string;
  storytellingFramework: string;
  visualStyle: string;
  editingStyle: string;
  captionStructure: string;
  brandVoice: string;
  viralScore: number;
  organicVsPaidConfidence: string;
  contentDna: string;
}

/**
 * EnrichmentService handles transforming raw normalized canonical data
 * into high-value AI-enriched intelligence.
 */
export class EnrichmentService {
  private aiProvider: AIOrchestratorProvider;

  constructor() {
    this.aiProvider = new AIOrchestratorProvider("gemini");
  }

  /**
   * Enriches an InstagramPost using the AI Orchestrator and saves the result to the DB.
   */
  async enrichPost(post: InstagramPost, workspaceId: string): Promise<EnrichedPostIntelligence> {
    console.log(`[EnrichmentService] Starting AI enrichment for post: ${post.id}`);

    // If caption is empty and it's just an image, intelligence might be limited, but we still try.
    const prompt = `
      You are an elite Instagram growth strategist and content analyst.
      Analyze the following Instagram post and return a structured JSON response categorizing its core attributes.

      Post Details:
      - Type: ${post.type}
      - Likes: ${post.likes}
      - Comments: ${post.comments}
      - Caption: "${post.caption || 'No caption'}"

      Return a JSON object with EXACTLY these keys:
      {
        "hookType": "string (e.g. Curiosity, Negative, Value-driven, Story-based)",
        "hookPattern": "string (e.g. 'How I X without Y', 'Stop doing Z')",
        "contentPillar": "string (e.g. Educational, Entertaining, Inspirational, Promotional)",
        "emotionalTone": "string (e.g. Urgent, Humorous, Authoritative, Empathetic)",
        "audienceIntent": "string (e.g. Save for later, Share with friend, Buy now)",
        "ctaClassification": "string (e.g. Hard sell, Soft engagement, Value offer, None)",
        "storytellingFramework": "string (e.g. PAS - Problem Agitate Solve, Hero's Journey, Before/After)",
        "visualStyle": "string (e.g. Minimalist, UGC, Highly produced, Text-heavy) - infer from context if possible",
        "editingStyle": "string (e.g. Fast-paced, Vlogs, Aesthetic) - infer from context",
        "captionStructure": "string (e.g. Short & punchy, Long-form storytelling, Bullet points)",
        "brandVoice": "string (e.g. Professional, Casual, Disruptive)",
        "viralScore": "number (0-100 estimate based on engagement vs type/caption length)",
        "organicVsPaidConfidence": "string (e.g. Highly Organic, Likely Boosted, Ad Creative)",
        "contentDna": "string (A 1-sentence summary of the unique DNA of this post)"
      }
    `;

    const aiResponse = await this.aiProvider.generateStructured<EnrichedPostIntelligence>({
      schemaType: "content-intelligence",
      expectedSchemaDescription: "Structured intelligence extracted from an Instagram post",
      fallbackData: {
        hookType: "Unknown",
        hookPattern: "Unknown",
        contentPillar: "Unknown",
        emotionalTone: "Unknown",
        audienceIntent: "Unknown",
        ctaClassification: "Unknown",
        storytellingFramework: "Unknown",
        visualStyle: "Unknown",
        editingStyle: "Unknown",
        captionStructure: "Unknown",
        brandVoice: "Unknown",
        viralScore: 0,
        organicVsPaidConfidence: "Unknown",
        contentDna: "Unknown"
      },
      systemPrompt: "You are an elite Instagram growth strategist and content analyst.",
      userPrompt: prompt,
      temperature: 0.2
    });

    if (!aiResponse.data) {
      throw new Error("AI returned empty data during enrichment.");
    }

    const intelligence = aiResponse.data;

    // Attempt to persist to database
    try {
      await db.insert(postIntelligence).values({
        id: randomUUID(),
        postId: post.id,
        hookType: intelligence.hookType || "Unknown",
        contentPillar: intelligence.contentPillar || "Unknown",
        ctaClassification: intelligence.ctaClassification || "Unknown",
        emotionalTone: intelligence.emotionalTone || "Unknown",
        visualStyle: intelligence.visualStyle || "Unknown",
        captionStructure: intelligence.captionStructure || "Unknown",
        viralScore: String(intelligence.viralScore || 0),
        rawIntelligence: intelligence,
      }).onConflictDoUpdate({
        target: postIntelligence.postId,
        set: {
          hookType: intelligence.hookType || "Unknown",
          contentPillar: intelligence.contentPillar || "Unknown",
          ctaClassification: intelligence.ctaClassification || "Unknown",
          emotionalTone: intelligence.emotionalTone || "Unknown",
          visualStyle: intelligence.visualStyle || "Unknown",
          captionStructure: intelligence.captionStructure || "Unknown",
          viralScore: String(intelligence.viralScore || 0),
          rawIntelligence: intelligence,
          updatedAt: new Date(),
        }
      });
      console.log(`[EnrichmentService] Successfully persisted intelligence for post: ${post.id}`);
    } catch (dbError) {
      console.error(`[EnrichmentService] Database persistence failed for post ${post.id}. Reason:`, dbError);
      // We don't throw here. If the post isn't in DB yet due to async constraints, we still return the intelligence.
    }

    return intelligence;
  }
}

export const enrichmentService = new EnrichmentService();
