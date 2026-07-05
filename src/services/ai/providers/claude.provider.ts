import type { IAIProvider, AIResponse, AIPromptPayload, AIProviderId } from "../provider.interface";
import { ResponseNormalizer } from "../response.normalizer";

/**
 * Anthropic Claude Provider — ReelForge AI v2.0 Phase 5.
 *
 * Communicates solely with Anthropic API endpoints (claude-3-5-sonnet / claude-3-haiku).
 * Receives provider-independent AIPromptPayload, executes REST call, delegates output
 * normalization to ResponseNormalizer, and attaches token/latency/cost telemetry.
 */
export class ClaudeProvider implements IAIProvider {
  public readonly id: AIProviderId = "claude";
  public readonly name = "Anthropic Claude (claude-3-5-sonnet-20241022)";
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor(model = "claude-3-5-sonnet-20241022") {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    this.model = process.env.AI_MODEL || model;
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && !this.apiKey.includes("placeholder"));
  }

  public async generateStructured<T>(payload: AIPromptPayload<T>): Promise<AIResponse<T>> {
    if (!this.isAvailable()) {
      throw new Error("Anthropic API key is not configured or unavailable.");
    }

    const startTime = performance.now();
    const url = "https://api.anthropic.com/v1/messages";

    const requestBody = {
      model: this.model,
      system: payload.systemPrompt,
      messages: [
        {
          role: "user",
          content: `${payload.userPrompt}\n\nExpected JSON Schema:\n${payload.expectedSchemaDescription}`,
        },
      ],
      temperature: payload.temperature ?? 0.3,
      max_tokens: payload.maxOutputTokens ?? 1024,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      throw new Error(`Claude API request failed (${response.status}): ${errText}`);
    }

    const json = await response.json();
    const rawText = json?.content?.[0]?.text || "";
    const latencyMs = Math.round(performance.now() - startTime);

    const promptTokens = json?.usage?.input_tokens || Math.round(payload.userPrompt.length / 4);
    const completionTokens = json?.usage?.output_tokens || Math.round(rawText.length / 4);
    const totalTokens = promptTokens + completionTokens;

    // claude-3-5-sonnet pricing: ~$3.00 / 1M prompt tokens, ~$15.00 / 1M completion tokens
    const costEstimateUsd = Number(((promptTokens / 1_000_000) * 3.00 + (completionTokens / 1_000_000) * 15.00).toFixed(6));

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
