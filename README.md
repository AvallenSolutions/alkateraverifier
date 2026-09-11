# alka**tera** verifier

An independent verifier for Life Cycle Assessments (LCAs). Upload an LCA report from
any platform, pick the standards to check it against, and get a transparent verdict:
every calculation re-checked, every finding tied to a named standard and clause, and a
certification tier from Not certified to Platinum.

It is platform-agnostic by design. It must be willing to fail alka**tera**'s own reports.

## Status (11 September 2026)

- MVP scope is built and merged to `main`. It is **not deployed**.
- A full review and the current plan live in `tasks/`:
  - `tasks/review-2026-09-11.md`: every known bug and flaw, with file references.
  - `tasks/todo.md`: the phased plan (security, engine, tests, re-skin, launch).
- The database now lives in the shared Alkatera2 Supabase project, in its own
  `lcaverifier` schema. See `tasks/supabase-merge.md`.

## Stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- Supabase: Postgres, Auth and Storage (schema `lcaverifier`)
- Anthropic Claude API: document extraction and clause evaluation
- Stripe: one-off paid unlock of the full report and badge
- Resend: report-ready email
- Sentry and PostHog: errors and product analytics
- `@react-pdf/renderer`: the downloadable report
- Vitest: tests

## Getting started

Needs Node.js 20.9 or later.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill in `.env.local` first. The app validates its environment on start (`src/lib/env.ts`).
Set `SKIP_ENV_VALIDATION=1` to build without secrets.

The local URL depends on the base path in `next.config.ts`. With no base path it is
`http://localhost:3000`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (integration tests stay off, see below) |
| `node scripts/setup-stripe.mjs` | Create the Stripe product and price, print the env line |
| `node --env-file=.env.local scripts/verify-resend.mjs you@example.com` | Send a real test report email |

## Environment variables

All names and notes are in `.env.example`.

| Group | Variables | Needed for |
|---|---|---|
| App | `NEXT_PUBLIC_APP_URL` | Links in emails, Stripe return URLs, metadata |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Everything |
| Anthropic | `ANTHROPIC_API_KEY` (optional: `CLAUDE_EXTRACTION_MODEL`, `CLAUDE_EVALUATION_MODEL`) | Running a verification |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID` | Paid unlock |
| Resend | `RESEND_API_KEY`, `EMAIL_FROM` | Report-ready email |
| Sentry | `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` (optional: `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`) | Error tracking |
| PostHog | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | Analytics |

## Database

- Project: Alkatera2 (`dfcezkyaejrxmbwunhry`), schema `lcaverifier`. Auth users and
  storage are shared with the alka**tera** platform.
- The schema must be listed under Project Settings, API, Exposed schemas.
- **Do not run `supabase db push`.** The files in `supabase/migrations/` still target
  the old standalone project and the `public` schema. One of them would overwrite the
  platform's sign-up trigger. Phase 1 of `tasks/todo.md` replaces them.
- Every schema change is posted as SQL and run in the Supabase SQL editor.

## How a verification works

1. **Upload.** The user uploads a PDF (20 MB max) and picks standards
   (`src/app/api/verify/route.ts`, `src/lib/verifications/create.ts`).
2. **Extract.** Claude reads the report into a typed structure
   (`src/lib/extraction/`, schema in `src/types/lca.ts`).
3. **Re-check the maths.** Deterministic reconciliation checks within ±2%
   (`src/lib/engine/calculations.ts`).
4. **Evaluate clauses.** Claude judges each selected clause and must cite it
   (`src/lib/engine/evaluate.ts`, clauses in `src/lib/standards/`).
5. **Gates, then tier.** Three gates, then Bronze, Silver, Gold or Platinum
   (`src/lib/engine/score.ts`, rubric in `docs/prd.md` FR-006).
6. **Result.** A free summary, then a paid full report (PDF) and a public badge
   (`src/lib/report/`, `src/lib/stripe/`).

The worker is `src/lib/engine/run.ts`.

## Tests

- `npm test` runs the unit suite against the fixtures in `tests/fixtures/`.
- The extraction test runs live only when `ANTHROPIC_API_KEY` is set.
- The two Supabase integration tests are **opt-in**. They write real rows and files, and
  the Supabase project is shared with the platform. They run only with
  `RUN_INTEGRATION=1 npm test`. Do not use them until Phase 1 points them at a test user.

## Project layout

```
src/app/            routes: (marketing), (app), api, badge
src/components/     ui kit, feature components, marketing blocks
src/lib/engine/     calculations, evaluation, scoring, the worker
src/lib/extraction/ PDF text and Claude extraction
src/lib/standards/  clause loading and plain-English descriptors
src/lib/report/     PDF report and badge data
src/lib/supabase/   server, browser and admin clients, auth actions
supabase/           migrations (out of date, see above)
tests/              engine tests and fixtures
docs/               vision, PRD, roadmap, design system
tasks/              review and plan
```

## Notes on Next.js 16

This Next.js version has breaking changes. Read `AGENTS.md` and the guides in
`node_modules/next/dist/docs/` before changing framework code.

- The root middleware file is `src/proxy.ts` (`middleware.ts` is deprecated).
- Sentry's browser setup lives in `src/instrumentation-client.ts`.
- Tailwind v4 loads `tailwind.config.ts` through `@config` in `src/app/globals.css`.
