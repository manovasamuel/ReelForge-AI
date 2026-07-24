import type { ToolExecutionRequest, HermesErrorCode } from "./types";
import { connectorRegistry } from "./connector.registry";

export class SecurityGuard {
  /**
   * Validates the execution context and verifies permissions.
   * Throws an error with a specific code if authorization fails.
   */
  public static async authorize(request: ToolExecutionRequest): Promise<void> {
    const { context, toolName } = request;

    // 1. Validate ExecutionContext completeness
    if (!context.userId) {
      this.throwAuthError("ValidationFailed", "Missing userId in ExecutionContext.");
    }
    if (!context.correlationId) {
      this.throwAuthError("ValidationFailed", "Missing correlationId in ExecutionContext.");
    }
    if (!Array.isArray(context.permissions)) {
      this.throwAuthError("ValidationFailed", "Permissions array is missing or invalid in ExecutionContext.");
    }

    // 2. Discover the tool to check its required permissions
    const connectors = connectorRegistry.getAllConnectors();
    let toolDefinition;
    for (const connector of connectors) {
      const tools = await connector.discoverTools();
      const found = tools.find((t) => t.name === toolName);
      if (found) {
        toolDefinition = found;
        break;
      }
    }

    if (!toolDefinition) {
      this.throwAuthError("ToolNotFound", `Tool ${toolName} not found during authorization.`);
    }

    // 3. Verify permissions
    const requiredPermissions = toolDefinition.permissions || [];
    for (const reqPerm of requiredPermissions) {
      if (!context.permissions.includes(reqPerm)) {
        this.throwAuthError("AuthorizationFailed", `User lacks required permission: ${reqPerm}`);
      }
    }

    // 4. Enforce Workspace / Project isolation (Stubbed for future domain logic)
    // Example: If a tool requires workspace isolation, ensure context.workspaceId is provided and the user belongs to it.
    // This is where external service calls to IAM or DB would happen if needed.
    if (context.workspaceId) {
      // Validate user belongs to workspaceId
    }
  }

  private static throwAuthError(code: HermesErrorCode, message: string): never {
    const error = new Error(message) as any;
    error.code = code;
    throw error;
  }
}
