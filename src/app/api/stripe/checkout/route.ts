import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaidUnlockPriceId, getStripeClient } from "@/lib/stripe/config";
import { env } from "@/lib/env";

/**
 * POST /api/stripe/checkout — create a Checkout Session for the paid
 * unlock (TASK-034, FR-007). Owner-only; only completed, unpaid
 * verifications can start checkout.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let verificationId: string | undefined;
  try {
    const body = await request.json();
    verificationId =
      typeof body.verificationId === "string" ? body.verificationId : undefined;
  } catch {
    // handled below
  }
  if (!verificationId) {
    return NextResponse.json({ error: "Missing verificationId" }, { status: 400 });
  }

  // RLS scopes this to the owner.
  const { data: verification } = await supabase
    .from("verifications")
    .select("id, status, is_paid")
    .eq("id", verificationId)
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
  if (verification.is_paid) {
    return NextResponse.json(
      { error: "This verification is already unlocked." },
      { status: 400 },
    );
  }

  const resultUrl = `${env.NEXT_PUBLIC_APP_URL}/verify/${verification.id}`;

  try {
    const session = await getStripeClient().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: getPaidUnlockPriceId(), quantity: 1 }],
      metadata: { verificationId: verification.id, userId: user.id },
      customer_email: user.email,
      success_url: `${resultUrl}?payment=success`,
      cancel_url: `${resultUrl}?payment=cancelled`,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }
    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("checkout session creation failed", error);
    return NextResponse.json(
      { error: "We could not start the payment. Try again in a moment." },
      { status: 502 },
    );
  }
}
