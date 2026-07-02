// Client-side Sentry init. @sentry/nextjs v10 uses instrumentation-client.ts
// (the sentry.client.config.ts convention named in the roadmap is deprecated).
import * as Sentry from "@sentry/nextjs";
import { scrubBreadcrumb, scrubEvent } from "@/lib/sentry-scrub";

Sentry.init({
  // DSNs are not secrets; the client needs a NEXT_PUBLIC-prefixed variable.
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  beforeSend: scrubEvent,
  beforeBreadcrumb: scrubBreadcrumb,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
