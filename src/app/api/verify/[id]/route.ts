import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/verify/[id] — full verification data (TASK-031).
 * Owner-only: RLS on the user-context client hides other users' rows, so
 * a foreign id is indistinguishable from a missing one (404). The
 * public-if-badged variant lands with badges in Phase 3.
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

  const [{ data: findings }, { data: checks }] = await Promise.all([
    supabase
      .from("findings")
      .select("*, standards(name, code)")
      .eq("verification_id", id)
      .order("clause_ref"),
    supabase.from("calculation_checks").select("*").eq("verification_id", id),
  ]);

  return NextResponse.json({
    id: verification.id,
    productName: verification.product_name,
    status: verification.status,
    tier: verification.tier,
    score: verification.score,
    extractionConfidence: verification.extraction_confidence,
    isPaid: verification.is_paid,
    gates: verification.gates,
    failureReason: verification.failure_reason,
    findings: (findings ?? []).map((row) => ({
      id: row.id,
      standardCode: row.standards?.code ?? null,
      standardName: row.standards?.name ?? null,
      clauseRef: row.clause_ref,
      result: row.result,
      plainSummary: row.plain_summary,
      reasoning: row.reasoning,
      recommendation: row.recommendation,
    })),
    calculationChecks: (checks ?? []).map((row) => ({
      id: row.id,
      checkName: row.check_name,
      reportedValue: row.reported_value,
      recomputedValue: row.recomputed_value,
      unit: row.unit,
      passed: row.passed,
      toleranceNote: row.tolerance_note,
    })),
  });
}
