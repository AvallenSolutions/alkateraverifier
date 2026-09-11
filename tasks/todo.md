# LCA Verifier: fix, re-skin, harden (plan of 11 September 2026)

Review with all findings and file references: `tasks/review-2026-09-11.md`.
Previous (completed) redesign plan: `tasks/archive/redesign-studio-language-2026-07.md`.

## Decisions needed from Tim before Phase 1

- [ ] **D1. Where does it live?**
      (a) `verifier.alkatera.com` subdomain: no basePath, no rewrite in the alkatera repo,
      own cookies and robots, independence stays visible. Recommended.
      (b) `alkatera.com/lcaverifier`: keep basePath, add a multi-zone rewrite plus a
      middleware exclusion in the alkatera repo, fix six basePath breakages, share the
      alkatera.com robots.txt.
- [ ] **D2. Shared sign-in or separate?**
      (a) Separate session: own cookie name and path, `signOut({ scope: "local" })`,
      stop the platform's `handle_new_user` trigger writing verifier users into
      `public.profiles`. Recommended (automatic with D1a).
      (b) One alkatera login for both: document it, remove "create an account" copy,
      coordinate cookie options with the platform.

Design direction assumed (per Tim's ask): adopt the CURRENT alkatera system (Wada Sanzo
palette, Bricolage Grotesque, studio kit) exactly. Keep the standalone ink-led stance
(vandyke-deep bands, no desk link, independence strip). Pick the verifier's "one act"
pigment at Phase 4 start with two swatches.

## Phase 0. Housekeeping (S) (done 11 September 2026)

- [x] Merge the stacked PRs #1 to #6 into `main` in order (merge commits 694674b to
      d9e5147). `main` tree verified identical to the last PR head. Merged branches deleted.
      Work branch: `fix/review-2026-09-11`.
- [x] Verify `main` on its own (uncommitted work stashed): tsc, lint, 32 tests, production
      build all green.
- [ ] Commit the uncommitted schema and basePath work only after Phase 1 fixes.
      (Still uncommitted on the work branch: supabase client schema option,
      `ensureProfile`, basePath, `.env.example`, `.claude/launch.json`.)
- [x] Replace the create-next-app README.
- [x] Untrack `supabase/.temp/` (it pointed at the deleted project) and ignore it.
- [x] Pulled forward from Phase 1: the two Supabase integration tests are now opt-in
      (`RUN_INTEGRATION=1`), so pasting the service role key cannot make `npm test`
      write into the shared project. Proved: they skip with a key present.

## Phase 1. Security and launch blockers (M)

- [ ] Expose `lcaverifier` in Alkatera2, Project Settings, API, Exposed schemas (Tim).
      Re-probe with the REST call in the review.
- [ ] Apply the RLS and grant hardening SQL to Alkatera2: drop `verifications_insert_own`
      and `verifications_delete_own`; revoke INSERT/UPDATE/DELETE from `anon` and
      `authenticated` on every table; restrict `profiles_update_own` to display and company
      name; unique index on `payments.stripe_session_id`; CHECK constraints on status, tier,
      result, severity, confidence. Post the SQL in chat.
- [ ] Rewrite `supabase/migrations` as one schema-qualified `lcaverifier` migration matching
      production; delete `0004_profile_trigger.sql`; register in Alkatera2 migration history.
- [ ] Remove the self-fetch worker: run `after(runVerification)` inside `POST /api/verify`
      with `maxDuration = 300`; add authenticated `POST /api/verify/[id]/retry`; delete or
      secret-guard `/api/verify/process`.
- [ ] DB-backed rate limits (per user per hour, global daily cap); drop the in-memory limiter.
- [ ] Sign-in limiter keyed on ip+email or removed; server-side password length.
- [ ] Stripe webhook: treat 23505 as duplicate, 200 on permanent errors, handle
      `charge.refunded` (unpay, delete badge), check `livemode` and `metadata.userId`.
- [ ] Implement D1 and D2 (URL, cookies, sign-out scope, trigger side effect).
- [ ] Fix the six basePath breakages if D1b (`apiUrl()` helper, `Link` for badge and report,
      validate `NEXT_PUBLIC_APP_URL` pathname, ESLint rule against `fetch("/`).
- [ ] Fix integration tests: use `createAdminClient()`, dedicated test auth user
      (the `RUN_INTEGRATION=1` gate is already in, from Phase 0).
- [ ] `env.ts`: Anthropic, Stripe, Resend, `EMAIL_FROM` required in production.
- [ ] Robots and sitemap correct for the chosen URL; cache headers on badge routes.
- [ ] Privacy notice, retention rule (delete PDF N days after completion, keep extraction),
      user-initiated delete that removes the storage object.

## Phase 2. Engine correctness (M/L)

- [ ] Calc checks carry `status: computed | not_computable` with missing inputs named;
      persisted and rendered. Hard gate needs at least the stage-sum check computed.
- [ ] Three-state gates (`passed | failed | not_assessable`); `not_assessable` blocks Silver
      and above and badge issuance; honest detail text.
- [ ] Gate clauses (ISO 14044 §4.2, §4.3.4, §4.4) must exist in the evaluated set; refuse
      or flag selection of standards with no encoded clauses; show "clauses evaluated" and
      "standards with no encoded checks yet" everywhere.
- [ ] Encode clauses for ISO 14040, ISO 14046, GHG Protocol, PAS 2050 (or mark them
      "disclosure only" in the UI).
