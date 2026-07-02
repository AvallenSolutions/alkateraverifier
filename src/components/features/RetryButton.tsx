"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Re-enqueues a failed verification (the worker re-claims failed rows). */
export function RetryButton({ verificationId }: { verificationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const retry = async () => {
    setBusy(true);
    try {
      await fetch("/api/verify/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={retry}
      disabled={busy}
      className="rounded-full bg-accent px-5 py-2.5 font-mono text-label uppercase text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-40"
    >
      {busy ? "Retrying…" : "Retry verification"}
    </button>
  );
}
