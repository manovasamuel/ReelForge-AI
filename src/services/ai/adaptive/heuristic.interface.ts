export interface HeuristicEvaluation {
  score: number; // 0 to 100
  failedRules: string[];
}

export interface IHeuristicEvaluator<T> {
  /**
   * Deterministically evaluates the quality of an AI output payload.
   * Returns a score out of 100 and a list of specific rule failures.
   */
  evaluate(data: T): HeuristicEvaluation;
}
