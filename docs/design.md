---
version: v1
name: alkatera Verifier — studio language
description: The alkatera·OS studio design language, adapted for the independent LCA Verifier. Warm gallery-grey paper, cream panels and hairlines, ink-led as an incorruptible auditor, one reserved teal accent, statement headlines in Space Grotesk, mono annotation, and a typographic certification ladder. A gallery, not a dashboard.
colors:
  background: "#ECEAE3"        # paper — the ground of every surface
  surface: "#F2F1EA"           # cream — panels; text and marks on colour
  surface-sunken: "#E4E1D7"    # a deeper cream for recessed/muted panels
  ink: "#1A1B1D"               # text, actions, the shell bands
  on-ink: "#F2F1EA"            # cream text on ink / on saturated blocks
  on-surface-muted: "#565650"  # dim — quiet text on paper (AA)
  on-surface-subtle: "#605F58" # meta — times, ages, hexes at the margins (AA)
  border: "#D9D6CB"            # hairline — rules and panel borders
  border-strong: "#C9C5B8"     # a firmer hairline for emphasis
  # The reserved Verifier accent — deliberately NOT one of the four brand rooms.
  # Ink-led auditor with a single teal act. (Default; 2–3 swatches to confirm.)
  accent: "#0B6E5E"
  accent-strong: "#0A5F52"     # accent as text/eyebrows on paper (AA)
  accent-subtle: "#D9E8E3"     # tinted states (active tab wash)
  on-accent: "#F2F1EA"         # cream text on the accent fill
  # The four brand rooms — available, but the Verifier does not claim one.
  forest: "#205E40"
  cobalt: "#2B46C0"
  ochre: "#DFA32B"
  ochre-ink: "#A97C14"         # ochre's paper-safe accent form
  brick: "#BF4B2A"
  on-colour: "#F2F1EA"         # cream text on any saturated block
  # Working tones — states, never decoration. -ink forms are AA as text on paper.
  tone-good: "#047857"
  tone-good-ink: "#036B4E"
  tone-attention: "#9A4708"
  tone-lost: "#BE123C"
  tone-lost-ink: "#A81E2E"
  tone-hold: "#6D28D9"
  tone-hold-ink: "#5B21B6"
  # The certification ladder — typographic (no pills). Five distinct, AA-as-text tones.
  tier-not-certified: "#A81E2E"
  tier-bronze: "#8A5A22"
  tier-silver: "#59636E"
  tier-gold: "#856009"
  tier-platinum: "#3E5C76"
typography:
  statement:
    fontFamily: "Space Grotesk"
    fontSize: 56px
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: -0.035em
  h1:
    fontFamily: "Space Grotesk"
    fontSize: 34px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -0.02em
  h2:
    fontFamily: "Space Grotesk"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.02em
  big-number:
    fontFamily: "Space Grotesk"
    fontSize: 30px
    fontWeight: 700
    lineHeight: 1.0
    fontVariantNumeric: "tabular-nums"
  card-title:
    fontFamily: "Space Grotesk"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "Inter"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Inter"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  eyebrow:
    fontFamily: "JetBrains Mono"
    fontSize: 10px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.22em
  meta:
    fontFamily: "JetBrains Mono"
    fontSize: 10.5px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.02em
rounded:
  none: 0
  sm: 4px
  md: 6px       # panels, inputs, cards — the studio radius
  lg: 10px
  full: 9999px  # pills — every action; tabs' hit area
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
motion:
  ease: "cubic-bezier(0.2, 0.8, 0.2, 1)"   # the studio ease — brisk, settles soft
  hover: "150ms"
  fact-reveal: "280ms"                     # rise 6px + fade, delay 160ms
  grid-reweight: "450ms"
  mark-wake: "500ms"                       # rotate 8°, scale 1.1
