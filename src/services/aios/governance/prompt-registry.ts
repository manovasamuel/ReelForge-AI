import fs from 'fs';
import path from 'path';

/**
 * AIOS Prompt Registry
 *
 * Treats prompts as versioned code assets.
 * MVP: Loads prompts from the local file system (src/prompts/).
 * 
 * Each prompt file is expected to have YAML-like frontmatter.
 */

export interface PromptMetadata {
  name: string;
  version: number;
  author: string;
  created: string;
  tags: string[];
  status: 'active' | 'archived' | 'testing';
}

export interface PromptTemplate {
  metadata: PromptMetadata;
  content: string; // The raw prompt text (without frontmatter)
}

export class PromptRegistry {
  private static instance: PromptRegistry;
  
  // Base directory for prompts
  private readonly PROMPT_DIR = path.join(process.cwd(), 'src', 'prompts');

  static getInstance(): PromptRegistry {
    if (!PromptRegistry.instance) {
      PromptRegistry.instance = new PromptRegistry();
    }
    return PromptRegistry.instance;
  }

  /**
   * Retrieves a prompt template by name and optional version.
   * If version is omitted, it defaults to the highest 'active' version.
   */
  getPrompt(name: string, version?: number): PromptTemplate {
    const agentDir = path.join(this.PROMPT_DIR, name);
    
    if (!fs.existsSync(agentDir)) {
      throw new Error(`[PromptRegistry] Prompt directory not found for: ${name}`);
    }

    let targetFile = '';

    if (version !== undefined) {
      targetFile = path.join(agentDir, `v${version}.md`);
      if (!fs.existsSync(targetFile)) {
        throw new Error(`[PromptRegistry] Prompt version v${version} not found for: ${name}`);
      }
    } else {
      // Find highest active version
      const files = fs.readdirSync(agentDir).filter(f => f.endsWith('.md'));
      let highestActiveVersion = -1;
      let highestActiveFile = '';

      for (const file of files) {
        const filePath = path.join(agentDir, file);
        const parsed = this.parsePromptFile(filePath);
        if (parsed.metadata.status === 'active' && parsed.metadata.version > highestActiveVersion) {
          highestActiveVersion = parsed.metadata.version;
          highestActiveFile = filePath;
        }
      }

      if (!highestActiveFile) {
        throw new Error(`[PromptRegistry] No active prompt versions found for: ${name}`);
      }
      targetFile = highestActiveFile;
    }

    return this.parsePromptFile(targetFile);
  }

  /**
   * Simple parser for markdown files with YAML-style frontmatter.
   */
  private parsePromptFile(filePath: string): PromptTemplate {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Very simple frontmatter regex: --- \n key: value \n ---
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = fileContent.match(frontmatterRegex);

    if (!match) {
      throw new Error(`[PromptRegistry] Invalid format in prompt file: ${filePath}. Missing frontmatter.`);
    }

    const frontmatterStr = match[1];
    const content = match[2].trim();

    const metadata: Partial<PromptMetadata> = {};
    const lines = frontmatterStr.split('\n');
    let currentKey = '';

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      if (line.includes(':')) {
        const parts = line.split(':');
        const key = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        
        currentKey = key;
        
        if (value) {
           (metadata as any)[key] = this.parseValue(key, value);
        } else if (key === 'tags') {
           metadata.tags = [];
        }
      } else if (currentKey === 'tags' && line.startsWith('-')) {
        metadata.tags!.push(line.substring(1).trim());
      }
    }

    return {
      metadata: metadata as PromptMetadata,
      content
    };
  }

  private parseValue(key: string, value: string): any {
    if (key === 'version') return parseInt(value, 10);
    return value;
  }
}

export const promptRegistry = PromptRegistry.getInstance();
