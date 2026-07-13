import type { IAIProvider, AIResponse, AIPromptPayload, AIProviderId } from "../provider.interface";
import { ResponseNormalizer } from "../response.normalizer";

/**
 * Google Gemini AI Provider — ReelForge AI v2.0 Phase 5.
 *
 * Communicates solely with Google Gemini API endpoints (gemini-2.5-flash / gemini-2.5-pro).
 * Receives provider-independent AIPromptPayload, executes REST call, delegates output
 * normalization to ResponseNormalizer, and attaches token/latency/cost telemetry.
 */
export class GeminiProvider implements IAIProvider {
  public readonly id: AIProviderId = "gemini";
  public readonly name = "Google Gemini";
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor(model = "gemini-3.1-flash-lite") {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = (model && model !== "default") ? model : (process.env.GEMINI_MODEL || process.env.AI_MODEL || "gemini-3.1-flash-lite");
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && !this.apiKey.includes("placeholder"));
  }

  public async generateStructured<T>(payload: AIPromptPayload<T>): Promise<AIResponse<T>> {
    if (!this.isAvailable()) {
      throw new Error("Gemini API key is not configured or unavailable.");
    }

    const startTime = performance.now();
    const activeModel = this.model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${payload.systemPrompt}\n\n${payload.userPrompt}\n\nExpected JSON Schema:\n${payload.expectedSchemaDescription}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: payload.temperature ?? 0.3,
        maxOutputTokens: payload.maxOutputTokens ?? 1024,
        responseMimeType: "application/json",
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      throw new Error(`Gemini API request failed (${response.status}): ${errText}`);
    }

    const json = await response.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const latencyMs = Math.round(performance.now() - startTime);

    const promptTokens = json?.usageMetadata?.promptTokenCount || Math.round(payload.userPrompt.length / 4);
    const completionTokens = json?.usageMetadata?.candidatesTokenCount || Math.round(rawText.length / 4);
    const totalTokens = json?.usageMetadata?.totalTokenCount || (promptTokens + completionTokens);

    // Gemini 2.5 Flash / Flash Lite pricing approximation
    const costEstimateUsd = Number(((promptTokens / 1_000_000) * 0.075 + (completionTokens / 1_000_000) * 0.30).toFixed(6));

    // Normalize via ResponseNormalizer
    const normalizedData = ResponseNormalizer.normalize(rawText, payload);

    return {
      data: normalizedData,
      telemetry: {
        providerId: this.id,
        requestedModel: this.model,
        modelUsed: activeModel,
        latencyMs,
        usage: { promptTokens, completionTokens, totalTokens },
        costEstimateUsd,
        fallbackUsed: false,
      },
    };
  }
}
