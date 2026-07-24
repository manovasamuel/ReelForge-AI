import fs from 'fs';
import path from 'path';

/**
 * AIOS Observability Manager
 *
 * Central telemetry sink. Appends structured JSON logs to a daily file.
 * Tracks full orchestration metrics, trace IDs, and execution timelines.
 */

export interface AgentExecutionTimeline {
  nodeId: string;
  agentName: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  tokensUsed: number;
  modelId: string;
  provider: string;
  success: boolean;
  error?: string;
  // Memory Pipeline metrics
  retrievalCount: number;
  compressionRatio: number;
}

export interface OrchestrationTrace {
  traceId: string;
  workflowId: string;
  startTime: number;
  endTime: number;
  totalDurationMs: number;
  totalTokens: number;
  timeline: AgentExecutionTimeline[];
  success: boolean;
}

export class ObservabilityManager {
  private static instance: ObservabilityManager;
  private readonly LOG_DIR = path.join(process.cwd(), 'logs');

  static getInstance(): ObservabilityManager {
    if (!ObservabilityManager.instance) {
      ObservabilityManager.instance = new ObservabilityManager();
    }
    return ObservabilityManager.instance;
  }

  constructor() {
    if (!fs.existsSync(this.LOG_DIR)) {
      fs.mkdirSync(this.LOG_DIR, { recursive: true });
    }
  }

  /**
   * Logs an entire orchestration trace as a single JSON line to the daily log file.
   */
  logTrace(trace: OrchestrationTrace): void {
    const dateStr = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.LOG_DIR, `${dateStr}-aios.jsonl`);

    const logEntry = JSON.stringify({
      timestamp: new Date().toISOString(),
      ...trace
    }) + '\n';

    try {
      fs.appendFileSync(logFile, logEntry, 'utf-8');
      console.log(`[Observability] Trace ${trace.traceId} logged to ${logFile}`);
    } catch (err) {
      console.error(`[Observability] Failed to write to log file:`, err);
    }
  }

  /**
   * Helper to generate a unique trace ID
   */
  generateTraceId(): string {
    return 'tr_' + Math.random().toString(36).substring(2, 11);
  }
}

export const observabilityManager = ObservabilityManager.getInstance();
