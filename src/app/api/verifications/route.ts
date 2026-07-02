import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/verifications — the user's verification history (FR-009).
 * RLS scopes results to the owner; simple limit/offset per PRD § API.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 100);
  const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);

  const { data, count, error } = await supabase
    .from("verifications")
    .select("id, product_name, status, tier, score, is_paid, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: "Could not load your verifications. Try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ items: data ?? [], total: count ?? 0 });
}
