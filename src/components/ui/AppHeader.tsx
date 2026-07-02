"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/supabase/auth";

const NAV_ITEMS = [
  { href: "/verify", label: "Verify" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Settings" },
];

export function AppHeader({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-content flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <Link
          href="/dashboard"
          className="font-mono text-label uppercase text-ink"
        >
          alka<span className="font-semibold">tera</span> LCA Verifier
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "rounded-sm bg-accent-subtle px-3 py-2 text-body-sm text-accent-strong"
                    : "rounded-sm px-3 py-2 text-body-sm text-on-surface-muted hover:text-ink"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span
            className="hidden text-caption text-on-surface-subtle sm:inline"
            title={userEmail}
          >
            {userEmail}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-border-strong bg-surface px-4 py-2 font-mono text-label uppercase text-ink transition-colors hover:bg-surface-sunken"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
