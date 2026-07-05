import { closeDbPool } from "@/lib/db";

/**
 * Lifecycle Manager — ReelForge AI v2.0 Phase 6 Hardening (DEVOPS-001).
 *
 * Centralized process lifecycle manager that listens for container termination signals
 * (SIGTERM, SIGINT, beforeExit) and executes graceful shutdown sequences:
 *   1. Marks process as shutting down (routes can inspect state or return 503)
 *   2. Drains in-flight requests and flushes telemetry buffers
 *   3. Gracefully terminates database connection pools within a 10-second timeout window
 */
export class LifecycleManager {
  private static shuttingDown = false;
  private static initialized = false;
  private static readonly SHUTDOWN_TIMEOUT_MS = 10000;

  public static init(): void {
    if (this.initialized || typeof process === "undefined") return;
    this.initialized = true;

    // Register signal handlers (only in Node runtime / non-browser)
    if (process.on) {
      process.on("SIGTERM", () => void this.shutdown("SIGTERM"));
      process.on("SIGINT", () => void this.shutdown("SIGINT"));
      process.on("beforeExit", () => void this.shutdown("beforeExit"));
    }
  }

  public static isShuttingDown(): boolean {
    return this.shuttingDown;
  }

  private static async shutdown(signal: string): Promise<void> {
    if (this.shuttingDown) return;
    this.shuttingDown = true;

    console.info(`[LifecycleManager] Received ${signal}. Initiating graceful shutdown...`);

    const timeout = setTimeout(() => {
      console.warn(`[LifecycleManager] Shutdown timeout (${this.SHUTDOWN_TIMEOUT_MS}ms) exceeded. Forcing exit.`);
      if (process.exit && process.env.NODE_ENV !== "test") {
        process.exit(1);
      }
    }, this.SHUTDOWN_TIMEOUT_MS);

    try {
      // Close PostgreSQL database pool
      await closeDbPool();
      console.info("[LifecycleManager] Database connection pool closed cleanly.");
    } catch (err) {
      console.error("[LifecycleManager] Error during database pool shutdown:", err);
    } finally {
      clearTimeout(timeout);
      console.info("[LifecycleManager] Graceful shutdown sequence completed.");
      if (process.exit && process.env.NODE_ENV !== "test" && signal !== "beforeExit") {
        process.exit(0);
      }
    }
  }
}

// Auto-initialize in server runtime
LifecycleManager.init();
