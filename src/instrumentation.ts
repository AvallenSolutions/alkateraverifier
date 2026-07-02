import * as Sentry from "@sentry/nextjs";

export async function register() {
  // Validate environment variables at server startup (TASK-002).
  await import("./lib/env");

  // Initialise Sentry for the active runtime (TASK-011).
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
