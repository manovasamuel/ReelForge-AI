import type { CopilotRevisionRequest, RevisionResult } from "@/types/copilot";

export interface ICopilotService {
  /**
   * Processes a targeted micro-revision request.
   * This is a complete lifecycle that includes context building, AI generation, validation, and diffing.
   */
  processRevision<T = any>(request: CopilotRevisionRequest): Promise<RevisionResult<T>>;
}
