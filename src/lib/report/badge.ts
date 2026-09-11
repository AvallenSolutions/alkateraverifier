import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export interface Badge {
  id: string;
  verification_id: string;
  public_slug: string;
  tier: string;
  issued_at: string;
}

/**
 * Issue the public badge for a paid verification (TASK-038, FR-008).
 * Idempotent: a verification has at most one badge (unique constraint);
 * re-issuing returns the existing badge unchanged.
 */
export async function issueBadge(
  verificationId: string,
  tier: string,
): Promise<Badge> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("badges")
    .select("*")
    .eq("verification_id", verificationId)
    .maybeSingle();
  if (existing) return existing as Badge;

  const publicSlug = randomBytes(12).toString("base64url"); // unguessable

  const { data, error } = await admin
    .from("badges")
    .insert({
      verification_id: verificationId,
      public_slug: publicSlug,
      tier,
    })
    .select()
    .single();

  if (error) {
    // Lost a race with a concurrent issue — the winner's badge stands.
    const { data: winner } = await admin
      .from("badges")
      .select("*")
      .eq("verification_id", verificationId)
      .maybeSingle();
    if (winner) return winner as Badge;
    throw new Error(`Could not issue badge: ${error.message}`);
  }

  return data as Badge;
}
