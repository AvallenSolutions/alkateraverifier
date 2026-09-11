import Link from "next/link";

export function Hero() {
  return (
    <section className="px-6 pb-16 pt-20 text-center">
      <p className="font-mono text-label uppercase text-on-surface-subtle">
        Verify the claim, not just the calculation
      </p>
      <h1 className="mx-auto mt-4 max-w-3xl font-display text-display text-ink">
        Independent LCA verification that shows its working.
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-body text-on-surface-muted">
        Upload any LCA, choose the standards that matter to you, and know in
        minutes whether it can back a public claim. Every grade traced to the
        exact standard and clause, in plain English.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/verify"
          className="rounded-full bg-accent px-8 py-3 font-mono text-label uppercase text-on-accent transition-colors hover:bg-accent-hover"
        >
          Verify your LCA free
        </Link>
        <Link
          href="/sign-up"
          className="rounded-full border border-border-strong bg-surface px-8 py-3 font-mono text-label uppercase text-ink transition-colors hover:bg-surface-sunken"
        >
          Create an account
        </Link>
      </div>
      <p className="mt-6 font-mono text-caption text-on-surface-subtle">
        Independent and platform-agnostic. We will even fail our own reports.
      </p>
    </section>
  );
}