components:
  band-shell:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    note: "Sticky top + bottom ink bands. Top: wordmark + mark + mono tabs (3px active underline). Bottom: independence/scope strip + quick actions. No desk-link into alkatera·OS — the Verifier is a standalone house."
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
    note: "Ink is the default act."
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
    note: "The one act the Verifier exists for: Verify."
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
    note: "The second act. 1px border-strong."
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.full}"
    padding: "10px 14px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "{spacing.5}"
    note: "Cream, 1px hairline, radius 6. Hairlines, not boxes."
  accent-panel:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
    padding: "{spacing.5}"
    note: "The one saturated block per surface — used sparingly; the Verifier is ink-led."
  input-text:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  tab:
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.eyebrow}"
    note: "Mono caps; active carries a 3px accent underline."
  eyebrow:
    textColor: "{colors.on-surface-subtle}"
    typography: "{typography.eyebrow}"
  big-number:
    textColor: "{colors.ink}"
    typography: "{typography.big-number}"
    note: "Tabular. A mono label sits beneath at 9.5px, +20% tracking, 70% opacity. Never a number without its label."
  state-text:
    typography: "{typography.eyebrow}"
    note: "States are typographic: small bold mono in a working tone. No badge pills, no backgrounds; the word and its colour are enough."
  tier:
    typography: "{typography.statement}"
    note: "The verdict is a big Space Grotesk word in its tier tone over a mono label. No pill, no saturated block."
  fact-row:
    note: "Bold subject (Space Grotesk SemiBold), mono meta right, hairline separator. Reveals detail on approach."
---

# alkatera Verifier Design System — the studio language

## Overview

The alkatera LCA Verifier wears the alkatera·OS **studio** design language, adapted for a standalone, single-purpose tool. It is a **gallery, not a dashboard**: every surface is a poster with one statement, a few honest numbers, and quiet detail that reveals itself on approach. The ground is warm **gallery grey**; colour is spent in single, saturated blocks, rarely. Everything else is ink, cream and hairlines.

The Verifier is a **house of its own**, not a room on the alkatera desk. Where the OS has five coloured rooms (Today, Sell, Comms, Studio, Settings), the Verifier is deliberately **ink-led** — the incorruptible auditor — with a single reserved **teal** accent for its one act, "Verify". Its independence is carried structurally: no desk-link back into alkatera·OS, a standing independence-and-scope strip in the bottom band, its own maker's mark, and the promise "we will even fail our own reports" kept in view. It is by alkatera, but it stands apart.

## Colours

