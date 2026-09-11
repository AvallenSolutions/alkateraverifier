"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Update the user's own profile (TASK-042); RLS enforces ownership. */
export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

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
