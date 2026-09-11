import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TrackOnMount } from "@/components/TrackOnMount";
import { VerificationList } from "@/components/features/VerificationList";
import type { VerificationSummary } from "@/types/verification";

export const metadata = { title: "Dashboard — alkatera LCA Verifier" };

/** Verification history (TASK-041, FR-009). */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ signup?: string }>;
}) {
  const { signup } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("verifications")
    .select("id, product_name, status, tier, score, is_paid, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const items = (data ?? []) as VerificationSummary[];

  return (
    <div>
      {signup === "1" ? <TrackOnMount event="signup" /> : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-label uppercase text-on-surface-subtle">
            Dashboard
          </p>
          <h1 className="mt-2 font-display text-h1 text-ink">
            Your verifications
          </h1>
        </div>
        {items.length > 0 ? (
          <Link
            href="/verify"
            className="rounded-full bg-accent px-6 py-2.5 font-mono text-label uppercase text-on-accent transition-colors hover:bg-accent-hover"
          >
            Verify another
          </Link>
        ) : null}
      </div>
      <div className="mt-6">
        <VerificationList items={items} />
      </div>
    </div>
  );
}
