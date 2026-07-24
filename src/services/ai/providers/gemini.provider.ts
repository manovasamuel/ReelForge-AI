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
  
  public readonly capabilities = {
    reasoning: "high" as const,
    latency: "low" as const,
    streaming: true,
    vision: true,
    json: true,
    toolCalling: true,
    embeddings: true,
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    supportsImages: true,
    supportsAudio: true,
    supportsThinking: false,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
  };

  public readonly metadata = {
    providerId: "gemini" as AIProviderId,
    defaultModel: "gemini-2.5-pro",
    fastModel: "gemini-3.1-flash-lite",
    costPer1kInputTokensMilliCents: 15,
    costPer1kOutputTokensMilliCents: 60,
  };

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

    const contents: any[] = [];

    if (payload.conversationHistory) {
      for (const msg of payload.conversationHistory) {
        if (msg.role === "user") {
          contents.push({ role: "user", parts: [{ text: msg.content }] });
        } else if (msg.role === "assistant") {
          if (msg.toolCalls && msg.toolCalls.length > 0) {
            contents.push({
              role: "model",
              parts: msg.toolCalls.map(tc => ({ functionCall: { name: tc.name, args: tc.arguments } }))
            });
          } else {
            contents.push({ role: "model", parts: [{ text: msg.content }] });
          }
        } else if (msg.role === "tool" && msg.toolResult) {
          contents.push({
            role: "function",
            parts: [{
              functionResponse: {
                name: msg.toolResult.name,
                response: { name: msg.toolResult.name, content: JSON.parse(msg.toolResult.result) }
              }
            }]
          });
        }
      }
    }

    const requestText = payload.userPrompt.includes(payload.expectedSchemaDescription)
      ? `${payload.systemPrompt}\n\n${payload.userPrompt}`
      : `${payload.systemPrompt}\n\n${payload.userPrompt}\n\nExpected JSON Schema:\n${payload.expectedSchemaDescription}`;

    const currentParts: any[] = [{ text: requestText }];

    if (payload.images && payload.images.length > 0) {
      for (const img of payload.images) {
        currentParts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.data,
          }
        });
      }
    }
    
    contents.push({ role: "user", parts: currentParts });

    const requestBody: any = {
      contents,
      generationConfig: {
        temperature: payload.temperature ?? 0.3,
        maxOutputTokens: payload.maxOutputTokens ?? 1024,
        responseMimeType: "application/json",
      },
    };

    if (payload.tools && payload.tools.length > 0) {
      requestBody.tools = [{
        functionDeclarations: payload.tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema
        }))
      }];
    }

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
    const partsRes = json?.candidates?.[0]?.content?.parts || [];
    
    // Check if the response is a tool call
    const toolCalls = partsRes
      .filter((p: any) => !!p.functionCall)
      .map((p: any, idx: number) => ({
        id: `call_${idx}`,
        name: p.functionCall.name,
        arguments: p.functionCall.args
      }));

    if (toolCalls.length > 0) {
       return {
         data: payload.fallbackData,
         toolCalls,
         telemetry: this.buildTelemetry(payload, json, startTime)
       };
    }

    const rawText = partsRes.find((p: any) => !!p.text)?.text || "";
    const normalizedData = ResponseNormalizer.normalize(rawText, payload);

    return {
      data: normalizedData,
      telemetry: this.buildTelemetry(payload, json, startTime)
    };
  }

  private buildTelemetry(payload: AIPromptPayload<any>, json: any, startTime: number) {
    const latencyMs = Math.round(performance.now() - startTime);
    const promptTokens = json?.usageMetadata?.promptTokenCount || Math.round(payload.userPrompt.length / 4);
    const completionTokens = json?.usageMetadata?.candidatesTokenCount || 0;
    const totalTokens = json?.usageMetadata?.totalTokenCount || (promptTokens + completionTokens);
    const costEstimateUsd = Number(((promptTokens / 1_000_000) * 0.075 + (completionTokens / 1_000_000) * 0.30).toFixed(6));

    return {
        telemetryVersion: 1,
        timestamp: new Date().toISOString(),
        providerId: this.id,
        requestedModel: this.model,
        modelUsed: this.model,
        latencyMs,
        usage: { promptTokens, completionTokens, totalTokens },
        costEstimateUsd,
        fallbackUsed: false,
    };
  }
}
