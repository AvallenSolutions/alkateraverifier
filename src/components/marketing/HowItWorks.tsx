import { TierBadge } from "@/components/features/TierBadge";

const STEPS = [
  {
    label: "01 — Upload",
    title: "Any LCA, any platform",
    body: "Drop in the PDF report from your platform or consultant. We read the whole study: boundaries, totals, data quality, allocation, end-of-life.",
  },
  {
    label: "02 — Choose standards",
    title: "You pick the regime",
    body: "ISO 14040/44, ISO 14067, ISO 14046, GHG Protocol, PAS 2050 and global frameworks. No silent assumptions; we report exactly what we checked.",
  },
  {
    label: "03 — Read the verdict",
    title: "A tier, with the working shown",
    body: "A certification band from Not Certified to Platinum, recomputed cross-checks of the report's own arithmetic, and a clause-by-clause findings list you can act on.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border bg-surface px-6 py-16">
      <div className="mx-auto max-w-content">
        <p className="font-mono text-label uppercase text-on-surface-subtle">
          How it works
        </p>
        <h2 className="mt-2 font-display text-h1 text-ink">
          From PDF to defensible verdict in minutes
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.label}
              className="rounded-md border border-border bg-background p-5"
            >
              <p className="font-mono text-label uppercase text-accent-strong">
                {step.label}
              </p>
              <h3 className="mt-2 text-h3 text-ink">{step.title}</h3>
              <p className="mt-2 text-body-sm text-on-surface-muted">
                {step.body}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {(["not_certified", "bronze", "silver", "gold", "platinum"] as const).map(
            (tier) => (
              <TierBadge key={tier} tier={tier} />
            ),
          )}
        </div>
        <p className="mt-4 text-center text-caption text-on-surface-subtle">
          Five bands. Hard gates on calculation integrity first; data quality
          decides how high a study can climb.
        </p>
      </div>
    </section>
  );
}
