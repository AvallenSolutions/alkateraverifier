import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VerificationProgress } from "@/components/features/VerificationProgress";
import type { VerificationStatusSnapshot } from "@/hooks/useVerificationStatus";

export const metadata = { title: "Verification — alkatera LCA Verifier" };

/**
 * Result page, Phase 1 form: live processing status (TASK-020/022).
 * The full verdict view (tier badge, findings, calc checks) is TASK-029/030.
 */
export default async function VerificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Owner-only via RLS: other users' verifications simply don't exist here.
  const { data: verification } = await supabase
    .from("verifications")
    .select("id, product_name, status, tier, score, extraction_confidence, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!verification) {
    notFound();
  }

  const initial: VerificationStatusSnapshot = {
    status: verification.status,
    tier: verification.tier,
    score: verification.score,
    extractionConfidence: verification.extraction_confidence,
  };

  return (
    <div>
      <p className="font-mono text-label uppercase text-on-surface-subtle">
        Verification
      </p>
      <h1 className="mt-2 font-display text-h1 text-ink">
        {verification.product_name ?? "Your LCA"}
      </h1>
      <p className="mt-2 font-mono text-caption text-on-surface-subtle">
        Submitted {new Date(verification.created_at).toLocaleString("en-GB")}
      </p>
      <div className="mt-6">
        <VerificationProgress id={verification.id} initial={initial} />
      </div>
    </div>
  );
}
