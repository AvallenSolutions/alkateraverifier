import Link from "next/link";
import { Mark } from "@/components/ui/Mark";

/**
 * The bottom band (docs/design.md § anatomy): sticky, ink. The OS houses
 * its assistant here; the Verifier has none, so this is its standing
 * independence-and-scope strip plus the one quick action. Kept permanently
 * on screen — the independence promise, always visible.
 */
export function InkBand() {
  return (
    <footer className="sticky bottom-0 z-40 bg-ink text-on-ink">
      <div className="mx-auto flex w-full max-w-content items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          <Mark className="h-4 w-4 shrink-0 text-accent" />
          <p className="font-mono text-meta text-on-ink/60">
            <span className="text-on-ink/80">Independent.</span>
            <span className="hidden sm:inline">
              {" "}
              We verify any LCA, and we fail our own · every finding cites its
              clause.
            </span>
          </p>
        </div>
        <Link
          href="/verify"
          className="shrink-0 rounded-full bg-accent px-4 py-1.5 font-mono text-label uppercase text-on-accent transition-colors duration-150 ease-studio hover:bg-accent-hover"
        >
          Verify an LCA
        </Link>
      </div>
    </footer>
  );
}
