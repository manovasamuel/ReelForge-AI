"use client";

import React, { useState } from "react";
import { StorageUsageDetails } from "@/types/settings";
import { Database, Trash2, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

interface StorageSectionProps {
  details: StorageUsageDetails;
  onClearWorkspace: () => boolean;
  onClearHistory: () => boolean;
  onResetEverything: () => boolean;
}

export function StorageSection({
  details,
  onClearWorkspace,
  onClearHistory,
  onResetEverything,
}: StorageSectionProps) {
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    actionType: "workspace" | "history" | "everything" | null;
  }>({
    open: false,
    title: "",
    description: "",
    actionType: null,
  });

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleTriggerModal = (type: "workspace" | "history" | "everything") => {
    if (type === "history") {
      setConfirmModal({
        open: true,
        title: "Clear Export History Log?",
        description: "This will permanently erase all audit log entries of past exported reports from localStorage. Downloaded files on your disk will remain unaffected.",
        actionType: "history",
      });
    } else if (type === "workspace") {
      setConfirmModal({
        open: true,
        title: "Clear All Workspace Projects?",
        description: "WARNING: This will delete all saved project repositories and analytical teardowns stored in your browser storage. This action cannot be undone.",
        actionType: "workspace",
      });
    } else {
      setConfirmModal({
        open: true,
        title: "Reset Entire Application Storage?",
        description: "CRITICAL WARNING: This will completely reset ReelForge AI to factory defaults. All saved projects, export logs, and user settings will be permanently wiped.",
        actionType: "everything",
      });
    }
  };

  const executeConfirmedAction = () => {
    if (confirmModal.actionType === "history") {
      const success = onClearHistory();
      if (success) showToast("Export history successfully cleared.");
    } else if (confirmModal.actionType === "workspace") {
      const success = onClearWorkspace();
      if (success) showToast("All workspace projects permanently deleted.");
    } else if (confirmModal.actionType === "everything") {
      const success = onResetEverything();
      if (success) showToast("All storage reset to factory defaults.");
    }
    setConfirmModal({ open: false, title: "", description: "", actionType: null });
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {toast && (
        <div className="p-3 bg-muted border border-border rounded-md flex items-center gap-2 text-foreground text-sm font-medium">
          <CheckCircle className="h-4 w-4" /> {toast}
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <Database className="h-5 w-5 text-foreground" /> Persistent LocalStorage Telemetry
        </h3>
        <p className="text-sm text-muted-foreground mb-4">ReelForge operates with 100% client-side privacy. Monitor exactly how much disk space your browser allocates.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-card border border-border rounded-md">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Projects</div>
            <div className="text-2xl font-black text-white mt-1">{details.totalProjects}</div>
            <div className="text-xs text-foreground mt-1">{details.projectsSizeFormatted}</div>
          </div>

          <div className="p-4 bg-card border border-border rounded-md">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Export Audit Log</div>
            <div className="text-2xl font-black text-white mt-1">{details.historyCount} entries</div>
            <div className="text-xs text-foreground mt-1">{details.historySizeFormatted}</div>
          </div>

          <div className="p-4 bg-card border border-border rounded-md">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settings Size</div>
            <div className="text-2xl font-black text-white mt-1">{details.settingsSizeFormatted}</div>
            <div className="text-xs text-muted-foreground mt-1">Config payload</div>
          </div>

          <div className="p-4 bg-muted border border-border rounded-md">
            <div className="text-xs font-semibold uppercase tracking-wider text-foreground">Total Storage Used</div>
            <div className="text-2xl font-black text-white mt-1">{details.totalSizeFormatted}</div>
            <div className="text-xs text-foreground mt-1">Of ~5 MB browser quota</div>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-1">
          <AlertTriangle className="h-5 w-5 text-red-400" /> Destructive Storage Management
        </h3>
        <p className="text-sm text-muted-foreground mb-4">These operations immediately purge data from your browser. Explicit confirmation required.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleTriggerModal("history")}
            disabled={details.historyCount === 0}
            className="p-4 rounded-md bg-card border border-border hover:border-red-500/50 hover:bg-red-950/20 text-left transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none group"
          >
            <div className="flex items-center gap-2 font-bold text-sm text-foreground group-hover:text-red-400 mb-1">
              <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-red-400" />
              Clear Export History
            </div>
            <p className="text-xs text-muted-foreground">Purges audit logs of previously downloaded reports.</p>
          </button>

          <button
            onClick={() => handleTriggerModal("workspace")}
            disabled={details.totalProjects === 0}
            className="p-4 rounded-md bg-card border border-border hover:border-red-500/50 hover:bg-red-950/20 text-left transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none group"
          >
            <div className="flex items-center gap-2 font-bold text-sm text-foreground group-hover:text-red-400 mb-1">
              <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-red-400" />
              Clear Workspace Projects
            </div>
            <p className="text-xs text-muted-foreground">Deletes all saved profile repositories ({details.totalProjects}).</p>
          </button>

          <button
            onClick={() => handleTriggerModal("everything")}
            className="p-4 rounded-md bg-red-950/30 border border-red-500/40 hover:bg-red-900/40 text-left transition-all duration-200"
          >
            <div className="flex items-center gap-2 font-bold text-sm text-red-300 mb-1">
              <RefreshCw className="h-4 w-4 text-red-400" />
              Reset Factory Storage
            </div>
            <p className="text-xs text-red-400/80">Wipes all analyses, logs, and settings completely.</p>
          </button>
        </div>
      </div>

      {/* Explicit Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 animate-fade-in">
          <div className="bg-card border border-red-500/50 rounded-md p-6 max-w-md w-full shadow-none space-y-4">
            <div className="flex items-center gap-3 text-red-400 font-bold text-lg">
              <AlertTriangle className="h-6 w-6" />
              {confirmModal.title}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{confirmModal.description}</p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setConfirmModal({ open: false, title: "", description: "", actionType: null })}
                className="px-4 py-2 rounded-md border border-border hover:bg-muted text-sm font-medium text-muted-foreground"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmedAction}
                className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white text-sm font-bold shadow-none transition-all"
              >
                Confirm & Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
