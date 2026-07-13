/**
 * Development Prompt Logger — ReelForge AI v2.1 Phase 8.
 *
 * During development (NODE_ENV !== "production"), this utility records and saves:
 *   - Compiled prompt (system + user prompt)
 *   - AI response (normalized domain model or raw response)
 *   - Prompt score (from Phase 7.4 evaluation report)
 *   - Evaluation report (strengths, weaknesses, suggestions)
 *   - Latency (ms)
 *   - Token usage (prompt, completion, total)
 *
 * STRICTLY DISABLED IN PRODUCTION to protect proprietary IP, avoid memory leaks,
 * and maintain high throughput.
 */

export interface DevPromptLogEntry {
  id: string;
  timestamp: string;
  domain: string;
  providerId: string;
  model: string;
  compiledPrompt: string;
  aiResponse: any;
  promptScore?: number;
  evaluationReport?: any;
  latencyMs: number;
  tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export class DevPromptLogger {
  private static memoryLogs: DevPromptLogEntry[] = [];

  /**
   * Logs a prompt execution event during development.
   * No-ops silently in production environments.
   */
  public static log(entry: Omit<DevPromptLogEntry, "id" | "timestamp">): void {
    if (process.env.NODE_ENV === "production" && process.env.ENABLE_PROMPT_LOGS_IN_PROD !== "true") {
      return; // Strictly disabled in production
    }

    const id = crypto.randomUUID();
    const fullEntry: DevPromptLogEntry = {
      id,
      timestamp: new Date().toISOString(),
      ...entry,
    };

    this.memoryLogs.unshift(fullEntry);
    if (this.memoryLogs.length > 200) {
      this.memoryLogs.pop();
    }

    console.info(
      `[DevPromptLogger] 📝 Saved AI Execution Log [ID: ${id.slice(0, 8)}] | Domain: ${entry.domain} | Provider: [${entry.providerId}] | Model: [${entry.model}] | Score: ${entry.promptScore ?? "N/A"}/100 | Latency: ${entry.latencyMs}ms | Tokens: ${entry.tokenUsage?.totalTokens ?? 0}`
    );
  }

  /**
   * Retrieves stored logs for developer inspection or testing.
   * Returns empty array in production.
   */
  public static getLogs(): DevPromptLogEntry[] {
    if (process.env.NODE_ENV === "production" && process.env.ENABLE_PROMPT_LOGS_IN_PROD !== "true") {
      return [];
    }
    return [...this.memoryLogs];
  }

  /**
   * Clears stored logs. Useful between automated test runs.
   */
  public static clearLogs(): void {
    this.memoryLogs = [];
  }
}
