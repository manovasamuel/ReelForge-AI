export interface ExecutionContext {
  userId: string;
  workspaceId: string;
  projectId?: string;
  profileId?: string; // Phase 6 AIIE target profile ID
  permissions: string[];
  correlationId: string;
  requestId?: string;
  sessionId?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any; // JSON Schema object for arguments
}

export interface ToolDefinition extends MCPTool {
  permissions: string[]; // Required permissions to execute this tool
  version?: number; // Enables schema evolution
  category?: string; // e.g., 'Knowledge', 'Filesystem', 'Creative'
  flags?: {
    supportsStreaming?: boolean;
    supportsProgress?: boolean;
    readOnly?: boolean;
    requiresConfirmation?: boolean;
  };
}

export interface ToolExecutionRequest {
  toolName: string;
  arguments: Record<string, any>;
  context: ExecutionContext;
}

export type HermesErrorCode = 
  | "AuthorizationFailed"
  | "ValidationFailed"
  | "ToolNotFound"
  | "ConnectorUnavailable"
  | "ConnectorTimeout"
  | "ConnectorExecutionFailed"
  | "UnknownError";

export interface ToolResult {
  success: boolean;
  data?: any;
  metadata?: Record<string, any>;
  error?: {
    code: HermesErrorCode | string;
    message: string;
  };
}

export interface HermesTelemetry {
  toolName: string;
  connectorId: string;
  executionTimeMs: number;
  success: boolean;
  authorizationResult: "GRANTED" | "DENIED" | "FAILED";
  retries: number;
  errorType?: HermesErrorCode | string;
}
