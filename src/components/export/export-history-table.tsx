"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Trash2, FileText, Calendar } from "lucide-react";
import type { ExportHistoryItem } from "@/types/export";
import { ExportService } from "@/services/export";
import { showToast } from "@/components/ui/toast";

interface ExportHistoryTableProps {
  refreshToken?: number;
}

export function ExportHistoryTable({ refreshToken = 0 }: ExportHistoryTableProps) {
  const [history, setHistory] = useState<ExportHistoryItem[]>([]);

  function loadHistory() {
    setHistory(ExportService.getHistory());
  }

  useEffect(() => {
    loadHistory();
  }, [refreshToken]);

  function handleClearAll() {
    ExportService.clearHistory();
    loadHistory();
    showToast("Audit Log Cleared", "All local export history has been cleared.");
  }

  function handleDeleteItem(id: string) {
    ExportService.deleteHistoryItem(id);
    loadHistory();
  }

  return (
    <div className="rounded-2xl border border-violet-500/30 bg-card/90 backdrop-blur-xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Local Export Audit History</h3>
            <p className="text-xs text-muted-foreground">Locally tracked log of downloaded intelligence reports</p>
          </div>
        </div>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 h-8"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear History
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-10 text-center space-y-2 border border-dashed border-border/60 rounded-xl bg-background/30">
          <FileText className="h-8 w-8 text-muted-foreground/50 mx-auto" />
          <p className="text-sm font-semibold text-foreground">No recent exports recorded</p>
          <p className="text-xs text-muted-foreground">Generated downloads and prints will appear here automatically.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground">
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Scope</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {history.map((item) => {
                const dateObj = new Date(item.timestamp);
                const dateStr = dateObj.toLocaleDateString();
                const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                return (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-white max-w-[180px] truncate">
                      {item.projectName}
                    </td>
                    <td className="py-3 px-4 capitalize text-violet-300">
                      {item.scope}
                    </td>
                    <td className="py-3 px-4 uppercase font-mono text-[11px]">
                      <Badge variant="outline" className="bg-violet-500/10 border-violet-500/30 text-violet-300">
                        {item.format}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono">
                      {item.fileSizeFormatted || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-violet-400" />
                      {dateStr} at {timeStr}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        aria-label="Delete entry"
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
