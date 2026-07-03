import { Resend } from "resend";
import { env } from "@/lib/env";

/**
 * Report-ready email via Resend (TASK-039, FR-012). No-ops with a warning
 * until RESEND_API_KEY is configured, so payments never fail on email.
 */
export async function sendReportReady(params: {
  to: string;
  verificationId: string;
  productName: string | null;
  tier: string;
}): Promise<{ sent: boolean }> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      `RESEND_API_KEY not set — skipping report-ready email for ${params.verificationId}`,
    );
    return { sent: false };
  }

  const resend = new Resend(apiKey);
  const product = params.productName ?? "your LCA";
  const resultUrl = `${env.NEXT_PUBLIC_APP_URL}/verify/${params.verificationId}`;
  const tierLabel = params.tier.replace("_", " ");

  await resend.emails.send({
    from:
      process.env.EMAIL_FROM ?? "alkatera verifier <onboarding@resend.dev>",
    to: params.to,
    subject: `Your verification report is ready: ${product}`,
    html: [
      `<p>Your verification of <strong>${product}</strong> is complete and paid.</p>`,
      `<p>Result: <strong>${tierLabel}</strong>. The full report and your shareable badge are ready.</p>`,
      `<p><a href="${resultUrl}">Open your verification</a> to download the report and share the badge.</p>`,
      `<p>Every finding shows its working, with the standard and clause cited.</p>`,
    ].join("\n"),
  });

  return { sent: true };
}
