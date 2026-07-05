/**
 * Next.js Instrumentation Hook (DEVOPS-001).
 *
 * Automatically invoked on server startup to initialize process lifecycle
 * listeners for graceful database pool shutdown and telemetry draining.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/lifecycle");
  }
}
