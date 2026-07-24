import { IConnector } from "./base.connector";
import { getBrandKnowledgeService } from "../../brand-knowledge";
import type { ToolDefinition, ToolExecutionRequest, ToolResult } from "../types";

export class BrandKnowledgeConnector implements IConnector {
  public readonly id = "brand_knowledge";
  public readonly name = "Brand Knowledge Connector";

  private readonly service = getBrandKnowledgeService();

  public async discoverTools(): Promise<ToolDefinition[]> {
    return [
      {
        name: "brand_knowledge_list_profiles",
        description: "List all available brand profiles in the workspace/account. Returns a summary of brand IDs and names.",
        permissions: ["brand:read"],
        category: "Knowledge",
        flags: { readOnly: true },
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "brand_knowledge_get_profile",
        description: "Get full metadata and visual identity for a specific brand profile, including its available assets and their vision analysis.",
        permissions: ["brand:read"],
        category: "Knowledge",
        flags: { readOnly: true },
        inputSchema: {
          type: "object",
          properties: {
            brandId: {
              type: "string",
              description: "The UUID of the brand profile to retrieve."
            }
          },
          required: ["brandId"]
        }
      },
      {
        name: "brand_knowledge_search_assets",
        description: "Search visual assets across a brand by tag, asset type, or dominant color.",
        permissions: ["brand:read", "asset:read"],
        category: "Knowledge",
        flags: { readOnly: true },
        inputSchema: {
          type: "object",
          properties: {
            brandId: {
              type: "string",
              description: "The UUID of the brand."
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Optional list of tags to filter by."
            },
            assetType: {
              type: "string",
              description: "Optional type of asset (document, logo, image, font, other)."
            }
          },
          required: ["brandId"]
        }
      }
    ];
  }

  public async executeTool(request: ToolExecutionRequest): Promise<ToolResult> {
    const { userId } = request.context;
    
    try {
      switch (request.toolName) {
        case "brand_knowledge_list_profiles": {
          const profiles = await this.service.listProfiles(userId);
          const summaries = profiles.map(p => ({ id: p.id, name: p.name }));
          return {
            success: true,
            data: summaries,
            metadata: { count: summaries.length }
          };
        }

        case "brand_knowledge_get_profile": {
          const { brandId } = request.arguments;
          if (!brandId) throw new Error("brandId is required");
          const profile = await this.service.getProfile(userId, brandId);
          return {
            success: true,
            data: profile
          };
        }

        case "brand_knowledge_search_assets": {
          const { brandId, tags, assetType } = request.arguments;
          if (!brandId) throw new Error("brandId is required");
          
          const profile = await this.service.getProfile(userId, brandId);
          let assets = profile.assets || [];

          if (tags && Array.isArray(tags) && tags.length > 0) {
            assets = assets.filter(a => {
              const allTags = new Set([...(a.tags || []), ...(a.visionMetadata?.tags || [])]);
              return tags.some(t => allTags.has(t));
            });
          }

          if (assetType) {
            assets = assets.filter(a => a.assetType === assetType);
          }

          return {
            success: true,
            data: assets,
            metadata: { count: assets.length }
          };
        }

        default:
          return {
            success: false,
            error: {
              code: "UNKNOWN_TOOL",
              message: `Tool ${request.toolName} is not supported by BrandKnowledgeConnector.`
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
