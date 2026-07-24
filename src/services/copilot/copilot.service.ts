import type { ICopilotService } from "./copilot.service.interface";
import type { CopilotRevisionRequest, RevisionResult, PreparedRevisionRequest } from "@/types/copilot";
import type { SavedProject } from "@/types/project";
import { getCopilotConfig } from "@/config/copilot.config";
import { RevisionContextBuilder } from "./revision-context.builder";
import { PromptBuilder } from "@/services/ai/prompt.builder";
import { RevisionValidator } from "./revision.validator";
import { getAIOrchestrator } from "@/services/ai/providers";
import { DiffEngine } from "./diff.engine";

export class CopilotService implements ICopilotService {
  
  /**
   * Processes a targeted micro-revision request via the AI Orchestrator.
   */
  async processRevision<T = any>(request: CopilotRevisionRequest, projectStub?: SavedProject): Promise<RevisionResult<T>> {
    const config = getCopilotConfig();
    
    if (!config.enabled) {
      return this.createErrorResult("Interactive Studio Copilot is currently disabled in configuration.");
    }

    if (!projectStub) {
      return this.createErrorResult("Project context is required to process revisions.");
    }

    try {
      // 1. Prepare Request (Context, Prompt, Routing)
      const preparedRequest = this.prepareRequest(request, projectStub, config);
      
      // 2. Invoke Provider via Orchestrator
      const orchestrator = getAIOrchestrator(undefined, preparedRequest.routing.model);
      const aiResponse = await orchestrator.generateStructured(preparedRequest.prompt);
      
      // 3. Validation & Result Generation
      const result = RevisionValidator.validate<T>(aiResponse, preparedRequest.targetNode);
      
      // Merge in Session Metadata
      result.sessionId = preparedRequest.session.sessionId;
      result.revisionId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Generate structural diff if validation succeeded
      if (result.success && result.revisedNode) {
        result.diff = DiffEngine.generate(preparedRequest.targetNode, result.revisedNode);
        console.log(`[CopilotService Phase 4] Revision Success. Diff generated. Tokens saved: ${result.telemetry.tokensSaved}`);
      }
      
      return result;
    } catch (err: any) {
      return this.createErrorResult(err.message);
    }
  }

  /**
   * Internal pipeline step to isolate prompt construction and routing decision.
   */
  private prepareRequest(
    request: CopilotRevisionRequest,
    project: SavedProject,
    config: any
  ): PreparedRevisionRequest {
    const { targetNode, summary } = RevisionContextBuilder.build(project, request);
    
    const promptPayload = PromptBuilder.buildCopilotRevisionPrompt(
      targetNode, 
      summary, 
      request.instruction, 
      targetNode
    );
    
    const routingTier = config.routingMap[request.nodeType] || 2;
    let targetModel = config.routing.standardModel;
    if (routingTier === 1) targetModel = config.routing.fastModel;
    if (routingTier === 3) targetModel = config.routing.premiumModel;

    return {
      session: { sessionId: request.sessionId, projectId: request.projectId },
      routing: { tier: routingTier, model: targetModel },
      targetNode,
      contextSummary: summary,
      prompt: promptPayload
    };
  }

  private createErrorResult<T>(message: string): RevisionResult<T> {
    return {
      success: false,
      validation: { passed: false, confidence: "low" },
      telemetry: { modelUsed: "none", durationMs: 0, tokensSaved: 0 },
      warnings: [],
      errors: [message],
    };
  }
}

