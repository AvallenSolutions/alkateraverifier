"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/supabase/auth";
import { Mark } from "@/components/ui/Mark";

/**
 * The top band (docs/design.md § anatomy): sticky, ink, 52px. Wordmark +
 * mark, the Verifier's surfaces as mono tabs (active carries a 3px accent
 * underline), and a live mono note on the right. No desk-link back into
 * alkatera·OS — the independence signal.
 */
const TABS = [
  { href: "/verify", label: "Verify" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Settings" },
];

export function RoomBand({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-ink text-on-ink">
      <div className="mx-auto flex min-h-[52px] w-full max-w-content flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-on-ink"
            aria-label="alkatera verifier"
          >
            <Mark className="h-5 w-5 text-accent" />
            <span className="font-display text-[15px] lowercase leading-none">
              alka<span className="font-bold">tera</span>
            </span>
            <span className="font-mono text-label uppercase text-on-ink/60">
              verifier
            </span>
          </Link>

          <nav aria-label="Main" className="flex items-center gap-1">
            {TABS.map((tab) => {
              const active =
                pathname === tab.href || pathname.startsWith(`${tab.href}/`);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`border-b-[3px] px-2 py-2 font-mono text-label uppercase transition-colors duration-150 ease-studio ${
                    active
                      ? "border-accent text-on-ink"
                      : "border-transparent text-on-ink/55 hover:text-on-ink"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="hidden font-mono text-meta text-on-ink/55 sm:inline"
            title={userEmail}
          >
            {userEmail}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-on-ink/25 px-4 py-1.5 font-mono text-label uppercase text-on-ink/80 transition-colors duration-150 ease-studio hover:border-on-ink/50 hover:text-on-ink"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
