import Link from "next/link";
import { signIn } from "@/lib/supabase/auth";
import { Mark } from "@/components/ui/Mark";
import { buttonClasses } from "@/components/ui/button";

export const metadata = { title: "Sign in · alkatera verifier" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Mark className="h-5 w-5 text-accent-strong" />
          <span className="font-display text-[15px] lowercase leading-none text-ink">
            alka<span className="font-bold">tera</span>
          </span>
          <span className="font-mono text-label uppercase text-on-surface-subtle">
            verifier
          </span>
        </Link>
        <h1 className="mt-4 text-center font-display text-h1 text-ink">
          Sign in
        </h1>

        <form
          action={signIn}
          className="mt-6 rounded-md border border-border bg-surface p-5"
        >
          {error ? (
            <p
              role="alert"
              className="mb-4 rounded-sm border border-border border-l-[3px] border-l-tone-lost-ink bg-surface px-3 py-2 text-body-sm text-ink"
            >
              {error}
            </p>
          ) : null}

          <input type="hidden" name="next" value={next ?? ""} />

          <label
            htmlFor="email"
            className="block font-mono text-label uppercase text-on-surface-subtle"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-body text-ink outline-none focus:border-accent-strong focus:ring-1 focus:ring-accent-strong"
          />

          <label
            htmlFor="password"
            className="mt-4 block font-mono text-label uppercase text-on-surface-subtle"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-body text-ink outline-none focus:border-accent-strong focus:ring-1 focus:ring-accent-strong"
          />

          <button type="submit" className={buttonClasses("accent", "mt-5 w-full")}>
            Sign in
          </button>
        </form>

        <p className="mt-4 text-center text-body-sm text-on-surface-muted">
          No account yet?{" "}
          <Link href="/sign-up" className="text-accent-strong underline">
            Create one
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
