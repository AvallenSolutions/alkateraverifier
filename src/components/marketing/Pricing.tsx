import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export function Pricing() {
  return (
    <section className="border-t border-border px-6 py-16">
      <div className="mx-auto max-w-content">
        <p className="font-mono text-label uppercase text-on-surface-subtle">
          Pricing
        </p>
        <h2 className="mt-2 font-display text-h1 text-ink">
          The verdict is free. Honestly free.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-border bg-surface p-5">
            <p className="font-mono text-label uppercase text-on-surface-subtle">
              Free check
            </p>
            <p className="mt-3 font-display text-h2 text-ink">£0</p>
            <ul className="mt-4 space-y-2 text-body-sm text-on-surface-muted">
              <li>Full certification verdict, tier and score</li>
              <li>Every finding with its clause cited, in plain English</li>
              <li>Calculation cross-checks of the report&apos;s arithmetic</li>
              <li>What to fix, prioritised</li>
            </ul>
          </div>
          <div className="rounded-md border border-accent-strong bg-surface p-5">
            <p className="font-mono text-label uppercase text-accent-strong">
              Paid unlock
            </p>
            <p className="mt-3 font-display text-h2 text-ink">
              One low flat fee
            </p>
            <ul className="mt-4 space-y-2 text-body-sm text-on-surface-muted">
              <li>The full verification report as a branded PDF</li>
              <li>A public badge page you can share with buyers and auditors</li>
              <li>Per verification, no subscription</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link href="/verify" className={buttonClasses("accent", "sm:px-8")}>
            Start with the free check
          </Link>
        </div>
      </div>
    </section>
  );
}
