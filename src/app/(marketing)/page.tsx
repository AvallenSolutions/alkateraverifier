import Link from "next/link";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Pricing } from "@/components/marketing/Pricing";
import { TrackedLink } from "@/components/marketing/TrackedLink";
import { Mark } from "@/components/ui/Mark";

export const metadata = {
  title: "alkatera verifier · independent LCA verification",
  description:
    "Upload any LCA, choose your standards, and get an independent, clause-by-clause verdict in minutes. Fiercely transparent: we will even fail our own reports.",
};

/** Marketing landing page (TASK-043). */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-ink text-on-ink">
        <div className="mx-auto flex min-h-[52px] w-full max-w-content items-center justify-between gap-4 px-4 py-2 sm:px-6">
          <span className="flex items-center gap-2">
            <Mark className="h-5 w-5 text-accent" />
            <span className="font-display text-[15px] lowercase leading-none">
              alka<span className="font-bold">tera</span>
            </span>
            <span className="font-mono text-label uppercase text-on-ink/60">
              verifier
            </span>
          </span>
          <nav className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="rounded-sm px-3 py-2 font-mono text-label uppercase text-on-ink/70 transition-colors duration-150 ease-studio hover:text-on-ink"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-accent px-5 py-2 font-mono text-label uppercase text-on-accent transition-colors duration-150 ease-studio hover:bg-accent-hover"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <HowItWorks />

        <section className="border-t border-border bg-surface px-6 py-16">
          <div className="mx-auto max-w-content text-center">
            <p className="font-mono text-label uppercase text-on-surface-subtle">
              Why trust it
            </p>
            <h2 className="mx-auto mt-2 max-w-2xl font-display text-h1 text-ink">
              Built by the team that knows where LCAs fail
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-body text-on-surface-muted">
              We built alka<span className="font-semibold">tera</span> to
              generate LCAs, so we encoded an expert&apos;s eye for failure:
              flattering boundaries, allocation shortcuts, biogenic confusion,
              end-of-life credits that hide the truth. The verifier checks any
              platform&apos;s report, and it is willing to fail ours. That
              honesty is the whole point.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-body-sm text-on-surface-muted">
              With the EU Green Claims Directive tightening, an unsupported
              claim is a real risk. A verified one is an asset.
            </p>
          </div>
        </section>

        <Pricing />
      </main>

      <footer className="border-t border-border bg-surface px-6 py-8">
        <div className="mx-auto flex w-full max-w-content flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-caption text-on-surface-subtle">
            Verify the claim, not just the calculation.
          </p>
          <TrackedLink
            href="https://alkatera.com"
            event="alkatera_referral_click"
            className="text-body-sm text-accent-strong underline"
          >
            Need a better LCA? alkatera builds them
          </TrackedLink>
        </div>
      </footer>
    </div>
  );
}
