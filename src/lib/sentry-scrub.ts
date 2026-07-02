import type { Breadcrumb, ErrorEvent } from "@sentry/nextjs";

/**
 * PII/secret scrubbing (PRD § Security): error payloads must never leak
 * tokens, API keys, uploaded content, or personal data. Shared by the
 * client, server, and edge Sentry configs.
 */

const SENSITIVE_KEY =
  /(key|token|secret|password|passwd|authorization|cookie|session|email)/i;

function scrubDeep(value: unknown, depth = 0): void {
  if (depth > 6 || value === null || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (SENSITIVE_KEY.test(key)) {
      record[key] = "[scrubbed]";
    } else {
      scrubDeep(record[key], depth + 1);
    }
  }
}

function stripQueryString(url: string): string {
  const cut = url.indexOf("?");
  return cut === -1 ? url : `${url.slice(0, cut)}?[scrubbed]`;
}

export function scrubEvent(event: ErrorEvent): ErrorEvent {
  if (event.request) {
    delete event.request.cookies;
    // Request bodies can contain uploaded LCA content — never send them.
    delete event.request.data;
    if (event.request.query_string) {
      event.request.query_string = "[scrubbed]";
    }
    if (event.request.headers) {
      for (const header of Object.keys(event.request.headers)) {
        if (SENSITIVE_KEY.test(header)) {
          delete event.request.headers[header];
        }
      }
    }
  }

  // Keep only an opaque user id — no email or IP address.
  if (event.user) {
    event.user = event.user.id ? { id: event.user.id } : {};
  }

  scrubDeep(event.extra);
  scrubDeep(event.contexts);
  return event;
}

export function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  if (typeof breadcrumb.data?.url === "string") {
    breadcrumb.data.url = stripQueryString(breadcrumb.data.url);
  }
  scrubDeep(breadcrumb.data);
  return breadcrumb;
}
