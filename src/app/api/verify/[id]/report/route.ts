import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateReportPdf } from "@/lib/report/generate";
import type { LcaExtraction } from "@/types/lca";

/**
 * GET /api/verify/[id]/report — the paid, downloadable verification
 * report (TASK-037, FR-007/008). Owner-only via RLS; requires is_paid.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { data: verification } = await supabase
    .from("verifications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!verification) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (verification.status !== "complete") {
    return NextResponse.json(
      { error: "This verification has not finished yet." },
      { status: 400 },
    );
  }
  if (!verification.is_paid) {
    return NextResponse.json(
      { error: "The full report is part of the paid unlock." },
      { status: 403 },
    );
  }

  const [{ data: findings }, { data: checks }] = await Promise.all([
    supabase
      .from("findings")
      .select("*, standards(name)")
      .eq("verification_id", id)
      .order("clause_ref"),
    supabase.from("calculation_checks").select("*").eq("verification_id", id),
  ]);

  const extraction = verification.extraction as LcaExtraction | null;

  const pdf = await generateReportPdf({
    verificationId: verification.id,
    productName: verification.product_name,
    sourcePlatform: verification.source_platform,
    tier: verification.tier ?? "not_certified",
    score: verification.score,
    completedAt: verification.completed_at,
    extractionConfidence: verification.extraction_confidence,
    gates: verification.gates ?? [],
    criticalReviewConducted: extraction?.criticalReview.conducted ?? null,
    findings: (findings ?? []).map((row) => ({
      standardName: row.standards?.name ?? "Standard",
      clauseRef: row.clause_ref,
      result: row.result,
      plainSummary: row.plain_summary,
      reasoning: row.reasoning,
      recommendation: row.recommendation,
    })),
    calculationChecks: (checks ?? []).map((row) => ({
      checkName: row.check_name,
      reportedValue: row.reported_value,
      recomputedValue: row.recomputed_value,
      unit: row.unit,
      passed: row.passed,
      toleranceNote: row.tolerance_note,
    })),
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="verification-report-${verification.id}.pdf"`,
    },
  });
}