- [ ] Species-sum: reconcile against the table's own total; test headline with and without
      biogenic; drop total/subtotal rows; record which hypothesis matched.
- [ ] Schema: split `fossilGhgKgCo2e` and `biogenicCo2Kg` with `.describe()`; credits as
      magnitude plus sign; nullable stage values; `unit` and `perBasis` per block.
- [ ] End-of-life check accepts both sign conventions and says which matched; fix label.
- [ ] Data quality: verifier-owned impact-weighted primary share; label and score must agree;
      exact-match rating labels; DQR scale normalisation; Platinum on the PRD basis.
- [ ] Blind evaluation: strip producer identity and self-assessment; data-not-instructions
      guard; structured `evidence[]` per finding validated against the extraction;
      word-boundary citation check; red-team fixture with injected instructions.
- [ ] Recalibrate §4.5.3 and the fixture so the engine never grades above the producer's
      own printed self-assessment; add the regression test.
- [ ] Extraction confidence caps the band below a threshold and blocks the badge; shown on
      badge and PDF.
- [ ] Critical review three-state wording. Not Certified badge heading honest.
- [ ] Score floors per band; unstated data quality scores zero.
- [ ] Worker: `processing_started_at`, stale reclaim after 15 min, cron sweeper with
      `CRON_SECRET`, SDK `timeout`/`maxRetries`, streaming for extraction, `max_tokens`
      handled, every Supabase error checked, Sentry capture with verification id.
- [ ] Input caps: pages, characters, bytes; plain-English rejection; garbage-text detection;
      delete or use `renderPdfPageImages`.
- [ ] Prompt caching that hits: clause catalogue in the cached prefix, deterministic clause
      order, verify `cache_read_input_tokens`.
- [ ] Deterministic checks: `mass x GWP` per species, GWP vs AR5/AR6, share sums,
      double-counting flag, zero-category justification, allocation flags.
- [ ] Audit trail columns: engine version, prompt hashes, model ids, clause snapshot,
      tolerances, PDF hash; usage tokens per call.

## Phase 3. Tests (M)

- [ ] Recorded-response harness: golden extraction and evaluation JSON per fixture; the
      three flawed fixtures run through the whole engine in CI; assert every planted error
      is caught and the good fixture is not failed.
- [ ] Unit tests for every item in review section C.
- [ ] Seed invariant test: every active standard has at least one clause with a descriptor.
- [ ] Gated live eval with pass/fail thresholds and a per-clause disagreement rate.

## Phase 4. Re-skin to the current alkatera design system (M/L)

- [ ] R0: rewrite `docs/design.md` and `docs/design.html` to the current system, with the
      verifier's own room entry and stated deviations.
- [ ] R1: tokens and fonts. Port `theme.ts` values into Tailwind v4 `@theme` with identical
      `studio-*` class names; `--room-rgb/--room-accent-rgb/--room-on-rgb` runtime vars;
      Bricolage Grotesque 500/600/700 (`--font-display`), Inter, JetBrains Mono; `en-GB`;
      `ease-studio`; base border colour rule; `tw-animate-css`.
- [ ] R2: kit. Copy and port Statement, Eyebrow, BigNumber, Panel, PosterBlock, PillButton
      (ink / outline / room / ghost, md and sm), MonoTabs, SectionTabs, StateChip, Notice,
      FactRow, FactList, FactTable, FieldLabel/FieldRow, StageBar, Mark, PendingMark,
      EntryDate, StudioDialog, EmptyState, Skeleton, Toast; delete Banner, TierBadge,
      button.ts, dead tokens and the teal accent.
- [ ] R3: shell. RoomBand (52px, vandyke-deep, wordmark, mono tabs, live note) and InkBand
      (independence strip, safe-area padding, the way out) on every surface including the
      public badge page. Wordmark alka 500 / tera 700 everywhere including the PDF.
- [ ] R4: surfaces. Verify flow, result page (Statement with the tier as subject, BigNumber
      score with label, gates as three-state StateChips, checks as FactTable with units,
      findings as FactRows with "show working"), dashboard, settings, sign-in and sign-up
      (AuthShell idiom), marketing (SiteNav/SiteFooter idiom, one PosterBlock), badge page
      as a certificate with band and mark.
- [ ] R5: copy. Full stops on statements, number as subject, "3 July 2026" dates in
      Europe/London, no em dashes anywhere (title, copy, placeholders), British English,
      Not Certified in sentence case.
- [ ] R6: a11y and polish. Dropzone without nested controls; permanent live region; no
      `role="alert"` on static content; `scope="col"`; skip link; 3:1 input borders;
      responsive statement clamp; favicon, icon, OG image, theme colour; clear `public/`.
- [ ] R7: PDF report on the new palette with Bricolage and JetBrains Mono registered.

## Phase 5. Verify and launch (M)

- [ ] `tsc`, lint, vitest, production build green.
- [ ] Browser pass on desktop and 375px for every surface; axe pass; contrast measured.
- [ ] Live end-to-end with real keys: sign up, upload the good fixture and the three flawed
      fixtures, check tiers, pay in Stripe test mode, badge, report email.
- [ ] Vercel project for the verifier (Pro plan for 300s), env vars set, Stripe webhook on
      the verifier's own domain, Resend domain verified, Sentry test error, PostHog funnel.
- [ ] Health endpoint wired to a monitor; Claude spend alert set.
- [ ] Screenshots of each surface for sign-off.

## Review

(to be written when the work is done)
