---
version: alpha
name: alkatera Verifier
description: Light, paper-toned, ink-led design system for an independent LCA verification web app — editorial serif display, restrained lime highlight, and a metallic certification-tier scale.
colors:
  background: "#FAF8F3"
  surface: "#FFFFFF"
  surface-sunken: "#F1EFE7"
  ink: "#1C1B18"
  on-surface-muted: "#5E5C55"
  on-surface-subtle: "#6E6B62"
  border: "#E5E1D6"
  border-strong: "#D3CEC1"
  accent: "#C2F000"
  on-accent: "#1C1B18"
  accent-strong: "#52700A"
  accent-subtle: "#EDF6C8"
  success: "#3F7A34"
  on-success: "#FFFFFF"
  warning: "#C08A1E"
  on-warning: "#1C1B18"
  error: "#B4342A"
  on-error: "#FFFFFF"
  info: "#3A6B8C"
  on-info: "#FFFFFF"
  tier-not-certified: "#A0554A"
  tier-bronze: "#9A6532"
  tier-silver: "#9CA3AC"
  tier-gold: "#C6A02A"
  tier-platinum: "#54707D"
  on-metal-light: "#FFFFFF"
  on-metal-dark: "#1C1B18"
typography:
  display:
    fontFamily: "Playfair Display"
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.01em
  h1:
    fontFamily: "Playfair Display"
    fontSize: 34px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.01em
  h2:
    fontFamily: "Playfair Display"
    fontSize: 26px
    fontWeight: 600
    lineHeight: 1.15
  h3:
    fontFamily: "Inter"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: "Inter"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Inter"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "IBM Plex Mono"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.08em
  data:
    fontFamily: "IBM Plex Mono"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: 0
  sm: 6px
  md: 10px
  lg: 16px
  full: 9999px
spacing:
  0: "0"
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "24px"
  6: "32px"
  7: "48px"
  8: "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "#A9D400"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "10px 14px"
  input-text:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "{spacing.5}"
  card-muted:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "{spacing.5}"
  label:
    textColor: "{colors.on-surface-subtle}"
    typography: "{typography.label}"
  nav-item-active:
    backgroundColor: "{colors.accent-subtle}"
    textColor: "{colors.accent-strong}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  badge-tier-not-certified:
    backgroundColor: "{colors.tier-not-certified}"
    textColor: "{colors.on-metal-light}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  badge-tier-bronze:
    backgroundColor: "{colors.tier-bronze}"
    textColor: "{colors.on-metal-light}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  badge-tier-silver:
    backgroundColor: "{colors.tier-silver}"
    textColor: "{colors.on-metal-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  badge-tier-gold:
    backgroundColor: "{colors.tier-gold}"
    textColor: "{colors.on-metal-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  badge-tier-platinum:
    backgroundColor: "{colors.tier-platinum}"
    textColor: "{colors.on-metal-light}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  finding-conforms:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "{spacing.4}"
  finding-minor-gap:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "{spacing.4}"
  finding-major-gap:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "{spacing.4}"
  finding-insufficient:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "{spacing.4}"
---

# alkatera Verifier Design System

## Overview

The alkatera Verifier is a web app that independently verifies Life Cycle Assessments and grades them against international standards. Its users are non-expert brand and sustainability leads who need to trust a verdict, so the interface must feel authoritative, transparent, and calm — an audit document you can actually read, not a dashboard that shows off. The system is deliberately **light and paper-toned**, **ink-led**, and **editorial**: a warm off-white canvas, near-black serif headlines that echo the alkatera reports it verifies, and the alkatera lime used sparingly as a highlight rather than a flood. It shares DNA with the alkatera app (the lime accent, the gold, the uppercase mono labels) but stands apart through its light surface and serif voice. It must never look like a hype-driven marketing site, never hide its reasoning behind a decorative "black-box" score, and never drown the reader in jargon or chrome.

## Colors

