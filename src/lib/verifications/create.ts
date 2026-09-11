import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import type { Verification } from "@/types/verification";

const BUCKET = "lca-uploads";

/** Matches the bucket's file_size_limit (supabase/migrations/0003_storage.sql). */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export class VerificationCreateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VerificationCreateError";
  }
}

/**
 * Store the uploaded PDF in the private bucket and create the verification
 * record (status=pending) — FR-001. Uses the service role: the bucket has
 * no user-facing policies and users cannot write verification rows with
 * arbitrary state.
 */
export async function createVerification(params: {
  userId: string;
  bytes: Uint8Array;
  selectedStandardIds: string[];
}): Promise<Verification> {
  const admin = createAdminClient();
  const id = crypto.randomUUID();
  const filePath = `${params.userId}/${id}.pdf`;

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(filePath, params.bytes, { contentType: "application/pdf" });

  if (uploadError) {
    throw new VerificationCreateError(
      `We could not store your upload (${uploadError.message}). Try again.`,
    );
  }

  const { data, error: insertError } = await admin
    .from("verifications")
    .insert({
      id,
      user_id: params.userId,
      file_path: filePath,
      selected_standard_ids: params.selectedStandardIds,
      status: "pending",
    })
    .select()
    .single();

  if (insertError) {
    // Don't strand the uploaded file if the record failed.
    await admin.storage.from(BUCKET).remove([filePath]);
    throw new VerificationCreateError(
      `We could not create the verification record (${insertError.message}). Try again.`,
    );
  }

  return data as Verification;
}

/**
 * Kick the async worker (built in TASK-027). Failure is tolerated: the
 * record stays `pending` and the worker can pick it up on a later trigger.
 */
export async function enqueueProcessing(verificationId: string): Promise<void> {
  try {
    await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/verify/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationId }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Worker not reachable yet — the verification remains pending.
  }
}
