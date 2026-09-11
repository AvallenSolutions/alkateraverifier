import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Banner } from "@/components/ui/Banner";
import { buttonClasses } from "@/components/ui/button";
import { updateProfile } from "./actions";

export const metadata = { title: "Settings · alkatera verifier" };

const inputClass =
  "mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-body text-ink outline-none focus:border-accent-strong focus:ring-1 focus:ring-accent-strong";

/** Profile + payment history (TASK-042). */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: payments }] = await Promise.all([
    supabase
      .from("profiles")
      .select("email, display_name, company_name")
      .eq("id", user!.id)
      .maybeSingle(),
    supabase
      .from("payments")
      .select("id, verification_id, amount_total, currency, status, created_at")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <p className="font-mono text-label uppercase text-accent-strong">
        Settings
      </p>
      <h1 className="mt-2 font-display text-h1 text-ink">Account</h1>

      {saved === "1" ? (
        <div className="mt-4">
          <Banner variant="info">Profile saved.</Banner>
        </div>
      ) : null}
      {saved === "0" ? (
        <div className="mt-4">
          <Banner variant="error">
            We could not save your profile. Try again.
          </Banner>
        </div>
      ) : null}

      <section className="mt-6 rounded-md border border-border bg-surface p-5">
        <h2 className="font-display text-h2 text-ink">Profile</h2>
        <form action={updateProfile} className="mt-4 max-w-md">
          <label
            htmlFor="email"
            className="block font-mono text-label uppercase text-on-surface-subtle"
          >
            Email
          </label>
          <input
            id="email"
            value={profile?.email ?? user?.email ?? ""}
            disabled
            className={`${inputClass} opacity-60`}
          />

          <label
            htmlFor="displayName"
            className="mt-4 block font-mono text-label uppercase text-on-surface-subtle"
          >
            Display name
          </label>
          <input
            id="displayName"
            name="displayName"
            defaultValue={profile?.display_name ?? ""}
            maxLength={255}
            className={inputClass}
          />

          <label
            htmlFor="companyName"
            className="mt-4 block font-mono text-label uppercase text-on-surface-subtle"
          >
            Company
          </label>
          <input
            id="companyName"
            name="companyName"
            defaultValue={profile?.company_name ?? ""}
            maxLength={255}
            className={inputClass}
          />

          <button type="submit" className={buttonClasses("accent", "mt-5 sm:px-8")}>
            Save profile
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-md border border-border bg-surface p-5">
        <h2 className="font-display text-h2 text-ink">Payment history</h2>
        {(payments ?? []).length === 0 ? (
          <p className="mt-3 text-body-sm text-on-surface-muted">
            No payments yet. Paid unlocks appear here with their receipts.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {payments!.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <span className="font-mono text-data text-ink">
                  {payment.amount_total !== null
                    ? `${(payment.amount_total / 100).toFixed(2)} ${(payment.currency ?? "gbp").toUpperCase()}`
                    : "—"}
                </span>
                <span className="font-mono text-caption text-on-surface-subtle">
                  {new Date(payment.created_at).toLocaleDateString("en-GB")} ·{" "}
                  {payment.status}
                </span>
                {payment.verification_id ? (
                  <Link
                    href={`/verify/${payment.verification_id}`}
                    className="text-body-sm text-accent-strong underline"
                  >
                    View verification
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
