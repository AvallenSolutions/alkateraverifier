import { z } from "zod";

/**
 * Environment variable validation (PRD § Stack Integration Guide).
 *
 * Validated once at server startup via src/instrumentation.ts so a
 * misconfigured deployment fails immediately with a readable error,
 * not deep inside a request.
 *
 * Variables for integrations that land in later phases are optional here;
 * tighten each one to required when its integration is wired in
 * (see the phase notes below and in .env.example).
 */

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  // Phase 3 (TASK-033): make required when Stripe is configured.
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  // Phase 2 (TASK-032): make required when PostHog is wired.
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.url().optional(),
  // Phase 0 (TASK-011): client-side Sentry (DSNs are not secrets).
  NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
});

const serverSchema = clientSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  // Phase 0 (TASK-011): make required when Sentry is initialised.
  SENTRY_DSN: z.url().optional(),
  // Phase 1 (TASK-016): make required when Claude extraction is wired.
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  // Phase 3 (TASK-033/034/035): make required when payments land.
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  // Phase 3 (TASK-039): make required when report emails land.
  RESEND_API_KEY: z.string().min(1).optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

// NEXT_PUBLIC_* values are inlined into the client bundle only when
// referenced as literal `process.env.X` expressions, so this map must
// enumerate every variable explicitly.
const runtimeEnv = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SENTRY_DSN: process.env.SENTRY_DSN,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
};

function parseEnv(): ServerEnv {
  // Escape hatch for CI builds that run without secrets.
  if (process.env.SKIP_ENV_VALIDATION) {
    return runtimeEnv as ServerEnv;
  }

  const isServer = typeof window === "undefined";
  const result = (isServer ? serverSchema : clientSchema).safeParse(runtimeEnv);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid or missing environment variables:\n${issues}\n\n` +
        "Copy .env.example to .env.local and fill in the values.",
    );
  }

  // On the client only the client schema is parsed; server-only keys are
  // simply absent there, which the ServerEnv type cannot express.
  return result.data as ServerEnv;
}

export const env = parseEnv();

/**
 * Fetch an optional (later-phase) variable and fail loudly at the point of
 * use if it has not been configured yet.
 */
export function requireEnv<K extends keyof ServerEnv>(
  key: K,
): NonNullable<ServerEnv[K]> {
  const value = env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${key}. ` +
        "Add it to .env.local (see .env.example) and restart.",
    );
  }
  return value;
}
