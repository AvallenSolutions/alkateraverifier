import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { handleCheckoutCompleted } from "@/lib/stripe/webhook-handlers";

/**
 * Paid-unlock fulfilment integration test (TASK-035/038): records the
 * payment, flips is_paid, issues the badge — and replaying the same
 * Stripe session changes nothing (idempotency, PRD § Edge Cases).
 * Runs against the real Supabase project; skips without env.
 */

// Opt-in only. The Supabase project is now shared with the alkatera platform,
// so these tests must never run just because keys are present in .env.local.
// Run with: RUN_INTEGRATION=1 npm test
const hasEnv =
  process.env.RUN_INTEGRATION === "1" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY;

describe.skipIf(!hasEnv)("handleCheckoutCompleted (fulfilment integration)", () => {
  const admin = hasEnv
    ? createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } },
      )
    : null!;

  const verificationId = randomUUID();
  const stripeSessionId = `cs_test_${randomUUID().replaceAll("-", "")}`;
  let userId: string;

  beforeAll(async () => {
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .limit(1)
      .single();
    userId = profile!.id;

    const { error } = await admin.from("verifications").insert({
      id: verificationId,
      user_id: userId,
      file_path: `${userId}/${verificationId}.pdf`,
      selected_standard_ids: [],
      status: "complete",
      tier: "silver",
      score: 78,
    });
    if (error) throw new Error(error.message);
  });

  afterAll(async () => {
    await admin.from("payments").delete().eq("verification_id", verificationId);
    await admin.from("verifications").delete().eq("id", verificationId);
  });

  it("fulfils once and is idempotent on replay", async () => {
    const first = await handleCheckoutCompleted({
      stripeSessionId,
      verificationId,
      amountTotal: 999,
      currency: "gbp",
      customerEmail: null, // no RESEND key — email path must not be needed
    });

    expect(first.duplicate).toBe(false);
    expect(first.badgeSlug).toBeTruthy();

    // Replay the exact same event (Stripe retries, duplicated deliveries).
    const second = await handleCheckoutCompleted({
      stripeSessionId,
      verificationId,
      amountTotal: 999,
      currency: "gbp",
      customerEmail: null,
    });

    expect(second.duplicate).toBe(true);
    expect(second.badgeSlug).toBe(first.badgeSlug);

    const { data: payments } = await admin
      .from("payments")
      .select("id, status, amount_total")
      .eq("stripe_session_id", stripeSessionId);
    expect(payments).toHaveLength(1);
    expect(payments![0].status).toBe("paid");

    const { data: badges } = await admin
      .from("badges")
      .select("public_slug, tier")
      .eq("verification_id", verificationId);
    expect(badges).toHaveLength(1);
    expect(badges![0].tier).toBe("silver");

    const { data: verification } = await admin
      .from("verifications")
      .select("is_paid")
      .eq("id", verificationId)
      .single();
    expect(verification!.is_paid).toBe(true);
  });
});
