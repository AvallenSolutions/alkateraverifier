"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Toast, useToast } from "@/components/ui/Toast";

/** Re-enqueues a failed verification (the worker re-claims failed rows). */
export function RetryButton({ verificationId }: { verificationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const { toastMessage, showToast, dismiss } = useToast();

  const retry = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/verify/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        showToast(
          typeof body?.error === "string"
            ? body.error
            : "We could not restart the verification. Try again in a moment.",
        );
        return;
      }
      router.refresh();
    } catch {
      showToast(
        "We could not reach the server. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={retry}
        disabled={busy}
        className="rounded-full bg-accent px-5 py-2.5 font-mono text-label uppercase text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-40"
      >
        {busy ? "Retrying…" : "Retry verification"}
      </button>
      <Toast message={toastMessage} onDismiss={dismiss} />
    </>
  );
}
