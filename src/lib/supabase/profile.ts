import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Ensure a verifier profile row exists for an auth user.
 *
 * Replaces the old `on_auth_user_created` DB trigger. Auth is shared with the
 * alkatera platform (one login for both), so a global trigger would fire for
 * every platform sign-up and write into the verifier's schema. Instead we
 * create the profile lazily, scoped to users who actually use the verifier. Idempotent; uses the
 * service role so it is unaffected by RLS. Call before any insert that
 * foreign-keys to profiles (verifications, payments).
 */
export async function ensureProfile(
  userId: string,
  email?: string | null,
): Promise<void> {
  const admin = createAdminClient();

  let resolvedEmail = email ?? null;
  if (!resolvedEmail) {
    const { data } = await admin.auth.admin.getUserById(userId);
    resolvedEmail = data.user?.email ?? null;
  }

  await admin
    .from("profiles")
    .upsert(
      { id: userId, email: resolvedEmail ?? "" },
      { onConflict: "id", ignoreDuplicates: true },
    );
}
