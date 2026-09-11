# Verifier database: where it lives

## Current (11 September 2026): alkatera-staging

The verifier moved again, from Alkatera2 (`dfcezkyaejrxmbwunhry`) to **alkatera-staging**
(`vwhdyqvlgjqmlzmsvaes`, London). Reason: the platform's v2 launch plan makes staging the
production database and closes Alkatera2. Tim chose one login for both products, so the
verifier must share the platform's auth project.

What moved: the `lcaverifier` schema (8 tables), 9 standards, 11 clauses. Alkatera2 held no
users, verifications, payments, badges or files for the verifier, so no user data moved.
The `lca-uploads` bucket already existed in staging (the platform copied every Alkatera2
bucket on 1 August 2026) and is reused. It is empty and no platform code uses it.

How: `supabase/migrations/20260911160000_lcaverifier_baseline.sql`, pasted into the
staging SQL editor by Tim. It is not recorded in the migration tracker (that tracker
belongs to the platform repo), so never `supabase db push` from this repo.

Differences from the Alkatera2 schema: see the header of the baseline file. In short,
least-privilege grants and the Phase 1 security fixes are built in.

Checklist:
- [x] Baseline written and dry-run on staging (forced rollback; staging left untouched).
- [x] `.env.local` repointed; code and docs updated.
- [ ] Tim runs the baseline in staging and returns the verification output.
- [ ] Tim adds `lcaverifier` to staging's Exposed schemas.
- [ ] Tim pastes the staging service role key into `.env.local`.
- [ ] End-to-end check through the API.
- [ ] Optional: drop the empty `lcaverifier` schema in Alkatera2 before the platform cutover.

Watch-outs:
- The platform cutover purges staging's demo users. `lcaverifier.profiles` cascades from
  `auth.users`, so no real verifier users before the cutover.
- The platform will rotate staging's keys before customer data lands. Update the verifier's
  env vars when it does.
- Staging requires email confirmation. The verifier's sign-up does not handle it yet
  (Phase 1 in `tasks/todo.md`).

---

## History (July 2026): the first move, into Alkatera2


**Goal:** Fold the LCA Verifier Supabase project (`goriowvxkvmizwtenpju`) into the
**Alkatera2** project so the verifier's project slot can be freed, with **zero data
loss** and a controlled cutover for a **live product with real users**.

## Non-negotiable constraint
A Supabase project has ONE auth system. Merging = the verifier's `auth.users` must
fold into Alkatera2's `auth.users`. Where a verifier email already exists in
Alkatera2, that user's verifier rows must be re-keyed from the old verifier UUID to
the existing Alkatera2 UUID. This is the single riskiest step.

## Architecture decision
Put all verifier tables in a **dedicated `lcaverifier` schema** inside Alkatera2's
database (NOT `public`), to avoid collisions with Alkatera2's own `profiles`,
`payments`, `badges`, etc. Auth (`auth.users`) and Storage are shared/merged.
- App change is small: set `db: { schema: 'lcaverifier' }` in the Supabase client
  factories (`src/lib/supabase/{server,admin,client,middleware}.ts`) rather than
  rewriting every `.from()` call. Verified: app uses bare `public` schema today.
- Alkatera2 must **expose** the `lcaverifier` schema in its API settings.
- `standards` / `standard_clauses` reference data moves into `lcaverifier` too.

## Confirmed facts (2026-07-13)
- Verifier project ref: `goriowvxkvmizwtenpju` (West Europe / London).
- **Alkatera2 project ref: `dfcezkyaejrxmbwunhry`** (North EU / Stockholm).
- Both in the same org `qahzrkdbexbghvcfpucb`. NOTE: different regions.
- Supabase CLI is authenticated (can list all projects). `pg_dump`/`psql` NOT
  installed locally (would need `brew install libpq` or Docker for data dump).
- Supabase MCP connector added mid-session does NOT load until the Claude Code
  session is reloaded. Vercel MCP tools ARE available.

