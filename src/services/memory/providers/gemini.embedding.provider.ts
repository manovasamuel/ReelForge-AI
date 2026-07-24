import type { IEmbeddingProvider } from "../types";

export class GeminiEmbeddingProvider implements IEmbeddingProvider {
  public readonly id = "gemini";
  public readonly modelName = "text-embedding-004";
  public readonly dimensions = 768;

  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && !this.apiKey.includes("placeholder"));
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    if (!this.isAvailable()) {
      throw new Error("Gemini API key is not configured or unavailable.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:embedContent?key=${this.apiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${this.modelName}`,
        content: {
          parts: [{ text }]
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini embedding failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.embedding.values;
  }

  public async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.isAvailable()) {
      throw new Error("Gemini API key is not configured or unavailable.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:batchEmbedContents?key=${this.apiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: texts.map(text => ({
          model: `models/${this.modelName}`,
          content: {
            parts: [{ text }]
          }
        }))
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini batch embedding failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.embeddings.map((emb: any) => emb.values);
  }
}
