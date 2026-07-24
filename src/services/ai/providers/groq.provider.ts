import type { IAIProvider, AIResponse, AIPromptPayload, AIProviderId } from "../provider.interface";
import { ResponseNormalizer } from "../response.normalizer";

/**
 * Groq Provider — ReelForge AI v2.0 Phase 5.
 *
 * Communicates with Groq API endpoints using standard fetch (OpenAI compatible).
 * Optimized for ultra-low latency tasks.
 */
export class GroqProvider implements IAIProvider {
  public readonly id: AIProviderId = "groq";
  public readonly name = "Groq (Llama 3)";

  public readonly capabilities = {
    reasoning: "high" as const,
    latency: "ultra-low" as const,
    streaming: true,
    vision: true,
    json: true,
    toolCalling: true,
    embeddings: false,
    contextWindow: 131072,
    maxOutputTokens: 8192,
    supportsImages: false,
    supportsAudio: false,
    supportsThinking: false,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
  };

  public readonly metadata = {
    providerId: "groq" as AIProviderId,
    defaultModel: "llama-3.1-70b-versatile",
    fastModel: "llama-3.1-8b-instant",
    costPer1kInputTokensMilliCents: 59,
    costPer1kOutputTokensMilliCents: 79,
  };

  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor(model = "llama-3.1-70b-versatile") {
    this.apiKey = process.env.GROQ_API_KEY;
    this.model = process.env.AI_MODEL || model;
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && !this.apiKey.includes("placeholder"));
  }

  public async generateStructured<T>(payload: AIPromptPayload<T>): Promise<AIResponse<T>> {
    if (!this.isAvailable()) {
      throw new Error("Groq API key is not configured or unavailable.");
    }

    const startTime = performance.now();
    const url = "https://api.groq.com/openai/v1/chat/completions";

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
      throw new Error(`Groq API request failed (${response.status}): ${errText}`);
    }

    const json = await response.json();
    const rawText = json?.choices?.[0]?.message?.content || "";
    const latencyMs = Math.round(performance.now() - startTime);

    const promptTokens = json?.usage?.prompt_tokens || Math.round(payload.userPrompt.length / 4);
    const completionTokens = json?.usage?.completion_tokens || Math.round(rawText.length / 4);
    const totalTokens = json?.usage?.total_tokens || (promptTokens + completionTokens);

    // Groq Pricing varies by model. For Llama 3 70B: ~$0.59/1M in, ~$0.79/1M out.
    // Llama 3 8B: ~$0.05/1M in, ~$0.08/1M out.
    let costInCents = 0.59;
    let costOutCents = 0.79;
    if (this.model.includes("8b")) {
      costInCents = 0.05;
      costOutCents = 0.08;
    }
    
    const costEstimateUsd = Number(((promptTokens / 1_000_000) * costInCents + (completionTokens / 1_000_000) * costOutCents).toFixed(6));
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
