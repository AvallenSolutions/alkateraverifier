import { createAdminClient } from "@/lib/supabase/admin";
import type { FindingResult, Tier } from "@/types/verification";

export interface PublicBadgeData {
  tier: Tier;
  productName: string | null;
  issuedAt: string;
  score: number | null;
  findingsSummary: Array<{
    standardName: string;
    clauseRef: string;
    result: FindingResult;
    plainSummary: string;
  }>;
}

/**
 * Public badge data by slug (TASK-038, FR-013). Served via the service
 * role but strictly whitelisted: tier, product, date, score, and finding
 * summaries only — no account data, no file paths, no reasoning detail.
 * Missing slug, deleted verification, or an unpaid one → null (not found).
 */
export async function getPublicBadgeData(
  slug: string,
): Promise<PublicBadgeData | null> {
  const admin = createAdminClient();

  const { data: badge } = await admin
    .from("badges")
    .select("verification_id, tier, issued_at")
    .eq("public_slug", slug)
    .maybeSingle();
  if (!badge) return null;

  const { data: verification } = await admin
    .from("verifications")
    .select("id, product_name, score, is_paid")
    .eq("id", badge.verification_id)
    .maybeSingle();
  if (!verification || !verification.is_paid) return null;

  const { data: findings } = await admin
    .from("findings")
    .select("clause_ref, result, plain_summary, standards(name)")
    .eq("verification_id", verification.id)
    .order("clause_ref");

  return {
    tier: badge.tier as Tier,
    productName: verification.product_name,
    issuedAt: badge.issued_at,
    score: verification.score,
    findingsSummary: (findings ?? []).map((row) => ({
      standardName:
        (row.standards as unknown as { name: string } | null)?.name ??
        "Standard",
      clauseRef: row.clause_ref,
      result: row.result as FindingResult,
      plainSummary: row.plain_summary,
    })),
  };
}
