import { NextResponse } from "next/server";
import { getPublicBadgeData } from "@/lib/report/badge-data";

/** GET /api/badge/[slug] — public badge data (TASK-038, PRD § API). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const badge = await getPublicBadgeData(slug);

  if (!badge) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    tier: badge.tier,
    productName: badge.productName,
    issuedAt: badge.issuedAt,
    findingsSummary: badge.findingsSummary,
  });
}
