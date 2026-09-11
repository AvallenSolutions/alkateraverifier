import Link from "next/link";
import { signUp } from "@/lib/supabase/auth";

export const metadata = { title: "Create your account — alkatera LCA Verifier" };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="text-center font-mono text-label uppercase text-on-surface-subtle">
          <Link href="/">
            alka<span className="font-semibold">tera</span> LCA Verifier
          </Link>
        </p>
        <h1 className="mt-3 text-center font-display text-h1 text-ink">
          Create your account
        </h1>
        <p className="mt-3 text-center text-body-sm text-on-surface-muted">
          Upload your LCA and choose the standards that matter to you. We will
          check it against every one and show our working.
        </p>

        <form
          action={signUp}
          className="mt-6 rounded-md border border-border bg-surface p-5"
        >
          {error ? (
            <p
              role="alert"
              className="mb-4 rounded-sm border-l-[3px] border-error bg-surface-sunken px-3 py-2 text-body-sm text-ink"
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
            minLength={8}
            autoComplete="new-password"
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-body text-ink outline-none focus:border-accent-strong focus:ring-1 focus:ring-accent-strong"
          />
          <p className="mt-2 text-caption text-on-surface-subtle">
            At least 8 characters.
          </p>

          <button
            type="submit"
            className="mt-5 w-full rounded-full bg-accent px-5 py-3 font-mono text-label uppercase text-on-accent transition-colors hover:bg-accent-hover"
          >
            Create account
          </button>
        </form>

        <p className="mt-4 text-center text-body-sm text-on-surface-muted">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-accent-strong underline">
            Sign in
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