The ground is warm gallery grey (`background` #ECEAE3). `surface` (#F2F1EA) is the cream of panels; `border` (#D9D6CB) is the hairline that separates them. `ink` (#1A1B1D) carries text, actions, and the sticky shell bands; `on-surface-muted` (dim, #6F6F68) is quiet text, `on-surface-subtle` the mono margins. Text on any saturated block or ink band is **cream or ink only** — never mid-greys.

The reserved **accent** is a deep teal (#0B6E5E), the Verifier's own colour, distinct from the four brand rooms. It fills the one act (Verify) with cream text, and — as `accent-strong` (#0A5F52) — colours eyebrows, active tabs and key links on paper. The four brand rooms (forest, cobalt, ochre, brick) are defined but the Verifier does not claim one.

**Working tones** are for states, never decoration: good, attention, lost, on-hold. Each has an `-ink` form tuned to pass AA as small text on paper (mirroring how ochre takes #A97C14 on paper). The **certification ladder** is typographic — five distinct tier tones, chosen to stay both legible as text on grey and separable across the metallic steps: not-certified (red), bronze, silver (cool grey), gold, platinum (steel blue).

## Typography — three voices

**Space Grotesk speaks, Inter explains, JetBrains Mono annotates.** `statement` (Space Grotesk Bold, 40–68px, leading 0.95, tracking -3.5%) is the surface's one sentence, ending in a full stop. `big-number` is Space Grotesk Bold and **always tabular**, with a mono label beneath at 9.5px, +20% tracking, 70% opacity — never a number without its label. `card-title` is Space Grotesk SemiBold for names. `body` is Inter for sentences and quiet detail. `eyebrow` (JetBrains Mono Bold, caps, +22%) marks sections, tabs and number labels; `meta` (JetBrains Mono) holds times, ages and hexes. The wordmark is always lowercase — alka in medium, **tera** in bold — here as "alka**tera** verifier", never alkatera·OS.

## The marks

The Verifier signs its surfaces with one geometric **maker's mark** (a verification stamp — geometry to be finalised), cropped by a page corner like a chop mark on a print. On paper: 8% opacity, behind content, one per surface. On a saturated block: cream at 20%, waking to 28% with a small rotation on hover. The mark never carries meaning; it is a signature, not an icon.

## Anatomy of a surface — band, statement, paper, band

The app shell is the studio room anatomy, adapted:

- **The top band** (52px, ink, sticky): the "alka**tera** verifier" wordmark, the mark, and the Verifier's surfaces as mono tabs (Verify · Dashboard · Settings — active carries a 3px accent underline), with a live mono note on the right. No desk-link — the independence signal.
- **The statement**: an eyebrow in the accent, then the surface's one sentence — the tier and score on a result, the count on the dashboard — with supporting figures standing right, display-bold over mono labels.
- **The paper**: work happens on gallery grey. Cream panels, hairline borders, radius 6. At most one saturated block per surface, and on the ink-led Verifier usually none.
- **The bottom band** (ink, sticky): repurposed from the OS assistant band into the Verifier's **standing independence-and-scope strip** — "Independent · we verify any LCA, and we fail our own · every finding cites its clause" — plus quick actions (Verify an LCA, cmd-K).

## The kit of parts

**Actions** are pills, radius full. **Ink is the default act**; **outline** is the second act; the **accent** (teal) marks the one act the Verifier exists for (Verify); **ghost** for the rest. Lime is gone. **Tabs** are mono caps with a 3px accent rule under the active one. **Panels** are cream with a hairline at radius 6; the **accent panel** is the one saturated block, used sparingly. The **big number** is display-bold and tabular over a 70% mono label. **States are typographic** — small bold mono in a working tone, no pills, no backgrounds; the word and its colour are enough. The **tier** follows the same rule at statement scale: the verdict is a big word in its tier tone over a mono label, never a badge. **Fact rows** are a bold subject with mono meta to the right, separated by hairlines, revealing detail on approach.

## Motion — layouts that breathe

Nothing bounces and nothing spins; space itself moves. The **studio ease** is `cubic-bezier(0.2, 0.8, 0.2, 1)` — brisk, then settles soft, like a drawer on a damper. Tracks re-weight toward attention (the breathing grid, hovered track 1fr → 1.85fr, 450ms); facts rise 6px and fade in (280ms, delay 160ms); marks wake with a small rotate and scale (500ms); hover lift and colour are 150–200ms. `prefers-reduced-motion` is respected: when set, none of this moves.

## Voice

Statements, full stops. British English, always (colour, prioritise, organise; dates as 3 July, times as 14:00). **Never an em dash** — a comma, parentheses, a colon or a full stop; the middle dot (·) separates mono facts. The wordmark is always lowercase with **tera** in bold. Rooms and surfaces have plain names with a little pride. Quiet honesty: empty states say what is true and what to do next; nothing cheers, nothing apologises twice.

## Do's and don'ts

**Do**
- Lead with the number that matters, display-bold over a mono label.
- Keep to gallery grey, cream and hairlines; spend the accent once or twice per surface.
- Render every verdict and state typographically, with its colour carrying the meaning.
- Keep the independence signal visible: no OS desk-link, the standing scope strip, "we fail our own".

**Don't**
- Don't reintroduce lime, serifs, drop shadows for drama, or nested boxes.
- Don't put a number without its mono label, or a state in a filled pill.
- Don't claim one of the four brand-room colours; the Verifier is ink-led with its own teal.
- Don't add ad-hoc colours; extend this defined token set instead so the ladders stay legible.
