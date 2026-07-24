import type { RevisionDiff } from "@/types/copilot";

export class DiffEngine {
  /**
   * Generates a structural diff between the original JSON node and the revised AI output.
   * Useful for UI highlighting (Accept/Reject workflows).
   */
  public static generate(original: any, revised: any): RevisionDiff {
    const changes: RevisionDiff["changes"] = [];
    
    this.compareNodes(original, revised, "", changes);
    
    return {
      original,
      revised,
      changes
    };
  }

  private static compareNodes(oldNode: any, newNode: any, currentPath: string, changes: RevisionDiff["changes"]) {
    // 1. Both are primitive values
    if (typeof oldNode !== "object" && typeof newNode !== "object") {
      if (oldNode !== newNode) {
        changes.push({
          path: currentPath,
          oldValue: oldNode,
          newValue: newNode,
          type: oldNode === undefined ? "added" : newNode === undefined ? "removed" : "modified"
        });
      }
      return;
    }

    // 2. One is primitive, one is object (type mismatch)
    if (typeof oldNode !== typeof newNode || Array.isArray(oldNode) !== Array.isArray(newNode)) {
      changes.push({
        path: currentPath,
        oldValue: oldNode,
        newValue: newNode,
        type: "modified"
      });
      return;
    }

    // 3. Both are arrays
    if (Array.isArray(oldNode) && Array.isArray(newNode)) {
      const maxLen = Math.max(oldNode.length, newNode.length);
      for (let i = 0; i < maxLen; i++) {
        const itemPath = currentPath ? `${currentPath}[${i}]` : `[${i}]`;
        if (i >= oldNode.length) {
          changes.push({ path: itemPath, oldValue: undefined, newValue: newNode[i], type: "added" });
        } else if (i >= newNode.length) {
          changes.push({ path: itemPath, oldValue: oldNode[i], newValue: undefined, type: "removed" });
        } else {
          this.compareNodes(oldNode[i], newNode[i], itemPath, changes);
        }
      }
      return;
    }

    // 4. Both are objects
    if (oldNode !== null && newNode !== null) {
      const allKeys = new Set([...Object.keys(oldNode), ...Object.keys(newNode)]);
      
      for (const key of allKeys) {
        const itemPath = currentPath ? `${currentPath}.${key}` : key;
        
        if (!(key in oldNode)) {
          changes.push({ path: itemPath, oldValue: undefined, newValue: newNode[key], type: "added" });
        } else if (!(key in newNode)) {
          changes.push({ path: itemPath, oldValue: oldNode[key], newValue: undefined, type: "removed" });
        } else {
          this.compareNodes(oldNode[key], newNode[key], itemPath, changes);
        }
      }
    }
  }
}
