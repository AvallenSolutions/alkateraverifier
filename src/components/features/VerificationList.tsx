import Link from "next/link";
import { TierBadge } from "./TierBadge";
import { buttonClasses } from "@/components/ui/button";
import type { VerificationSummary } from "@/types/verification";

const STATUS_LABELS: Record<string, string> = {
  pending: "Queued",
  extracting: "Extracting",
  evaluating: "Evaluating",
  failed: "Failed",
};

/**
 * Dashboard history (docs/design.md § fact-row): bold subject, mono meta,
 * hairline separators, and a typographic tier or state to the right.
 */
export function VerificationList({ items }: { items: VerificationSummary[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-border bg-surface p-5">
        <p className="text-body text-on-surface-muted">
          No verifications yet. Upload your first LCA to see how it holds up.
        </p>
        <Link href="/verify" className={`${buttonClasses("accent")} mt-4`}>
          Verify an LCA
        </Link>
      </div>
    );
  }

  return (
    <ul className="border-t border-border">
      {items.map((item) => (
        <li key={item.id} className="border-b border-border">
          <Link
            href={`/verify/${item.id}`}
            className="flex flex-wrap items-center justify-between gap-3 px-1 py-4 transition-colors duration-150 ease-studio hover:bg-surface"
          >
            <span className="min-w-0">
              <span className="block truncate font-display text-card-title text-ink">
                {item.product_name ?? "Untitled LCA"}
              </span>
              <span className="mt-1 block font-mono text-meta text-on-surface-subtle">
                {new Date(item.created_at).toLocaleDateString("en-GB")}
                {item.score !== null ? (
                  <>
                    {" · "}
                    <span className="tabular">Score {item.score}/100</span>
                  </>
                ) : (
                  ""
                )}
                {item.is_paid ? " · Paid" : ""}
              </span>
            </span>
            <span className="shrink-0">
              {item.status === "complete" && item.tier ? (
                <TierBadge tier={item.tier} size="sm" />
              ) : (
                <span className="font-mono text-label uppercase text-on-surface-muted">
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
