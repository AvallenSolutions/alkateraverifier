"use client";

import posthog from "posthog-js";

/**
 * PostHog funnel events (TASK-032; full funnel wiring in TASK-047).
 * No-ops silently until NEXT_PUBLIC_POSTHOG_KEY is configured.
 */

let initialised = false;

function ensureInitialised(): boolean {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return false;
  if (!initialised) {
    posthog.init(key, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      capture_pageview: false,
    });
    initialised = true;
  }
  return true;
}

export function track(
  event: string,
  properties?: Record<string, string | number | boolean | null>,
): void {
  if (!ensureInitialised()) return;
  posthog.capture(event, properties);
}
