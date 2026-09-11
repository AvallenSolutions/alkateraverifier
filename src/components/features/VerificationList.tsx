import Link from "next/link";
import { TierBadge } from "./TierBadge";
import type { VerificationSummary } from "@/types/verification";

const STATUS_LABELS: Record<string, string> = {
  pending: "Queued",
  extracting: "Extracting",
  evaluating: "Evaluating",
  failed: "Failed",
};

/** Dashboard history rows (TASK-041, FR-009): product, date, tier, paid. */
export function VerificationList({
  items,
}: {
  items: VerificationSummary[];
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-border bg-surface p-5">
        <p className="text-body text-on-surface-muted">
          No verifications yet. Upload your first LCA to see how it holds up.
        </p>
        <Link
          href="/verify"
          className="mt-4 inline-block rounded-full bg-accent px-6 py-2.5 font-mono text-label uppercase text-on-accent transition-colors hover:bg-accent-hover"
        >
          Verify an LCA
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`/verify/${item.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface p-4 transition-colors hover:bg-surface-sunken"
          >
            <span className="min-w-0">
              <span className="block truncate text-body font-medium text-ink">
                {item.product_name ?? "Untitled LCA"}
              </span>
              <span className="mt-0.5 block font-mono text-caption text-on-surface-subtle">
                {new Date(item.created_at).toLocaleDateString("en-GB")}
                {item.score !== null ? ` · Score ${item.score}/100` : ""}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              {item.is_paid ? (
                <span className="rounded-full border border-border-strong px-3 py-1 font-mono text-label uppercase text-on-surface-muted">
                  Paid
                </span>
              ) : null}
              {item.status === "complete" && item.tier ? (
                <TierBadge tier={item.tier} />
              ) : (
                <span className="rounded-full bg-surface-sunken px-3 py-1 font-mono text-label uppercase text-on-surface-muted">
                  {STATUS_LABELS[item.status] ?? item.status}
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
