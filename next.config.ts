import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default withSentryConfig(nextConfig, {
  // Source-map upload runs only when SENTRY_AUTH_TOKEN / org / project are
  // configured (e.g. in Vercel); otherwise the build proceeds without it.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  disableLogger: true,
});
