"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";

/** Update the user's own profile (TASK-042); RLS enforces ownership. */
export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // The row may not exist yet (no verifier sign-up trigger in the shared project);
  // create it before the ownership-scoped update below.
  await ensureProfile(user.id, user.email);

  const displayName = String(formData.get("displayName") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      company_name: companyName || null,
    })
    .eq("id", user.id);

  revalidatePath("/settings");
  redirect(error ? "/settings?saved=0" : "/settings?saved=1");
}
