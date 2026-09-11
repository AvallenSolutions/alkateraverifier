import { NextResponse } from "next/server";

/**
 * Sliding-window rate limiting (TASK-048, PRD § Security) to control
 * abuse and runaway Claude cost.
 *
 * In-memory and therefore per-serverless-instance: a determined abuser
 * spread across instances gets proportionally more headroom. Acceptable
 * at MVP scale; swap the store for Upstash/Redis when volume justifies it.
 */

const buckets = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;
  const hits = (buckets.get(key) ?? []).filter((t) => t > cutoff);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000)),
    };
  }

  hits.push(now);
  buckets.set(key, hits);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: `You are doing that too often. Wait ${result.retryAfterSeconds} seconds and try again.`,
    },
    {
      status: 429,
      headers: { "Retry-After": String(result.retryAfterSeconds) },
    },
  );
}
