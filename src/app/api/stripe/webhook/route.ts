import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/config";
import { handleCheckoutCompleted } from "@/lib/stripe/webhook-handlers";
import { requireEnv } from "@/lib/env";

/**
 * POST /api/stripe/webhook (TASK-035). Raw body + signature verification;
 * invalid signatures are rejected without mutating state; fulfilment is
 * idempotent on the session id (PRD § Edge Cases).
 */
export async function POST(request: Request) {
  const payload = await request.text(); // raw body — required for the MAC
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(
      payload,
      signature,
      requireEnv("STRIPE_WEBHOOK_SECRET"),
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const verificationId = session.metadata?.verificationId;

    if (session.payment_status === "paid" && verificationId) {
      try {
        await handleCheckoutCompleted({
          stripeSessionId: session.id,
          verificationId,
          amountTotal: session.amount_total,
          currency: session.currency,
          customerEmail:
            session.customer_details?.email ?? session.customer_email ?? null,
        });
      } catch (error) {
        console.error("webhook fulfilment failed", error);
        // 500 → Stripe retries; fulfilment is idempotent so replays are safe.
        return NextResponse.json({ error: "Fulfilment failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
