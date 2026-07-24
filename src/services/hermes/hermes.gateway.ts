import { connectorRegistry } from "./connector.registry";
import type { ToolDefinition, ToolExecutionRequest, ToolResult, HermesTelemetry, HermesErrorCode } from "./types";
import { SecurityGuard } from "./security.guard";

/**
 * Hermes Gateway - The Orchestration Layer for Tool Execution.
 * Abstracts the complexity of connectors, transports, and tool routing.
 */
export class HermesGateway {
  private toolRoutingCache: Map<string, string> = new Map();

  /**
   * Discovers and aggregates all tools across all registered connectors.
   * Caches results internally for performance during active AI generation loops.
   */
  public async getAvailableTools(): Promise<ToolDefinition[]> {
    const connectors = connectorRegistry.getAllConnectors();
    let allTools: ToolDefinition[] = [];

    // Depending on the number of connectors, this could be parallelized.
    for (const connector of connectors) {
      try {
        const tools = await connector.discoverTools();
        const enrichedTools = tools.map((t) => {
          this.toolRoutingCache.set(t.name, connector.id);
          return {
            ...t,
            _connectorId: connector.id, // Internal routing metadata
          };
        });
        allTools = allTools.concat(enrichedTools);
      } catch (error) {
        console.error(`[Hermes] Failed to discover tools for connector ${connector.name}:`, error);
      }
    }

    return allTools;
  }

  /**
   * Executes a tool by routing the request to the appropriate connector.
   * Also manages telemetry and standardized error handling.
   */
  public async executeTool(
    request: ToolExecutionRequest
  ): Promise<{ result: ToolResult; telemetry: HermesTelemetry }> {
    const startTime = performance.now();
    const connectorId = this.toolRoutingCache.get(request.toolName);
    const connector = connectorId ? connectorRegistry.getConnector(connectorId) : undefined;

    if (!connector || !connectorId) {
      return {
        result: {
          success: false,
          error: {
            code: "ConnectorUnavailable",
            message: `Connector for tool ${request.toolName} is not registered or unavailable.`,
          },
        },
        telemetry: this.buildTelemetry(request.toolName, connectorId || "UNKNOWN", performance.now() - startTime, false, "FAILED", "ConnectorUnavailable"),
      };
    }

    try {
      // Phase 4 Security Guard Validation
      await SecurityGuard.authorize(request);
      
      const result = await connector.executeTool(request);
      
      const executionTimeMs = Math.round(performance.now() - startTime);
      return {
        result,
        telemetry: this.buildTelemetry(request.toolName, connectorId, executionTimeMs, result.success, "GRANTED", result.error?.code as HermesErrorCode),
      };
    } catch (error: any) {
      const executionTimeMs = Math.round(performance.now() - startTime);
      const code = error.code || "ConnectorExecutionFailed";
      const authResult = ["AuthorizationFailed", "ValidationFailed"].includes(code) ? "DENIED" : "GRANTED";
      
      return {
        result: {
          success: false,
          error: {
            code,
            message: error.message || "An unexpected error occurred during tool execution.",
          },
        },
        telemetry: this.buildTelemetry(request.toolName, connectorId, executionTimeMs, false, authResult, code),
      };
    }
  }

  private buildTelemetry(
    toolName: string,
    connectorId: string,
    executionTimeMs: number,
    success: boolean,
    authorizationResult: "GRANTED" | "DENIED" | "FAILED",
    errorType?: HermesErrorCode | string
  ): HermesTelemetry {
    return {
      toolName,
      connectorId,
      executionTimeMs,
      success,
      retries: 0,
      authorizationResult,
      errorType
    };
  }
}
