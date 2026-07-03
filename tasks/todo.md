# Redesign — the alkatera·OS studio language, adapted for the Verifier

Source: `alkatera-studio-design-guidelines.pdf` (The Design Language v1, July 2026).
Branch: `redesign/studio-language`. Independent of the credential-gated launch
verifications (Anthropic/Stripe/Sentry/Vercel/PostHog/Resend) — those can land in parallel.

## Direction (from Tim's decisions)

- **Identity: adopt but stay distinct.** The Verifier is its own standalone *house* in the
  studio language, ink-led — not one of the four brand rooms (Forest/Cobalt/Ochre/Brick),
  and NOT a room on the alkatera desk. Distinctness carried by: ink-led austerity, no
  OS desk-link, a standing independence disclosure strip, its own mark + one reserved accent,
  and "we fail our own reports" kept prominent.
- **Shell: full room shell.** Sticky ink top band (wordmark "alkatera verifier", mark, mono
  tabs with 3px active underline, live mono note) + sticky ink bottom band (repurposed from
  the assistant band into the independence/scope strip + quick actions).
- **Tiers: fully typographic, no pills.** Big Space Grotesk word + mono label in a mapped
  tone; no filled badge; no saturated block.

## Open design choices (resolve during build, with options for Tim)

- [ ] Reserved Verifier accent (distinct from the four OS rooms) — bring 2–3 swatches.
- [ ] Verifier chop mark (stamp / tick / seal geometry).
- [ ] `tier-tone` token set — five AA-legible values for the metallic ladder as text.

---

## R0 — Design source of truth

- [x] Rewrite `docs/design.md` to the studio language adapted for the Verifier
      (palette, three voices, marks, room anatomy, kit of parts, motion, voice).
- [ ] Regenerate `docs/design.html` mirror to match.

## R1 — Token + type foundation

- [x] `tailwind.config.ts`: replace palette (paper #ECEAE3, cream #F2F1EA, hairline #D9D6CB,
      dim #6F6F68, ink #1A1B1D; forest/cobalt/ochre/ochre-ink/brick; working tones;
      tier-tones; reserved accent). Remove lime (#C2F000) entirely.
- [x] Re-cut type scale: statement (Space Grotesk Bold, 40–68px, lh 0.95, tracking -0.035em),
      big-number (tabular 27–32px), card-title (SemiBold 13.5–15px), body (Inter 13–14/1.5),
      eyebrow (JetBrains Mono Bold 9.5–10.5px caps +0.22em), meta (JetBrains Mono 10–11px).
      Tabular numerals feature. Radius 6 + full. Studio ease token.
- [x] `layout.tsx`: swap fonts to Space Grotesk + Inter + JetBrains Mono (drop Playfair +
      IBM Plex Mono). Wordmark "alka**tera** verifier".
- [x] `globals.css`: font vars, focus-visible in the new accent, studio ease,
      prefers-reduced-motion guard.

## R2 — Kit of parts (primitives)

- [ ] Button: ink default / outline second / accent (the one act) / ghost — pills, radius full.
      Replaces every lime CTA.
- [ ] Panel (cream + hairline r6), AccentPanel (the one saturated block, used sparingly).
- [ ] Eyebrow/Label (mono caps), BigNumber (tabular + mono label at 70%).
- [ ] Tabs (mono caps + 3px rule), Input (cream, hairline).
- [ ] StateText (typographic states, mono, no pill), FactRow (bold subject, mono meta).
- [ ] Marks: the Verifier mark component (8% on paper, cropped by corner; wake on hover).
- [ ] RoomBand (sticky top) + InkBand (sticky bottom, independence/scope strip).

## R3 — App shell + core surfaces

- [ ] `(app)/layout.tsx`: RoomBand + InkBand shell; drop AppHeader.
- [ ] Verify flow: VerifyFlow / UploadDropzone / StandardsPicker → statement + cream panels + mono.
- [ ] Result page: typographic tier + score big-number; CalcChecksTable → fact rows /
      typographic pass-fail; FindingItem → mono state, hairline, reveal-on-hover; gate banner;
      low-confidence + failed/retry states; UpgradeCTA (accent pill); critical-review line.
- [ ] TierBadge → typographic Tier component (result, dashboard, badge).
- [ ] Loading skeletons + empty states in the new language.

## R4 — Remaining surfaces

- [ ] Dashboard: VerificationList → fact rows + typographic tier; empty state.
- [ ] Settings: profile form (studio input) + payment history (fact rows).
- [ ] Marketing landing: hero as statement, poster blocks (the rooms idiom), pricing,
      "we will fail our own reports", tracked alkatera referral.
- [ ] Sign-in / sign-up in the new language.
- [ ] Public badge page: the certificate as a poster surface (statement tier + fact-row
      findings summary), tracked referral.
- [ ] Toast / Banner in the new language.

## R5 — Motion

- [ ] Studio ease everywhere; hover lift/colour (150–200ms); facts reveal (rise 6px + fade,
      280ms delay 160ms); marks wake (rotate/scale, 500ms); breathing grid where it fits
      (findings / dashboard). All behind prefers-reduced-motion.

## R6 — Verify

- [ ] Report PDF (`generate.tsx`): restyle to new palette/type. Register Space Grotesk +
      JetBrains Mono via @react-pdf Font (built-ins are Times/Helvetica/Courier).
- [ ] Update tests asserting old copy/labels (dashboard tier text, TierBadge render, etc.).
- [ ] tsc / lint / vitest green; production build clean.
- [ ] Browser pass: desktop + 375px, no horizontal scroll; every surface.
- [ ] axe pass on new palette; measure tier-tone + finding-tone contrast (the known risk).
- [ ] Screenshots of each surface for sign-off.

## Sequencing

Recommend doing R0–R6 now, pre-launch, on its own branch; the credential-gated
verifications (live magic moment, Stripe, Sentry, Vercel deploy, PostHog) are unaffected
and can happen before, during, or after.

## Review (to fill in on completion)
