import type { IAIProvider, AIResponse, AIPromptPayload, AIProviderId } from "../provider.interface";
import { ResponseNormalizer } from "../response.normalizer";

/**
 * OpenAI Provider — ReelForge AI v2.0 Phase 5.
 *
 * Communicates solely with OpenAI API endpoints (gpt-4o-mini / gpt-4o).
 * Receives provider-independent AIPromptPayload, executes REST call, delegates output
 * normalization to ResponseNormalizer, and attaches token/latency/cost telemetry.
 */
export class OpenAIProvider implements IAIProvider {
  public readonly id: AIProviderId = "openai";
  public readonly name = "OpenAI (gpt-4o-mini)";
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor(model = "gpt-4o-mini") {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.AI_MODEL || model;
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && !this.apiKey.includes("placeholder"));
  }

  public async generateStructured<T>(payload: AIPromptPayload<T>): Promise<AIResponse<T>> {
    if (!this.isAvailable()) {
      throw new Error("OpenAI API key is not configured or unavailable.");
    }

    const startTime = performance.now();
    const url = "https://api.openai.com/v1/chat/completions";

    const requestBody = {
      model: this.model,
      messages: [
        { role: "system", content: payload.systemPrompt },
        {
          role: "user",
          content: `${payload.userPrompt}\n\nExpected JSON Schema:\n${payload.expectedSchemaDescription}`,
        },
      ],
      temperature: payload.temperature ?? 0.3,
      max_tokens: payload.maxOutputTokens ?? 1024,
      response_format: { type: "json_object" },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      throw new Error(`OpenAI API request failed (${response.status}): ${errText}`);
    }

    const json = await response.json();
    const rawText = json?.choices?.[0]?.message?.content || "";
    const latencyMs = Math.round(performance.now() - startTime);

    const promptTokens = json?.usage?.prompt_tokens || Math.round(payload.userPrompt.length / 4);
    const completionTokens = json?.usage?.completion_tokens || Math.round(rawText.length / 4);
    const totalTokens = json?.usage?.total_tokens || (promptTokens + completionTokens);

    // gpt-4o-mini pricing: ~$0.15 / 1M prompt tokens, ~$0.60 / 1M completion tokens
    const costEstimateUsd = Number(((promptTokens / 1_000_000) * 0.15 + (completionTokens / 1_000_000) * 0.60).toFixed(6));

    // Normalize via ResponseNormalizer
    const normalizedData = ResponseNormalizer.normalize(rawText, payload);

    return {
      data: normalizedData,
      telemetry: {
        providerId: this.id,
        modelUsed: this.model,
        latencyMs,
        usage: { promptTokens, completionTokens, totalTokens },
        costEstimateUsd,
        fallbackUsed: false,
      },
    };
  }
}
