import type { IExportProvider } from "../provider.interface";
import type { SavedProject } from "@/types/project";
import type {
  ExportFormat,
  ExportScope,
  CopySectionType,
  ExportHistoryItem,
  ExportPayload,
} from "@/types/export";

const EXPORT_HISTORY_KEY = "reelforge_export_history_v1";

export class LocalExportProvider implements IExportProvider {
  async generateExport(
    project: SavedProject,
    format: ExportFormat,
    scope: ExportScope
  ): Promise<ExportPayload> {
    const cleanName = project.name.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase() || "reelforge_report";
    const timestamp = new Date().toISOString().split("T")[0];

    let content = "";
    let mimeType = "text/plain";
    let extension = "txt";

    if (format === "json") {
      content = JSON.stringify(project, null, 2);
      mimeType = "application/json";
      extension = "json";
    } else if (format === "markdown") {
      content = this.compileMarkdown(project, scope);
      mimeType = "text/markdown";
      extension = "md";
    } else if (format === "html" || format === "print" || format === "pdf") {
      content = this.compileHtml(project, scope);
      mimeType = "text/html";
      extension = "html";
    }

    const filename = `${cleanName}_${scope}_${timestamp}.${extension}`;
    const blobBytes = new Blob([content]).size;
    let formattedSize = `${blobBytes} B`;
    if (blobBytes >= 1024 * 1024) {
      formattedSize = `${(blobBytes / (1024 * 1024)).toFixed(2)} MB`;
    } else if (blobBytes >= 1024) {
      formattedSize = `${(blobBytes / 1024).toFixed(1)} KB`;
    }

    // Automatically record export telemetry
    this.recordExportHistory({
      projectId: project.id,
      projectName: project.name,
      format,
      scope,
      timestamp: new Date().toISOString(),
      fileSizeBytes: blobBytes,
      fileSizeFormatted: formattedSize,
    });

    return {
      filename,
      mimeType,
      content,
    };
  }

  async copySection(project: SavedProject, section: CopySectionType): Promise<boolean> {
    if (typeof window === "undefined" || !navigator?.clipboard) {
      return false;
    }

    let textToCopy = "";
    if (section === "summary") {
      textToCopy = this.compileMarkdown(project, "executive");
    } else if (section === "script") {
      textToCopy = this.compileMarkdown(project, "script");
    } else if (section === "repurpose") {
      textToCopy = this.compileMarkdown(project, "repurpose");
    } else {
      textToCopy = this.compileMarkdown(project, "complete");
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      return true;
    } catch {
      return false;
    }
  }

