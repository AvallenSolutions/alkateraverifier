import Stripe from "stripe";
import { requireEnv } from "@/lib/env";

/**
 * Stripe configuration (TASK-033, PRD § Payment Integration).
 * One-time paid unlock per verification — the price lives in Stripe and is
 * referenced via STRIPE_PRICE_ID (created by scripts/setup-stripe.mjs,
 * deliberately low per the low-cost mandate).
 */

let stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripe) {
    stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"));
  }
  return stripe;
}

export function getPaidUnlockPriceId(): string {
  return requireEnv("STRIPE_PRICE_ID");
}

/** Verification step for TASK-033: the price is retrievable via the SDK. */
export async function fetchPaidUnlockPrice(): Promise<Stripe.Price> {
  return getStripeClient().prices.retrieve(getPaidUnlockPriceId());
}
