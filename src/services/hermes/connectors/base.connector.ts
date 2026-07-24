import type { ToolDefinition, ToolExecutionRequest, ToolResult } from "../types";

/**
 * Base Connector interface that all tool providers must implement.
 * This abstracts away the difference between internal in-memory execution
 * and external MCP transport execution.
 */
export interface IConnector {
  /**
   * Unique identifier for this connector instance.
   */
  readonly id: string;
  
  /**
   * Human-readable name of the connector.
   */
  readonly name: string;

  /**
   * Discovers and returns all tools supported by this connector.
   */
  discoverTools(): Promise<ToolDefinition[]>;

  /**
   * Executes a specific tool provided by this connector.
   * @param request The tool execution request containing name, arguments, and context.
   */
  executeTool(request: ToolExecutionRequest): Promise<ToolResult>;
}