  triggerPrint(project: SavedProject): void {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("reelforge:trigger_print", { detail: { project } })
      );
      setTimeout(() => {
        window.print();
      }, 300);
    }
  }

  getExportHistory(): ExportHistoryItem[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(EXPORT_HISTORY_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as ExportHistoryItem[];
    } catch {
      return [];
    }
  }

  recordExportHistory(item: Omit<ExportHistoryItem, "id">): ExportHistoryItem {
    const history = this.getExportHistory();
    const newItem: ExportHistoryItem = {
      ...item,
      id: "exp_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
    };

    const updated = [newItem, ...history].slice(0, 100);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(updated));
      } catch {
        // Quota exceeded or restricted
      }
    }
    return newItem;
  }

  clearExportHistory(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(EXPORT_HISTORY_KEY);
    }
  }

  deleteHistoryItem(id: string): void {
    const history = this.getExportHistory();
    const filtered = history.filter((h) => h.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(filtered));
    }
  }

  // ─── Private Compilers ──────────────────────────────────────────────────

  private compileMarkdown(project: SavedProject, scope: ExportScope): string {
    const state = project.state;
    const lines: string[] = [];

    lines.push(`# ${project.name} — ReelForge AI Report`);
    lines.push(`**Generated:** ${new Date().toLocaleDateString()} | **Version:** ${project.version}`);
    lines.push(`**Target Profile URL:** ${project.instagramUrl}`);
    lines.push(`---`);

    if (scope === "executive" || scope === "complete") {
      if (state.profile) {
        lines.push(`## 1. Executive Snapshot (@${state.profile.username})`);
        lines.push(`- **Followers:** ${state.profile.follower_count.toLocaleString()}`);
        lines.push(`- **Category:** ${state.profile.category || "General"}`);
        lines.push(`- **Bio:** ${state.profile.bio || "N/A"}`);
        lines.push("");
      }

      if (state.brandReport) {
        lines.push(`## 2. Brand Intelligence`);
        lines.push(`- **Industry:** ${state.brandReport.industry}`);
        lines.push(`- **Brand Type:** ${state.brandReport.brandType}`);
        lines.push(`- **Target Audience:** ${state.brandReport.targetAudience}`);
        lines.push(`- **Brand Tone:** ${state.brandReport.brandTone}`);
        lines.push(`- **Content Pillars:** ${state.brandReport.primaryContentPillars.join(", ")}`);
        lines.push("");
      }

      if (state.contentDNA) {
        lines.push(`## 3. Content DNA Blueprint`);
        lines.push(`- **Overall DNA Score:** ${state.contentDNA.snapshot.overallDNAScore}/100`);
        lines.push(`- **Dominant Hook:** ${state.contentDNA.snapshot.dominantHook}`);
        lines.push(`- **Winning Formula:** ${state.contentDNA.winningStructure.formulaString || state.contentDNA.blueprintExport.formulaSteps.join(" → ")}`);
        lines.push("");
      }
    }

    if (scope === "script" || scope === "complete") {
      if (state.scriptPackage) {
        lines.push(`## 4. Studio Reel Script Package`);
        lines.push(`### Hook Option`);
        lines.push(`> "${state.scriptPackage.hook.firstSentence}"`);
        lines.push("");
        lines.push(`### Scene Breakdown`);
        state.scriptPackage.scenes.forEach((scene) => {
          lines.push(`**Scene ${scene.sceneNumber} (${scene.duration}):**`);
          lines.push(`- **Visual:** ${scene.visual}`);
          lines.push(`- **Audio:** "${scene.voiceover}"`);
          lines.push(`- **Text Overlay:** ${scene.textOverlay}`);
          lines.push("");
        });
        lines.push(`### Suggested Caption`);
        lines.push(`${state.scriptPackage.caption.fullCaption}`);
        lines.push(`\n**Hashtags:** ${state.scriptPackage.hashtags.allTagsString}`);
        lines.push("");
      }
    }

    if (scope === "repurpose" || scope === "complete") {
      if (state.repurposePackage) {
        lines.push(`## 5. Multi-Platform Repurpose Package`);
        lines.push(`### LinkedIn Professional Post`);
        lines.push(`${state.repurposePackage.linkedIn.longFormPost}`);
        lines.push("");
        lines.push(`### X (Twitter) Thread`);
        state.repurposePackage.x.thread.forEach((t) => {
          lines.push(`${t.tweetNumber}/ ${t.content}`);
        });
        lines.push("");
        lines.push(`### YouTube Shorts`);
        lines.push(`**Title:** ${state.repurposePackage.youtubeShorts.title}`);
        lines.push(`**Description:** ${state.repurposePackage.youtubeShorts.description}`);
        lines.push("");
      }
    }

    lines.push(`---`);
    lines.push(`*Generated deterministically by ReelForge AI v1.2*`);
    return lines.join("\n");
  }

  private compileHtml(project: SavedProject, scope: ExportScope): string {
    const md = this.compileMarkdown(project, scope);
    // Convert basic sections to clean HTML document
    const formattedHtml = md
      .replace(/^# (.*$)/gim, '<h1 class="title">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="section">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="subsection">$1</h3>')
      .replace(/^\*\*([^*]+)\*\*: (.*$)/gim, '<p><strong>$1:</strong> $2</p>')
      .replace(/^- \*\*([^*]+)\*\*: (.*$)/gim, '<li><strong>$1:</strong> $2</li>')
      .replace(/^> "(.*)"/gim, '<blockquote class="hook">"$1"</blockquote>')
      .replace(/\n\n/g, '<div class="spacer"></div>');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name} — ReelForge AI Report</title>
  <style>
    :root {
      --bg: #09090b;
      --card: #18181b;
      --text: #f4f4f5;
      --muted: #a1a1aa;
      --accent: #8b5cf6;
      --border: #27272a;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 40px 20px;
      max-width: 860px;
      margin: 0 auto;
    }
    .container {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    h1.title { color: #fff; font-size: 28px; border-bottom: 2px solid var(--accent); padding-bottom: 12px; }
    h2.section { color: var(--accent); font-size: 20px; margin-top: 30px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
    h3.subsection { color: #e4e4e7; font-size: 16px; margin-top: 20px; }
    p, li { font-size: 14px; color: #d4d4d8; }
    blockquote.hook {
      background: rgba(139, 92, 246, 0.1);
      border-left: 4px solid var(--accent);
      padding: 16px;
      border-radius: 8px;
      font-weight: 600;
      color: #fff;
    }
    .spacer { height: 16px; }
    @media print {
      body { background: #fff; color: #000; padding: 0; }
      .container { background: #fff; border: none; box-shadow: none; padding: 0; color: #000; }
      h1.title, h2.section { color: #000; border-color: #ccc; }
      p, li, h3.subsection { color: #222; }
      blockquote.hook { background: #f5f5f5; color: #000; border-color: #000; }
    }
  </style>
</head>
<body>
  <div class="container">
    ${formattedHtml}
  </div>
</body>
</html>`;
  }
}
