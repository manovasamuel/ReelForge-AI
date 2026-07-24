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

  public readonly capabilities = {
    reasoning: "complex" as const,
    latency: "medium" as const,
    streaming: true,
    vision: true,
    json: true,
    toolCalling: true,
    embeddings: false,
    contextWindow: 200000,
    maxOutputTokens: 8192,
    supportsImages: true,
    supportsAudio: false,
    supportsThinking: false,
    supportsFunctionCalling: true,
    supportsStructuredOutput: false, // Claude doesn't strictly have a true JSON schema mode native like OpenAI, though it supports it through tool calling
  };

  public readonly metadata = {
    providerId: "claude" as AIProviderId,
    defaultModel: "claude-3-5-sonnet-20241022",
    fastModel: "claude-3-5-haiku-20241022",
    costPer1kInputTokensMilliCents: 300,
    costPer1kOutputTokensMilliCents: 1500,
  };

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
      const messages: any[] = [];

      if (payload.conversationHistory) {
        for (const msg of payload.conversationHistory) {
          if (msg.role === "user") {
            messages.push({ role: "user", content: msg.content });
          } else if (msg.role === "assistant") {
            if (msg.toolCalls && msg.toolCalls.length > 0) {
              const content: any[] = msg.content ? [{ type: "text", text: msg.content }] : [];
              msg.toolCalls.forEach(tc => {
                content.push({
                  type: "tool_use",
                  id: tc.id,
                  name: tc.name,
                  input: tc.arguments
                });
              });
              messages.push({ role: "assistant", content });
            } else {
              messages.push({ role: "assistant", content: msg.content });
            }
          } else if (msg.role === "tool" && msg.toolResult) {
            messages.push({
              role: "user",
              content: [
                {
                  type: "tool_result",
                  tool_use_id: msg.toolResult.id,
                  content: msg.toolResult.result
                }
              ]
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
            type: "image",
            source: {
              type: "base64",
              media_type: img.mimeType,
              data: img.data,
            }
          });
        }
      }

      messages.push({
        role: "user",
        content: userContent,
      });

      const requestBody: any = {
        model: this.model,
        system: payload.systemPrompt,
        messages,
      temperature: payload.temperature ?? 0.3,
      max_tokens: payload.maxOutputTokens ?? 1024,
    };

    if (payload.tools && payload.tools.length > 0) {
      requestBody.tools = payload.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema
      }));
    }

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
    const contentArr = json?.content || [];

    const toolUses = contentArr.filter((c: any) => c.type === "tool_use");
    if (toolUses.length > 0) {
      const toolCalls = toolUses.map((tu: any) => ({
        id: tu.id,
        name: tu.name,
        arguments: tu.input
      }));

      return {
        data: payload.fallbackData,
        toolCalls,
        telemetry: this.buildTelemetry(payload, json, startTime)
      };
    }

    const rawText = contentArr.find((c: any) => c.type === "text")?.text || "";
    const normalizedData = ResponseNormalizer.normalize(rawText, payload);

    return {
      data: normalizedData,
      telemetry: this.buildTelemetry(payload, json, startTime)
    };
  }

  private buildTelemetry(payload: AIPromptPayload<any>, json: any, startTime: number) {
    const latencyMs = Math.round(performance.now() - startTime);
    const promptTokens = json?.usage?.input_tokens || Math.round(payload.userPrompt.length / 4);
    const completionTokens = json?.usage?.output_tokens || 0;
    const totalTokens = promptTokens + completionTokens;
    const costEstimateUsd = Number(((promptTokens / 1_000_000) * 3.00 + (completionTokens / 1_000_000) * 15.00).toFixed(6));

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
