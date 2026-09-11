// Verification for the report-ready email (TASK-039, FR-039).
// Sends a real test email through Resend using the SAME template as
// src/lib/email/sendReportReady.ts, so a green run proves the live path.
//
// Usage: node --env-file=.env.local scripts/verify-resend.mjs [recipient@email]
// Recipient defaults to the address in RESEND_TEST_TO, else you must pass one.
//
// Note: with the default onboarding@resend.dev sender, Resend only delivers to
// the email that owns the Resend account (test mode). Verify a real alkatera
// domain and set EMAIL_FROM to send anywhere.

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error("RESEND_API_KEY not set. Add it to .env.local and re-run.");
  process.exit(1);
}

const to = process.argv[2] ?? process.env.RESEND_TEST_TO;
if (!to) {
  console.error(
    "No recipient. Pass one: node --env-file=.env.local scripts/verify-resend.mjs you@example.com",
  );
  process.exit(1);
}

const from = process.env.EMAIL_FROM ?? "alkatera verifier <onboarding@resend.dev>";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Sample values mirroring a real completed+paid verification.
const verificationId = "test-" + "0000-0000-0000";
const product = "UNROOTED Mighty Ginger";
const tierLabel = "bronze";
const resultUrl = `${appUrl}/verify/${verificationId}`;

const resend = new Resend(apiKey);

const { data, error } = await resend.emails.send({
  from,
  to,
  subject: `Your verification report is ready: ${product}`,
  html: [
    `<p>Your verification of <strong>${product}</strong> is complete and paid.</p>`,
    `<p>Result: <strong>${tierLabel}</strong>. The full report and your shareable badge are ready.</p>`,
    `<p><a href="${resultUrl}">Open your verification</a> to download the report and share the badge.</p>`,
    `<p>Every finding shows its working, with the standard and clause cited.</p>`,
  ].join("\n"),
});

if (error) {
  console.error("Resend send failed:", error);
  process.exit(1);
}

console.log("Sent. Resend message id:", data?.id);
console.log("From:", from);
console.log("To:  ", to);
console.log("Link in body:", resultUrl);
