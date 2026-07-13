import { PROMPT_LIBRARY, type PromptModuleDefinition } from "../library";
import type { PromptModuleSelection } from "../prompt.builder";
import { PromptSelectionEngine, type PromptSelectionContext } from "./selection.engine";
import { PromptVariableResolver } from "./variable.resolver";
import { PromptValidationEngine, type PromptValidationResult } from "./validation.engine";
import { PromptPreviewUtility, type PromptPreviewPayload } from "./preview.utility";
import { PromptMetricsEngine, type PromptMetricsReport } from "./metrics.engine";
import { PromptEvaluationEngine, type PromptEvaluationReport } from "./evaluation.engine";
import { PromptOptimizationEngine, type PromptOptimizationResult } from "./optimization.engine";

export interface CompiledPromptResult {
  compiledText: string;
  selection: PromptModuleSelection;
  loadedModules: PromptModuleDefinition[];
  validation: PromptValidationResult;
  evaluation?: PromptEvaluationReport;
  optimization?: PromptOptimizationResult;
  metrics?: PromptMetricsReport;
}

/**
 * Prompt Compiler — ReelForge AI v2.1 Phase 7.3 & 7.4.
 *
 * Implements the deterministic prompt compilation, evaluation, and optimization pipeline:
 * Input Data -> Selection Engine -> Prompt Modules -> Variable Resolver -> Prompt Compiler
 * -> Validation Engine -> Evaluation Engine -> Optimization Engine -> Final Prompt -> AI Provider.
 *
 * Each stage is modular and independently testable.
 * Returns structured validation, evaluation, and metrics results internally.
 */
export class PromptCompiler {
  /**
   * Compiles a prompt from input context and variables, running automatic selection,
   * module loading, variable resolution, structured validation, evaluation, and optimization.
   */
  public static compile(
    context: PromptSelectionContext,
    variables: Record<string, any>,
    selectionOverride?: Partial<PromptModuleSelection>
  ): CompiledPromptResult {
    // Stage 1: Selection Engine
    const autoSelection = PromptSelectionEngine.select(context);
    const selection: PromptModuleSelection = { ...autoSelection, ...selectionOverride };

    return PromptCompiler.compileFromSelection(selection, variables);
  }

  /**
   * Compiles a prompt directly from a specified module selection map and variables.
   */
  public static compileFromSelection(
    selection: PromptModuleSelection,
    variables: Record<string, any>
  ): CompiledPromptResult {
    const categories: (keyof typeof PROMPT_LIBRARY)[] = [
      "system",
      "industry",
      "hook",
      "framework",
      "tone",
      "cta",
      "constraints",
      "examples",
    ];

    // Stage 2: Prompt Modules Loading
    const loadedModules: PromptModuleDefinition[] = [];
    for (const category of categories) {
      const moduleId = selection[category] || "general";
      const categoryLibrary = PROMPT_LIBRARY[category] || {};
      const moduleDef =
        categoryLibrary[moduleId] ||
        categoryLibrary["general"] ||
        categoryLibrary[Object.keys(categoryLibrary)[0]];
      if (moduleDef) {
        loadedModules.push(moduleDef);
      }
    }

    // Stage 3 & 4: Variable Resolver & Prompt Compiler
    const assembledSections: string[] = [];
    for (const mod of loadedModules) {
      const resolvedText = PromptVariableResolver.resolve(
        mod.template,
        variables,
        mod.requiredVariables || []
      );
      if (resolvedText) {
        assembledSections.push(resolvedText);
      }
    }

    const rawCompiledText = assembledSections.join("\n\n");

    // Stage 5: Prompt Validation
    const validation = PromptValidationEngine.validate(rawCompiledText, loadedModules, variables);

    if (!validation.valid) {
      console.warn(
        `[PromptCompiler] Validation detected issues in compiled prompt:\nErrors: ${validation.errors.join(
          "; "
        )}\nWarnings: ${validation.warnings.join("; ")}`
      );
    }

    // Stage 6: Prompt Evaluation (Phase 7.4)
    const evaluation = PromptEvaluationEngine.evaluate(
      rawCompiledText,
      loadedModules,
      variables,
      validation
    );

    // Stage 7: Automatic Optimizer (Phase 7.4)
    const optimization = PromptOptimizationEngine.optimize(rawCompiledText, loadedModules);

    // Stage 8: Prompt Metrics (Phase 7.4)
    const metrics = PromptMetricsEngine.calculate(
      optimization.optimizedText,
      loadedModules,
      variables
    );

    return {
      compiledText: optimization.optimizedText,
      selection,
      loadedModules,
      validation,
      evaluation,
      optimization,
      metrics,
    };
  }

  /**
   * Development utility to preview and inspect a compiled prompt before sending to AI providers.
   * Throws an error if invoked in production environments.
   */
  public static preview(
    context: PromptSelectionContext,
    variables: Record<string, any>,
    selectionOverride?: Partial<PromptModuleSelection>
  ): PromptPreviewPayload {
    const result = PromptCompiler.compile(context, variables, selectionOverride);
    return PromptPreviewUtility.inspect(result, variables);
  }
}
