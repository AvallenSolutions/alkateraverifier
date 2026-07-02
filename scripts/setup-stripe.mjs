// One-off Stripe setup (TASK-033): creates the paid-unlock product and a
// deliberately low one-time price, then prints the env line to add.
//
// Usage: STRIPE_SECRET_KEY=sk_test_... node scripts/setup-stripe.mjs [amount_pence] [currency]
// Defaults: 999 GBP (£9.99) — revisit with real conversion data.

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Set STRIPE_SECRET_KEY (test mode key) and re-run.");
  process.exit(1);
}

const amount = Number(process.argv[2] ?? 999);
const currency = (process.argv[3] ?? "gbp").toLowerCase();

const stripe = new Stripe(key);

const existing = await stripe.products.search({
  query: "name:'LCA Verification — full report and badge' AND active:'true'",
});

const product =
  existing.data[0] ??
  (await stripe.products.create({
    name: "LCA Verification — full report and badge",
    description:
      "Unlock the downloadable verification report and shareable public badge for one verified LCA.",
  }));

const price = await stripe.prices.create({
  product: product.id,
  unit_amount: amount,
  currency,
});

console.log(`Product: ${product.id}`);
console.log(`Price:   ${price.id} (${amount} ${currency.toUpperCase()}, one-time)`);
console.log(`\nAdd to .env.local and Vercel:\nSTRIPE_PRICE_ID=${price.id}`);
