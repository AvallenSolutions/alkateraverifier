import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Banner } from "@/components/ui/Banner";
import { CalcChecksTable } from "@/components/features/CalcChecksTable";
import { FindingItem, type FindingView } from "@/components/features/FindingItem";
import { MagicMomentEvent } from "@/components/features/MagicMomentEvent";
import { RetryButton } from "@/components/features/RetryButton";
import { TierBadge } from "@/components/features/TierBadge";
import { UpgradeCTA } from "@/components/features/UpgradeCTA";
import { VerificationProgress } from "@/components/features/VerificationProgress";
import { LOW_CONFIDENCE_THRESHOLD } from "@/lib/extraction/extract";
import type { GateResult } from "@/lib/engine/score";
import type { LcaExtraction } from "@/types/lca";
import type { Tier } from "@/types/verification";
import type { VerificationStatusSnapshot } from "@/hooks/useVerificationStatus";

export const metadata = { title: "Verification — alkatera LCA Verifier" };

/**
 * Result page (TASK-029/030): the transparent verdict. Tier is never shown
 * without its gates, findings, and calculation checks; processing,
 * low-confidence, and failed states are first-class.
 */
export default async function VerificationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { id } = await params;
  const { payment } = await searchParams;
  const supabase = await createClient();

  const { data: verification } = await supabase
    .from("verifications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!verification) {
    notFound();
  }

  const heading = (
    <>
      <p className="font-mono text-label uppercase text-on-surface-subtle">
        Verification
      </p>
      <h1 className="mt-2 font-display text-h1 text-ink">
        {verification.product_name ?? "Your LCA"}
      </h1>
      <p className="mt-2 font-mono text-caption text-on-surface-subtle">
        Submitted {new Date(verification.created_at).toLocaleString("en-GB")}
        {verification.source_platform &&
        verification.source_platform !== "unknown"
          ? ` · Source: ${verification.source_platform}`
          : ""}
      </p>
    </>
  );

  // --- Failed: plain-English reason + retry (upload stays intact) ---
  if (verification.status === "failed") {
    return (
      <div>
        {heading}
        <div className="mt-6 space-y-4">
          <Banner variant="error" title="Verification failed">
            {verification.failure_reason ??
              "The verification failed unexpectedly. Your upload is safe and you can retry."}
          </Banner>
          <RetryButton verificationId={verification.id} />
        </div>
      </div>
    );
  }

  // --- Processing: live status via polling ---
  if (verification.status !== "complete") {
    const initial: VerificationStatusSnapshot = {
      status: verification.status,
      tier: verification.tier,
      score: verification.score,
      extractionConfidence: verification.extraction_confidence,
    };
    return (
      <div>
        {heading}
        <div className="mt-6">
          <VerificationProgress id={verification.id} initial={initial} />
        </div>
      </div>
    );
  }

  // --- Complete: the transparent verdict ---
  const [{ data: findingRows }, { data: checkRows }] = await Promise.all([
    supabase
      .from("findings")
      .select("*, standards(name, code)")
      .eq("verification_id", id)
      .order("clause_ref"),
    supabase
      .from("calculation_checks")
      .select("*")
      .eq("verification_id", id),
  ]);

  const findings: FindingView[] = (findingRows ?? []).map((row) => ({
    id: row.id,
    standardName: row.standards?.name ?? "Standard",
    clauseRef: row.clause_ref,
    result: row.result,
    plainSummary: row.plain_summary,
    reasoning: row.reasoning,
    recommendation: row.recommendation,
  }));

  const findingsByStandard = new Map<string, FindingView[]>();
  for (const finding of findings) {
    const group = findingsByStandard.get(finding.standardName) ?? [];
    group.push(finding);
    findingsByStandard.set(finding.standardName, group);
  }

  const checks = (checkRows ?? []).map((row) => ({
    id: row.id,
    checkName: row.check_name,
    reportedValue: row.reported_value,
    recomputedValue: row.recomputed_value,
    unit: row.unit,
    passed: row.passed,
    toleranceNote: row.tolerance_note,
  }));

  const tier = (verification.tier ?? "not_certified") as Tier;
  const gates = (verification.gates ?? []) as GateResult[];
  const failedGates = gates.filter((gate) => !gate.passed);
  const extraction = verification.extraction as LcaExtraction | null;
  const lowConfidence =
    verification.extraction_confidence !== null &&
    verification.extraction_confidence < LOW_CONFIDENCE_THRESHOLD;
  const conformsCount = findings.filter((f) => f.result === "conforms").length;

  // Badge (paid artefact); RLS allows public read of badges.
  const { data: badge } = verification.is_paid
    ? await supabase
        .from("badges")
        .select("public_slug")
        .eq("verification_id", id)
        .maybeSingle()
    : { data: null };

  return (
    <div>
      <MagicMomentEvent verificationId={verification.id} tier={tier} />
      {heading}

      {payment === "cancelled" && !verification.is_paid ? (
        <div className="mt-4">
          <Banner variant="info" title="Payment not completed">
            No payment was taken. Your free result below is untouched, and you
            can unlock the report whenever you like.
          </Banner>
        </div>
      ) : null}
      {payment === "success" && !verification.is_paid ? (
        <div className="mt-4">
          <Banner variant="info" title="Payment received">
            Thanks. We are unlocking your report and badge now; refresh in a
            few seconds if they have not appeared yet.
          </Banner>
        </div>
      ) : null}

      <section className="mt-6 rounded-md border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <TierBadge tier={tier} size="lg" />
          <p className="font-mono text-data text-on-surface-muted">
            Score{" "}
            <span className="text-h3 font-semibold text-ink">
              {verification.score ?? "—"}
            </span>
            /100
          </p>
        </div>
        <p className="mt-4 text-body text-on-surface-muted">
          Conforms on {conformsCount} of {findings.length} clauses checked
          against your selected standards. Every finding below shows its
          working.
        </p>
      </section>

      {lowConfidence ? (
        <div className="mt-4">
          <Banner variant="warning" title="Reduced reliability">
            We could not read parts of this report with confidence, so this
            verdict is less reliable than usual. Re-export the PDF from your
            LCA platform for a stronger read.
          </Banner>
        </div>
      ) : null}

      {tier === "not_certified" && failedGates.length > 0 ? (
        <div className="mt-4">
          <Banner variant="error" title="Why this is not certified">
            <ul className="list-disc space-y-1 pl-4">
              {failedGates.map((gate) => (
                <li key={gate.key}>
                  <span className="font-medium">{gate.label}:</span>{" "}
                  {gate.detail}
                </li>
              ))}
            </ul>
          </Banner>
        </div>
      ) : null}

      <section className="mt-8">
        <p className="font-mono text-label uppercase text-on-surface-subtle">
          Calculation cross-checks
        </p>
        <h2 className="mt-1 font-display text-h2 text-ink">
          We recomputed the report&apos;s own arithmetic
        </h2>
        <div className="mt-4 rounded-md border border-border bg-surface p-5">
          <CalcChecksTable checks={checks} />
        </div>
      </section>

      <section className="mt-8">
        <p className="font-mono text-label uppercase text-on-surface-subtle">
          Findings
        </p>
        <h2 className="mt-1 font-display text-h2 text-ink">
          Clause by clause, with the working shown
        </h2>
        <div className="mt-4 space-y-6">
          {[...findingsByStandard.entries()].map(([standardName, group]) => (
            <div key={standardName}>
              <h3 className="text-h3 text-ink">{standardName}</h3>
              <div className="mt-2 space-y-2">
                {group.map((finding) => (
                  <FindingItem key={finding.id} finding={finding} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8">
        {verification.is_paid ? (
          <section className="rounded-md border border-border bg-surface p-5">
            <p className="font-mono text-label uppercase text-on-surface-subtle">
              Your report &amp; badge
            </p>
            <h2 className="mt-2 font-display text-h2 text-ink">
              Unlocked and ready to share
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={`/api/verify/${verification.id}/report`}
                className="rounded-full bg-accent px-6 py-2.5 font-mono text-label uppercase text-on-accent transition-colors hover:bg-accent-hover"
              >
                Download report (PDF)
              </a>
              {badge ? (
                <a
                  href={`/badge/${badge.public_slug}`}
                  className="rounded-full border border-border-strong bg-surface px-6 py-2.5 font-mono text-label uppercase text-ink transition-colors hover:bg-surface-sunken"
                >
                  View public badge
                </a>
              ) : null}
            </div>
          </section>
        ) : (
          <UpgradeCTA verificationId={verification.id} />
        )}
      </div>

      <section className="mt-8 border-t border-border pt-5">
        <p className="text-body-sm text-on-surface-muted">
          <span className="font-mono text-label uppercase text-on-surface-subtle">
            Critical review status:{" "}
          </span>
          {extraction?.criticalReview.conducted
            ? `An independent critical review is reported (${extraction.criticalReview.reviewer ?? "reviewer not named"}).`
            : "Not conducted."}{" "}
          This automated verification checks the report against the clauses
          shown above; it does not replace an independent ISO 14044 §6
          critical review, which public comparative assertions still require.
        </p>
      </section>
    </div>
  );
}
