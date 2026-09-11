import Link from "next/link";
import { notFound } from "next/navigation";
import { TierBadge } from "@/components/features/TierBadge";
import { FindingState } from "@/components/features/StateText";
import { TrackedLink } from "@/components/marketing/TrackedLink";
import { buttonClasses } from "@/components/ui/button";
import { getPublicBadgeData } from "@/lib/report/badge-data";

export const metadata = { title: "Verified LCA · alkatera verifier" };

/**
 * Public badge page (TASK-038, FR-013): shareable proof of verification.
 * Reachable without auth; shows tier, product, date and finding summaries
 * — the working stays visible even in public, because that is the product.
 */
export default async function BadgePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const badge = await getPublicBadgeData(slug);
  if (!badge) notFound();

  const conforms = badge.findingsSummary.filter(
    (finding) => finding.result === "conforms",
  ).length;

  return (
    <main className="mx-auto w-full max-w-content flex-1 px-6 py-12">
      <p className="text-center font-mono text-label uppercase text-accent-strong">
        Independently verified LCA
      </p>
      <h1 className="mt-3 text-center font-display text-h1 text-ink">
        {badge.productName ?? "Product LCA"}
      </h1>
      <div className="mt-6 flex flex-col items-center gap-3">
        <TierBadge tier={badge.tier} size="lg" />
        <p className="font-mono text-caption text-on-surface-subtle">
          Issued {new Date(badge.issuedAt).toLocaleDateString("en-GB")} · Score{" "}
          {badge.score ?? "—"}/100 · Conforms on {conforms} of{" "}
          {badge.findingsSummary.length} clauses checked
        </p>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-h2 text-ink">What was checked</h2>
        <p className="mt-1 text-body-sm text-on-surface-muted">
          Every finding names its standard and clause. This is the summary; the
          owner holds the full report.
        </p>
        <div className="mt-4 space-y-2">
          {badge.findingsSummary.map((finding) => (
            <div
              key={`${finding.standardName}-${finding.clauseRef}`}
              className="flex items-start justify-between gap-4 rounded-sm border border-border bg-surface p-4"
            >
              <div>
                <p className="font-mono text-label uppercase text-on-surface-subtle">
                  {finding.standardName} §{finding.clauseRef}
                </p>
                <p className="mt-1.5 text-body-sm text-ink">
                  {finding.plainSummary}
                </p>
              </div>
              <span className="mt-0.5 shrink-0">
                <FindingState result={finding.result} />
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 border-t border-border pt-6 text-center">
        <p className="text-body-sm text-on-surface-muted">
          Verified by the{" "}
          <TrackedLink
            href="https://alkatera.com"
            event="alkatera_referral_click"
            className="text-accent-strong underline"
          >
            alka<span className="font-semibold">tera</span>
          </TrackedLink>{" "}
          verifier. Independent verification that shows its working. This check
          covers the clauses listed above; public comparative assertions still
          require an independent ISO 14044 §6 critical review.
        </p>
        <Link href="/sign-up" className={`${buttonClasses("accent", "sm:px-8")} mt-4`}>
          Verify your own LCA
        </Link>
      </section>
    </main>
  );
}
