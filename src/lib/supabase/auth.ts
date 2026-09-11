"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";

/** Only allow internal redirect targets, defaulting to the dashboard. */
function safeNext(raw: FormDataEntryValue | null): string {
  const value = typeof raw === "string" ? raw : "";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function backWithError(path: string, message: string, next: string): never {
  const params = new URLSearchParams({ error: message });
  if (next !== "/dashboard") params.set("next", next);
  redirect(`${path}?${params.toString()}`);
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    backWithError("/sign-in", "Enter your email and password.", next);
  }

  // Slow credential guessing (TASK-048).
  if (!checkRateLimit(`auth:${email.toLowerCase()}`, 10, 15 * 60 * 1000).allowed) {
    backWithError(
      "/sign-in",
      "Too many attempts. Wait a few minutes and try again.",
      next,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message =
      error.code === "invalid_credentials"
        ? "Email or password is incorrect. Check both and try again."
        : error.message;
    backWithError("/sign-in", message, next);
  }

  redirect(next);
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    backWithError("/sign-up", "Enter your email and choose a password.", next);
  }

  if (!checkRateLimit(`auth:${email.toLowerCase()}`, 10, 15 * 60 * 1000).allowed) {
    backWithError(
      "/sign-up",
      "Too many attempts. Wait a few minutes and try again.",
      next,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    const message =
      error.code === "user_already_exists"
        ? "An account with this email already exists. Sign in instead."
        : error.message;
    backWithError("/sign-up", message, next);
  }

  // signup=1 lets the client fire the signup funnel event (TASK-047).
  redirect(`${next}${next.includes("?") ? "&" : "?"}signup=1`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