The palette is built on warm neutrals so the content, not the UI, carries the weight. `background` (#FAF8F3) is a soft paper tone; `surface` (#FFFFFF) lifts cards a step above it; `surface-sunken` recedes for muted panels. `ink` (#1C1B18) is a warm near-black for primary text and headlines, with `on-surface-muted` and `on-surface-subtle` stepping down for secondary text and labels (both meet WCAG AA on the paper background). `accent` is the alkatera lime (#C2F000) — reserved for primary CTAs, the brand mark, and key interactive emphasis; because bright lime fails text-contrast, use `accent-strong` (#52700A) for lime-coloured text and icons, and `accent-subtle` for tinted states like the active nav item. Semantic colours map directly to verification findings: `success` = conforms, `warning` = minor gap, `error` = major gap or a failed gate, `info` = insufficient information. The five **tier** colours form a metallic ladder — `tier-not-certified` (muted brick), `tier-bronze`, `tier-silver`, `tier-gold` (reusing the alkatera gold), and `tier-platinum` (a cool steel-blue that sits visually apart from silver) — each paired with `on-metal-light` or `on-metal-dark` for legible text.

## Typography

Three families do distinct jobs. **Playfair Display**, a high-contrast transitional serif, carries `display`, `h1`, and `h2` — it gives the product its editorial, report-like authority and is the single biggest point of difference from the all-sans alkatera app. **Inter** handles everything readable at length: `h3` (a sans subhead for clarity where a serif would feel heavy), `body`, `body-sm`, and `caption`. **IBM Plex Mono** powers `label` (uppercase, letter-spaced 0.08em, for section eyebrows and metadata like standard clauses and dates) and `data` (for figures, emission values, and calculation checks, where monospaced alignment aids scanning). The pairing logic: serif to state, sans to explain, mono to enumerate. Headlines set tight (line-height ~1.05–1.15, slightly negative tracking); body sets open (1.55) for comfortable reading of dense findings.

## Layout

Spacing follows a 4px base scale (`1`=4px through `8`=64px), keeping vertical rhythm consistent and predictable. Density is **comfortable, not cramped**: verification results are information-heavy, so generous padding (`5`/24px inside cards, `6`/32px between major sections) keeps clause-by-clause findings legible. Content sits in a single readable column (max ~880px for report and findings views) rather than a wide multi-column dashboard — the reading experience is the product. Use `4`/16px as the default gap between related elements, `2`/8px for tight inline groupings (label above value), and `7`/48px to separate distinct report sections.

## Elevation & Depth

Depth comes from **borders and surface contrast, not heavy shadows** — this keeps the audit-document feel flat, honest, and print-like. Cards are defined by a 1px `border` hairline over a `surface` fill that sits one step lighter than the paper `background`. Reserve a single soft shadow (0 1px 2px rgba(28,27,24,0.06), 0 4px 12px rgba(28,27,24,0.04)) only for genuinely floating elements: modals, dropdowns, and toasts. Never stack shadows to fake hierarchy; if two things need separating, use spacing or a border first.

## Shapes

Corner radius is restrained and consistent: `md` (10px) for cards, inputs, and panels — soft enough to feel modern, sharp enough to feel precise; `sm` (6px) for small inset elements like finding rows and code/data chips; `full` (9999px) for pills — buttons, the active nav item, and every tier badge. The mix signals the brand: rounded-but-controlled, never bubbly. Tier badges are always fully rounded pills so the certification result reads as a discrete, stamp-like mark.

## Components

**Buttons** are pill-shaped (`rounded.full`) with mono `label` type. `button-primary` fills with lime and ink text for the one key action on a screen (Verify, Upgrade); `button-primary-hover` darkens the lime to #A9D400. `button-secondary` is a bordered white pill (add a 1px `border-strong` outline in implementation — the schema has no border token) for secondary actions; `button-ghost` is text-only for tertiary actions. **input-text** is a white field with a `border` hairline, `md` radius, and a lime focus ring (`accent-strong`). **card** and **card-muted** are the primary containers — white or sunken, hairline border, `md` radius. **label** renders uppercase mono eyebrows in `on-surface-subtle`. **nav-item-active** uses the `accent-subtle` tint with `accent-strong` text. The five **badge-tier-*** components are the signature element: fully-rounded metallic pills, each carrying the tier name in mono label type. The four **finding-*** components share a white card body with `sm` radius and a 3px left border in their semantic colour — `success` (conforms), `warning` (minor gap), `error` (major gap), `info` (insufficient information) — so a reader can scan severity down the left edge; each shows the standard + clause (label), a plain-English summary (body), and a recommendation (body-sm).

## Do's and Don'ts

**Do**
- Lead with ink and paper; let lime appear once or twice per screen as emphasis, not as a background.
- Use the serif for headlines and section titles to reinforce the authoritative, report-like voice.
- Show every verdict with its reasoning attached — pair each tier and finding with its cited clause and plain-English explanation.
- Use the semantic finding colours consistently: green conforms, amber minor, red major, blue insufficient.
- Keep depth flat: borders and spacing first, one soft shadow only for floating layers.

**Don't**
- Don't flood the UI with lime or use bright lime for body text (it fails contrast) — use `accent-strong` for lime text.
- Don't present a tier badge as a decorative score with no visible justification — that breaks the "fiercely transparent" promise.
- Don't introduce heavy drop shadows, gradients-for-drama, or marketing-style hero flourishes.
- Don't set long-form body copy in the serif, or mix a second serif — Playfair is for display only.
- Don't add new ad-hoc colours for tiers or states; extend the token set instead so the ladder stays legible.
