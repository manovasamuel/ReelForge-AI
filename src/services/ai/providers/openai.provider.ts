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
  public readonly name = "OpenAI (gpt-4o)";

  public readonly capabilities = {
    reasoning: "high" as const,
    latency: "medium" as const,
    streaming: true,
    vision: true,
    json: true,
    toolCalling: true,
    embeddings: true,
    contextWindow: 128000,
    maxOutputTokens: 16384,
    supportsImages: true,
    supportsAudio: true,
    supportsThinking: false,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
  };

  public readonly metadata = {
    providerId: "openai" as AIProviderId,
    defaultModel: "gpt-4o",
    fastModel: "gpt-4o-mini",
    costPer1kInputTokensMilliCents: 250,
    costPer1kOutputTokensMilliCents: 1000,
  };

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
      const messages: any[] = [{ role: "system", content: payload.systemPrompt }];

      if (payload.conversationHistory) {
        for (const msg of payload.conversationHistory) {
          if (msg.role === "user") {
            messages.push({ role: "user", content: msg.content });
          } else if (msg.role === "assistant") {
            if (msg.toolCalls && msg.toolCalls.length > 0) {
              messages.push({
                role: "assistant",
                content: msg.content || null,
                tool_calls: msg.toolCalls.map(tc => ({
                  id: tc.id,
                  type: "function",
                  function: { name: tc.name, arguments: JSON.stringify(tc.arguments) }
                }))
              });
            } else {
              messages.push({ role: "assistant", content: msg.content });
            }
          } else if (msg.role === "tool" && msg.toolResult) {
            messages.push({
              role: "tool",
              tool_call_id: msg.toolResult.id,
              content: msg.toolResult.result
            });
          }
        }
      }

      const userContent: any[] = [
        {
          type: "text",
          text: `${payload.userPrompt}\n\nExpected JSON Schema:\n${payload.expectedSchemaDescription}`,
        }
      ];

      if (payload.images && payload.images.length > 0) {
        for (const img of payload.images) {
          userContent.push({
            type: "image_url",
            image_url: {
              url: `data:${img.mimeType};base64,${img.data}`
            }
          });
        }
      }
      messages.push({ role: "user", content: userContent });

      const requestBody: any = {
        model: this.model,
        messages,
      temperature: payload.temperature ?? 0.3,
      max_tokens: payload.maxOutputTokens ?? 1024,
      response_format: { type: "json_object" },
    };

    if (payload.tools && payload.tools.length > 0) {
      requestBody.tools = payload.tools.map(tool => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema
        }
      }));
      requestBody.tool_choice = "auto";
    }

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
    const message = json?.choices?.[0]?.message;

    if (message?.tool_calls && message.tool_calls.length > 0) {
      const toolCalls = message.tool_calls.map((tc: any) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments || "{}")
      }));

      return {
        data: payload.fallbackData,
        toolCalls,
        telemetry: this.buildTelemetry(payload, json, startTime)
      };
    }

    const rawText = message?.content || "";
    const normalizedData = ResponseNormalizer.normalize(rawText, payload);

    return {
      data: normalizedData,
      telemetry: this.buildTelemetry(payload, json, startTime)
    };
  }

  private buildTelemetry(payload: AIPromptPayload<any>, json: any, startTime: number) {
    const latencyMs = Math.round(performance.now() - startTime);
    const promptTokens = json?.usage?.prompt_tokens || Math.round(payload.userPrompt.length / 4);
    const completionTokens = json?.usage?.completion_tokens || 0;
    const totalTokens = json?.usage?.total_tokens || (promptTokens + completionTokens);
    const costEstimateUsd = Number(((promptTokens / 1_000_000) * 0.15 + (completionTokens / 1_000_000) * 0.60).toFixed(6));

    return {
        telemetryVersion: 1,
        timestamp: new Date().toISOString(),
        providerId: this.id,
        modelUsed: this.model,
        latencyMs,
        usage: { promptTokens, completionTokens, totalTokens },
        costEstimateUsd,
    };
  }
}
