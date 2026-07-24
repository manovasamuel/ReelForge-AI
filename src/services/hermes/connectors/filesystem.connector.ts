import fs from "fs/promises";
import path from "path";
import { IConnector } from "./base.connector";
import type { ToolDefinition, ToolExecutionRequest, ToolResult } from "../types";

export class FilesystemConnector implements IConnector {
  public readonly id = "filesystem";
  public readonly name = "Filesystem Connector (Dev)";

  private get isDev() {
    return process.env.NODE_ENV !== "production";
  }

  public async discoverTools(): Promise<ToolDefinition[]> {
    if (!this.isDev) {
      console.warn("[Hermes] FilesystemConnector disabled in production.");
      return [];
    }

    return [
      {
        name: "filesystem_read_file",
        description: "Read the contents of a local file (Development Only).",
        permissions: ["fs:read"],
        category: "Filesystem",
        flags: { readOnly: true },
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Absolute or relative path to the file."
            }
          },
          required: ["filePath"]
        }
      },
      {
        name: "filesystem_write_file",
        description: "Write content to a local file (Development Only).",
        permissions: ["fs:write"],
        category: "Filesystem",
        flags: { readOnly: false },
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Absolute or relative path to the file."
            },
            content: {
              type: "string",
              description: "Text content to write to the file."
            }
          },
          required: ["filePath", "content"]
        }
      },
      {
        name: "filesystem_list_directory",
        description: "List contents of a local directory (Development Only).",
        permissions: ["fs:read"],
        category: "Filesystem",
        flags: { readOnly: true },
        inputSchema: {
          type: "object",
          properties: {
            dirPath: {
              type: "string",
              description: "Absolute or relative path to the directory."
            }
          },
          required: ["dirPath"]
        }
      }
    ];
  }

  public async executeTool(request: ToolExecutionRequest): Promise<ToolResult> {
    if (!this.isDev) {
      return {
        success: false,
        error: {
          code: "NOT_SUPPORTED",
          message: "FilesystemConnector is disabled in production."
        }
      };
    }

    try {
      switch (request.toolName) {
        case "filesystem_read_file": {
          const { filePath } = request.arguments;
          if (!filePath) throw new Error("filePath is required");
          const absolutePath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), filePath);
          const content = await fs.readFile(absolutePath, "utf-8");
          return {
            success: true,
            data: content
          };
        }

        case "filesystem_write_file": {
          const { filePath, content } = request.arguments;
          if (!filePath) throw new Error("filePath is required");
          if (content === undefined) throw new Error("content is required");
          
          const absolutePath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), filePath);
          
          // Ensure directory exists
          await fs.mkdir(path.dirname(absolutePath), { recursive: true });
          
          await fs.writeFile(absolutePath, content, "utf-8");
          return {
            success: true,
            data: { success: true, filePath: absolutePath }
          };
        }

        case "filesystem_list_directory": {
          const { dirPath } = request.arguments;
          if (!dirPath) throw new Error("dirPath is required");
          const absolutePath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), dirPath);
          const entries = await fs.readdir(absolutePath, { withFileTypes: true });
          
          const files = entries.map(e => ({
            name: e.name,
            isDirectory: e.isDirectory(),
            isFile: e.isFile()
          }));

          return {
            success: true,
            data: files,
            metadata: { count: files.length }
          };
        }

        default:
          return {
            success: false,
            error: {
              code: "UNKNOWN_TOOL",
              message: `Tool ${request.toolName} is not supported by FilesystemConnector.`
            }
          };
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: "TOOL_EXECUTION_ERROR",
          message: error.message
        }
      };
    }
  }
}
