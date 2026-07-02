"use client";

import { useState } from "react";

/**
 * Free → paid upgrade (TASK-036, FR-007). The free verdict stays fully
 * intact; this unlocks the downloadable report and shareable public badge.
 */
export function UpgradeCTA({ verificationId }: { verificationId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId }),
      });
      const body = await response.json();
      if (!response.ok || !body.checkoutUrl) {
        setError(
          typeof body.error === "string"
            ? body.error
            : "We could not start the payment. Try again in a moment.",
        );
        setBusy(false);
        return;
      }
      window.location.href = body.checkoutUrl;
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
      setBusy(false);
    }
  };

  return (
    <section className="rounded-md border border-border bg-surface p-5">
      <p className="font-mono text-label uppercase text-on-surface-subtle">
        Full report &amp; badge
      </p>
      <h2 className="mt-2 font-display text-h2 text-ink">
        Make this verification work for you
      </h2>
      <p className="mt-2 max-w-xl text-body-sm text-on-surface-muted">
        Your verdict above is free and complete. The paid unlock adds the
        downloadable verification report (every finding, citation and
        cross-check) and a public badge page you can share with buyers and
        auditors.
      </p>
      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-sm border-l-[3px] border-error bg-surface-sunken px-3 py-2 text-body-sm text-ink"
        >
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={startCheckout}
        disabled={busy}
        className="mt-4 rounded-full bg-accent px-8 py-3 font-mono text-label uppercase text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-40"
      >
        {busy ? "Opening checkout…" : "Unlock report & badge"}
      </button>
    </section>
  );
}
