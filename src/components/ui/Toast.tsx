"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Minimal transient notice (TASK-046). Local state, aria-live, self-dismissing;
 * use for failures that have no natural inline home.
 */
export function useToast(autoHideMs = 6000) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), autoHideMs);
    return () => clearTimeout(timer);
  }, [message, autoHideMs]);

  const showToast = useCallback((text: string) => setMessage(text), []);
  const dismiss = useCallback(() => setMessage(null), []);

  return { toastMessage: message, showToast, dismiss };
}

export function Toast({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-3rem)] max-w-md -translate-x-1/2 items-start justify-between gap-3 rounded-md border border-border border-l-[3px] border-l-error bg-surface px-4 py-3 shadow-float"
    >
      <p className="text-body-sm text-ink">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="font-mono text-label uppercase text-on-surface-subtle hover:text-ink"
      >
        ✕
      </button>
    </div>
  );
}