## Blockers — need from Tim before Phase 1
- [ ] **Alkatera2 project ref** + confirmation to act on it.
- [ ] **Access**: Supabase access token + DB passwords for BOTH projects (for
      `pg_dump`/`pg_restore`), OR Tim runs the generated commands. Data + auth
      migration is NOT copy-paste SQL.
- [ ] Verifier **deployment** target (Vercel project) to repoint env vars.
- [ ] Confirm a **maintenance window** (~30–60 min offline) is acceptable.

## Phases
### Phase 0 — Audit & prep (no changes)
- [ ] Audit Alkatera2 schema; confirm no `lcaverifier` clash; confirm exposed-schemas.
- [ ] Dump both `auth.users` email sets; compute + report the **overlap count**.
- [ ] Backup both projects (dashboard backup + local `pg_dump`).

### Phase 1 — Schema into Alkatera2
- [ ] Rewrite migrations 0001–0007 as one `lcaverifier` DDL script (tables, FKs,
      RLS with `auth.uid()`, indexes).
- [ ] Create schema + objects in Alkatera2; recreate `lca-uploads` bucket.
- [ ] Drop the global `handle_new_user` trigger; create `lcaverifier.profiles`
      rows lazily in app code (so it doesn't fire for every Alkatera2 signup).

### Phase 2 — Auth user migration
- [ ] Import verifier `auth.users` + `auth.identities` not already in Alkatera2
      (preserve UUID + `encrypted_password`).
- [ ] Build UUID remap (old verifier UUID -> existing Alkatera2 UUID) for overlaps.

### Phase 3 — Data migration
- [ ] `pg_dump` verifier `public` tables (data), load into `lcaverifier`.
- [ ] Apply UUID remap to `profiles.id`, `verifications.user_id`, `payments.user_id`.
- [ ] Copy storage objects between buckets.
- [ ] Row-count reconciliation + end-to-end spot checks.

### Phase 4 — App cutover
- [ ] Add `db: { schema: 'lcaverifier' }` to client factories.
- [ ] Repoint env vars to Alkatera2 in `.env.local` AND Vercel; deploy.
- [ ] Smoke test: sign in, dashboard, run a verification, view badge, Stripe webhook.

### Phase 5 — Decommission (Tim does the delete)
- [ ] Keep old project **paused** for a ~2-week rollback window.
- [ ] Tim deletes `goriowvxkvmizwtenpju` in the dashboard (I won't delete it).

## Review (2026-07-13)

**Key finding that reshaped the job:** the verifier had NO real data — 1 test
user, 0 verifications, 0 payments, 0 badges, 0 storage objects. So there was
nothing to migrate; the task was to stand up the schema and repoint the app.
Decisions: leave the 1 test user (Tim re-registers); proceed with the merge.

**Done autonomously (verified):**
- Built `lcaverifier` schema in Alkatera2 (`dfcezkyaejrxmbwunhry`): 8 tables +
  worker columns, 11 RLS policies, 6 indexes, grants, `lca-uploads` bucket,
  9 standards + 11 clauses seeded. Verified counts match source.
- Dropped the global `handle_new_user` trigger approach; replaced with lazy
  `ensureProfile()` (`src/lib/supabase/profile.ts`) wired into
  `createVerification` and `updateProfile`.
- Repointed app to the `lcaverifier` schema via `db:{schema}` in server/admin/
  client factories. `npx tsc --noEmit` passes.
- Staged `.env.local` to Alkatera2 (URL + anon set; service_role blanked with
  TODO; old verifier values kept commented for rollback).
- Proved PostgREST rejects `lcaverifier` until it is added to Exposed schemas.

**Remaining — Tim's actions (need dashboard access I don't have):**
1. Expose schema: Alkatera2 → Project Settings → API → Exposed schemas → add
   `lcaverifier` → save.
2. Paste Alkatera2 `service_role` key into `.env.local` (and prod env).
3. Set the 3 Supabase env vars to Alkatera2 values wherever the verifier
   deploys (not found as its own Vercel project — confirm deploy target).
4. Verify end-to-end (re-register, upload a verification, save profile).
5. Pause old project `goriowvxkvmizwtenpju` for a rollback window, then delete
   it to free the slot. (Tim deletes — not me.)
