"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useVerificationStatus,
  type VerificationStatusSnapshot,
} from "@/hooks/useVerificationStatus";

const STATUS_COPY: Record<string, string> = {
  pending: "Queued. Your report is waiting to be read.",
  extracting: "Reading your report and extracting the LCA data…",
  evaluating: "Checking the extracted data against your chosen standards…",
};

/**
 * Live processing view for the result page. The full verdict rendering
 * (tier badge, findings, calculation checks) lands in Phase 2 (TASK-029/030);
 * this drives the status transitions via useVerificationStatus.
 */
export function VerificationProgress({
  id,
  initial,
}: {
  id: string;
  initial: VerificationStatusSnapshot;
}) {
  const router = useRouter();
  const { status, tier, score, pollError } = useVerificationStatus(id, initial);

  // When polling sees a terminal status, re-render the server page so the
  // full verdict (or failure reason) replaces this progress view.
  useEffect(() => {
    if (
      (status === "complete" || status === "failed") &&
      initial.status !== status
    ) {
      router.refresh();
    }
  }, [status, initial.status, router]);

  if (status === "failed") {
    return (
      <div className="rounded-md border border-border bg-surface p-5">
        <p className="rounded-sm border-l-[3px] border-error bg-surface-sunken px-3 py-2 text-body text-ink">
          This verification failed. Your upload is safe; you can retry it. If
          it keeps failing, check the PDF is the full report and try
          re-exporting it.
        </p>
      </div>
    );
  }

  if (status === "complete") {
    return (
      <div className="rounded-md border border-border bg-surface p-5">
        <p className="font-mono text-label uppercase text-on-surface-subtle">
          Verification complete
        </p>
        <p className="mt-2 text-body text-ink">
          Tier: <span className="font-mono text-data">{tier ?? "—"}</span>
          {score !== null ? (
            <>
              {" "}
              · Score: <span className="font-mono text-data">{score}</span>
            </>
          ) : null}
        </p>
        <p className="mt-2 text-body-sm text-on-surface-muted">
          The full transparent verdict view arrives in the next phase of the
          build.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-surface p-5">
      <p className="font-mono text-label uppercase text-on-surface-subtle">
        Verifying
      </p>
      <div className="mt-3 flex items-center gap-3">
        <span
          aria-hidden
          className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent-strong"
        />
        <p className="text-body text-ink">
          {STATUS_COPY[status] ?? "Working…"}
        </p>
      </div>
      <p className="mt-2 text-body-sm text-on-surface-muted">
        This usually takes a couple of minutes. You can leave this page and
        come back; the verification keeps running.
      </p>
      {pollError ? (
        <p className="mt-3 text-caption text-on-surface-subtle">{pollError}</p>
      ) : null}
    </div>
  );
}
