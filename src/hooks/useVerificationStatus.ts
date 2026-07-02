"use client";

import { useEffect, useState } from "react";
import type { Tier, VerificationStatus } from "@/types/verification";

export interface VerificationStatusSnapshot {
  status: VerificationStatus;
  tier: Tier | null;
  score: number | null;
  extractionConfidence: number | null;
}

const ACTIVE_STATUSES: VerificationStatus[] = [
  "pending",
  "extracting",
  "evaluating",
];

const POLL_INTERVAL_MS = 2500;

/**
 * Poll /api/verify/status while a verification is being processed
 * (FR-010: pending → extracting → evaluating → complete/failed).
 * Polling stops automatically on a terminal status.
 */
export function useVerificationStatus(
  id: string,
  initial: VerificationStatusSnapshot,
) {
  const [snapshot, setSnapshot] = useState<VerificationStatusSnapshot>(initial);
  const [pollError, setPollError] = useState<string | null>(null);

  // Re-runs on every status change; no interval once the status is terminal.
  useEffect(() => {
    if (!ACTIVE_STATUSES.includes(snapshot.status)) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const response = await fetch(
          `/api/verify/status?id=${encodeURIComponent(id)}`,
        );
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        const body = await response.json();
        if (cancelled) return;
        setPollError(null);
        setSnapshot({
          status: body.status,
          tier: body.tier ?? null,
          score: body.score ?? null,
          extractionConfidence: body.extractionConfidence ?? null,
        });
      } catch {
        if (!cancelled) {
          setPollError("We lost contact with the server. Still trying…");
        }
      }
    };

    const interval = setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id, snapshot.status]);

  return { ...snapshot, pollError };
}
