import type { IAIProvider, AIResponse, AIPromptPayload, AIProviderId } from "../provider.interface";
import { ResponseNormalizer } from "../response.normalizer";

/**
 * OpenRouter Provider — ReelForge AI v2.0 Phase 5.
 *
 * Communicates with OpenRouter API endpoints using standard fetch.
 * Provides access to a massive variety of open-source models with strict cost controls.
 */
export class OpenRouterProvider implements IAIProvider {
  public readonly id: AIProviderId = "openrouter";
  public readonly name = "OpenRouter";

  public readonly capabilities = {
    reasoning: "medium" as const,
    latency: "medium" as const,
    streaming: true,
    vision: true,
    json: true,
    toolCalling: true,
    embeddings: false,
    contextWindow: 128000,
    maxOutputTokens: 8192,
    supportsImages: true,
    supportsAudio: false,
    supportsThinking: false,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
  };

  public readonly metadata = {
    providerId: "openrouter" as AIProviderId,
    defaultModel: "meta-llama/llama-3-8b-instruct",
    fastModel: "meta-llama/llama-3-8b-instruct",
    costPer1kInputTokensMilliCents: 10,
    costPer1kOutputTokensMilliCents: 10,
  };

  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor(model = "meta-llama/llama-3-8b-instruct") {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.model = process.env.AI_MODEL || model;
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && !this.apiKey.includes("placeholder"));
  }

  public async generateStructured<T>(payload: AIPromptPayload<T>): Promise<AIResponse<T>> {
    if (!this.isAvailable()) {
      throw new Error("OpenRouter API key is not configured or unavailable.");
    }

    const startTime = performance.now();
    const url = "https://openrouter.ai/api/v1/chat/completions";

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
        "HTTP-Referer": "https://reelforge.ai", 
        "X-Title": "ReelForge AI",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      throw new Error(`OpenRouter API request failed (${response.status}): ${errText}`);
    }

    const json = await response.json();
    const rawText = json?.choices?.[0]?.message?.content || "";
    const latencyMs = Math.round(performance.now() - startTime);

    const promptTokens = json?.usage?.prompt_tokens || Math.round(payload.userPrompt.length / 4);
    const completionTokens = json?.usage?.completion_tokens || Math.round(rawText.length / 4);
    const totalTokens = json?.usage?.total_tokens || (promptTokens + completionTokens);

    // Cost estimation for OpenRouter varies wildly depending on the model. 
    // We will use a baseline of ~$0.10/1M tokens as an average for small models.
    const costEstimateUsd = Number(((promptTokens / 1_000_000) * 0.10 + (completionTokens / 1_000_000) * 0.10).toFixed(6));
    const costMilliCents = Math.round(costEstimateUsd * 100_000);

    // Normalize via ResponseNormalizer
    const normalizedData = ResponseNormalizer.normalize(rawText, payload);

    return {
      data: normalizedData,
      telemetry: {
        telemetryVersion: 1,
        timestamp: new Date().toISOString(),
        providerId: this.id,
        modelUsed: this.model,
        latencyMs,
        usage: { promptTokens, completionTokens, totalTokens },
        tokensIn: promptTokens,
        tokensOut: completionTokens,
        costEstimateUsd,
        costMilliCents,
        fallbackUsed: false,
      },
    };
  }
}
