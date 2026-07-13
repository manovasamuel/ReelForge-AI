/**
 * Prompt Variable Resolver — ReelForge AI v2.1 Phase 7.3.
 *
 * Advanced variable resolution system supporting:
 *   - Optional variables (resolved to empty string when missing)
 *   - Default values (e.g. {{industry|General Business}})
 *   - Nested variables (e.g. {{brand.name}}, {{audience.demographics}})
 *   - Arrays & Loops (e.g. {{#each contentPillars}} - {{this}} {{/each}} or automatic comma joining)
 *   - Conditional sections (e.g. {{#if targetAudience}}...{{/if}} and {{#unless targetAudience}}...{{/unless}})
 *
 * Guarantees that zero unresolved template placeholders ({{...}}) remain in the compiled output.
 */
export class PromptVariableResolver {
  /**
   * Resolves all block tags and inline variables within a template string.
   */
  public static resolve(
    template: string,
    variables: Record<string, any>,
    requiredVariables: string[] = []
  ): string {
    let output = template;

    // 1. Process Conditional Blocks: {{#if varPath}}...{{/if}} and {{#unless varPath}}...{{/unless}}
    // We run iteratively to handle nested conditionals or sequential blocks.
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 10) {
      changed = false;
      iterations++;

      // {{#if varPath}}content{{/if}}
      output = output.replace(
        /\{\{#if\s+([a-zA-Z0-9_.]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
        (_match, varPath, content) => {
          changed = true;
          const val = PromptVariableResolver.getVariableValue(varPath, variables);
          return PromptVariableResolver.isTruthy(val) ? content : "";
        }
      );

      // {{#unless varPath}}content{{/unless}}
      output = output.replace(
        /\{\{#unless\s+([a-zA-Z0-9_.]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g,
        (_match, varPath, content) => {
          changed = true;
          const val = PromptVariableResolver.getVariableValue(varPath, variables);
          return !PromptVariableResolver.isTruthy(val) ? content : "";
        }
      );
    }

    // 2. Process Array Iteration: {{#each varPath}}content{{/each}}
    output = output.replace(
      /\{\{#each\s+([a-zA-Z0-9_.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (_match, varPath, content) => {
        const val = PromptVariableResolver.getVariableValue(varPath, variables);
        if (Array.isArray(val) && val.length > 0) {
          return val
            .map((item) => {
              if (typeof item === "object" && item !== null) {
                // If array item is an object, resolve {{this.prop}}
                return PromptVariableResolver.resolve(content, { ...variables, this: item });
              } else {
                // If primitive, replace {{this}}
                return content.replace(/\{\{\s*this\s*\}\}/g, String(item));
              }
            })
            .join("\n");
        }
        return "";
      }
    );

    // 3. Process Inline Variables with optional default values: {{varPath|defaultValue}}
    output = output.replace(
      /\{\{\s*([a-zA-Z0-9_.]+)(?:\|([^}]+))?\s*\}\}/g,
      (_match, varPath, defaultValue) => {
        const val = PromptVariableResolver.getVariableValue(varPath, variables);

        if (val !== undefined && val !== null && val !== "") {
          if (Array.isArray(val)) {
            return val.join(", ");
          }
          if (typeof val === "object") {
            return JSON.stringify(val);
          }
          return String(val);
        }

        // Variable is missing or empty
        if (defaultValue !== undefined) {
          return defaultValue.trim();
        }

        // Check if variable is required or optional
        const isRequired = requiredVariables.includes(varPath);
        if (isRequired) {
          return `[${varPath.toUpperCase()}_NOT_SPECIFIED]`;
        } else {
          // Optional variable without default resolves to empty string
          return "";
        }
      }
    );

    // 4. Final safety sweep: strip any accidental remaining unresolved tags to guarantee clean output
    output = output.replace(/\{\{\s*[^}]+\s*\}\}/g, "");

    return output.trim();
  }

  /**
   * Retrieves a variable value using dot notation (e.g. "brand.name" -> variables.brand.name).
   */
  public static getVariableValue(varPath: string, variables: Record<string, any>): any {
    if (!varPath || !variables) return undefined;
    if (varPath in variables) return variables[varPath];

    const parts = varPath.split(".");
    let current: any = variables;
    for (const part of parts) {
      if (current === undefined || current === null || typeof current !== "object") {
        return undefined;
      }
      current = current[part];
    }
    return current;
  }

  /**
   * Determines if a variable value should be considered truthy for conditional sections.
   */
  private static isTruthy(val: any): boolean {
    if (val === undefined || val === null || val === false || val === "") return false;
    if (Array.isArray(val) && val.length === 0) return false;
    if (typeof val === "object" && Object.keys(val).length === 0) return false;
    return true;
  }
}
