import { createAdminClient } from "@/lib/supabase/admin";
import { issueBadge } from "@/lib/report/badge";
import { sendReportReady } from "@/lib/email/sendReportReady";

export interface CheckoutCompletedInput {
  stripeSessionId: string;
  verificationId: string;
  amountTotal: number | null;
  currency: string | null;
  customerEmail: string | null;
}

export interface CheckoutCompletedResult {
  duplicate: boolean;
  badgeSlug: string | null;
}

/**
 * Fulfilment for checkout.session.completed (TASK-035, FR-007/008/012):
 * record the payment, mark the verification paid, issue the badge, send
 * the report email. Idempotent on the Stripe session id — replayed events
 * change nothing and duplicate nothing (PRD § Edge Cases).
 */
export async function handleCheckoutCompleted(
  input: CheckoutCompletedInput,
): Promise<CheckoutCompletedResult> {
  const admin = createAdminClient();

  const { data: existingPayment } = await admin
    .from("payments")
    .select("id")
    .eq("stripe_session_id", input.stripeSessionId)
    .maybeSingle();
  if (existingPayment) {
    const { data: badge } = await admin
      .from("badges")
      .select("public_slug")
      .eq("verification_id", input.verificationId)
      .maybeSingle();
    return { duplicate: true, badgeSlug: badge?.public_slug ?? null };
  }

  const { data: verification, error: verificationError } = await admin
    .from("verifications")
    .select("id, user_id, tier, product_name")
    .eq("id", input.verificationId)
    .single();
  if (verificationError || !verification) {
    throw new Error(
      `Webhook references unknown verification ${input.verificationId}`,
    );
  }

  const { error: paymentError } = await admin.from("payments").insert({
    user_id: verification.user_id,
    verification_id: verification.id,
    stripe_session_id: input.stripeSessionId,
    amount_total: input.amountTotal,
    currency: input.currency,
    status: "paid",
  });
  if (paymentError) {
    throw new Error(`Could not record payment: ${paymentError.message}`);
  }

  await admin
    .from("verifications")
    .update({ is_paid: true })
    .eq("id", verification.id);

  const badge = await issueBadge(
    verification.id,
    verification.tier ?? "not_certified",
  );

  if (input.customerEmail) {
    // Email must never fail the fulfilment.
    try {
      await sendReportReady({
        to: input.customerEmail,
        verificationId: verification.id,
        productName: verification.product_name,
        tier: verification.tier ?? "not_certified",
      });
    } catch (error) {
      console.error("report-ready email failed", error);
    }
  }

  return { duplicate: false, badgeSlug: badge.public_slug };
}
