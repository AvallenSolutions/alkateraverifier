# Vision — alkatera LCA Verifier

> Captured by the Product Planner skill. This file is the source of truth for
> generating product-vision.md, prd.md, and product-roadmap.md. Edit it directly
> and re-run the Product Planner to regenerate downstream documents.

**Created:** 2026-07-01
**Updated:** 2026-07-01

## Founder

- **Name:** Tim Etherington-Judge
- **Expertise:** Founder at alkatera. Deep specialism in drinks-industry sustainability, life cycle assessment (LCA) methodology, carbon and water footprinting, and the international standards that govern credible environmental claims (ISO 14040/44, ISO 14067, ISO 14046, GHG Protocol, PAS 2050).
- **Background:** I built alkatera, a sustainability platform that produces LCAs for drinks brands. In doing so I saw the same gap repeatedly: an LCA is only as trustworthy as its verification, and formal ISO 14044 critical review is slow, expensive, inconsistent, and out of reach for most brands. Every report ends up carrying a "Critical Review: Not Conducted" caveat. I know exactly where LCAs go wrong because I have generated hundreds of them, so I am building the independent verifier that closes the credibility gap for any LCA, from any platform.

## Purpose

- **Who you help:** Drinks and consumer-product brands (and the consultants and platforms serving them) who hold an LCA and need independent, standards-referenced verification before they make public sustainability claims. The verifier is platform-agnostic: it checks LCAs produced by alkatera or any other tool or consultancy.
- **Problem you solve:** An unverified LCA cannot credibly support public claims. Formal ISO 14044 critical review is slow (weeks), costly (thousands), inconsistent between reviewers, and opaque. Brands are left either making claims on shaky ground (greenwashing risk) or paying heavily for a review they cannot easily interpret.
- **Desired transformation:** From "we have an LCA we are nervous to stand behind" to "we have an independently verified LCA, graded against the standards we chose, with every finding shown in plain English and traced to the exact clause it was checked against."
- **Why you:** I built the LCA engine at alkatera, so I understand the methodology from the inside and know precisely where calculations, boundaries, allocation, and data quality tend to fail. I can encode that expertise into a verifier that is rigorous, fast, and radically transparent, which no generic tool or time-poor consultant can match at this price point.

## Product

- **Name:** alkatera LCA Verifier
- **One-liner:** alkatera LCA Verifier independently checks any LCA against the international standards you choose and grades it for quality, with every finding shown in plain English and traced to the exact clause.
- **How it works:** A brand uploads their LCA (a PDF from any platform, or connected directly from the alkatera platform via API). They select which standards to verify against (ISO 14040/44, ISO 14067, ISO 14046, GHG Protocol, PAS 2050, SBTi, CDP, EU Green Claims Directive, and more). The verification engine parses the report, re-checks the calculations, tests each requirement clause by clause, and returns a transparent verification report: a tiered certification (Bronze / Silver / Gold), a clause-level findings list marking conforms / minor gap / major gap, the specific failures and how to fix them, and a shareable verification badge. Every grade shows its working.
- **Key capabilities:**
  - Ingest an LCA from any source (PDF upload from any platform, or direct API connection from the alkatera platform)
  - User-selectable standards: verify against ISO 14040/44, ISO 14067, ISO 14046, GHG Protocol, PAS 2050, plus global frameworks (SBTi, CDP, EU Green Claims Directive)
  - Recompute and cross-check the LCA's calculations (mass balance, allocation, characterisation, GHG totals, biogenic/fossil split, EoL credits)
  - Tiered certification (Bronze / Silver / Gold) with fiercely transparent, clause-referenced reasoning for every grade
  - Generate a downloadable verification report plus a public-facing verification badge and certificate
- **Platform:** web
- **Market differentiation:** Unlike human LCA critical review (slow, expensive, inconsistent, opaque) and unlike a platform's own internal self-check (not independent), the alkatera LCA Verifier is instant, low cost, platform-agnostic, and fiercely transparent. It never issues a black-box score: every grade is traced to the clause it was checked against and the reason it landed there. It is the independent second opinion for the whole market, not just alkatera's own reports.
- **Magic moment:** A brand uploads their LCA, selects their standards, and within minutes receives an independent verification report with a clear certification tier and a plain-English, clause-by-clause list of exactly what passed, what failed, and how to fix it, work that previously took weeks and thousands of pounds.

## Audience

- **Primary user:** A sustainability or brand lead at a small-to-mid drinks brand (for example Happy Curations, maker of UNROOTED shots). They have commissioned or generated an LCA, want to put a carbon or environmental claim on-pack or in marketing, and need confidence it will withstand scrutiny. They are not LCA experts and need the verdict in language they can act on and defend.
- **Secondary users:**
  - LCA consultants and agencies who want a fast, independent second check on the studies they produce or review
  - Sustainability platforms (including alkatera) that want to route customers to an independent verification step
  - Retailers, investors, and buyers who need to assess the credibility of a supplier's environmental claims
- **Current alternatives:** Formal ISO 14044 third-party critical review (external expert or panel), generic LCA consultants, a platform's own internal/automated compliance check, or simply publishing claims unverified and hoping.
- **Frustrations:** Formal review is slow, costly, and inconsistent between reviewers. Internal checks are not independent and carry no credibility. Consultants vary widely in rigour and rarely show their working. Nothing on the market is fast, affordable, platform-agnostic, and transparent about exactly why a study passes or fails.

## Business

- **Revenue model:** freemium
- **90-day goal:** Launched publicly as a low-cost, fiercely transparent service. A free basic check driving inbound traffic, a working paid tier producing full verification reports and badges, and the first cohort of brands (starting with alkatera users) verifying real LCAs and generating referral traffic back to alkatera.
- **6-month vision:** Established as the go-to independent LCA verification service in the drinks industry, verifying LCAs from multiple platforms and consultancies, with a recognised verification badge that brands display publicly, and a steady inbound funnel feeding the alkatera platform.
- **Constraints:** Must be genuinely low cost to run and to buy, since its strategic purpose is to support existing alkatera users and drive traffic rather than to be a high-margin product. Must be fiercely transparent in every output. Built and maintained lean, with Claude Code (Fable 5 model) as the primary build tool.
- **Go-to-market:** Public launch positioned as free, independent, and transparent LCA verification. Drive inbound via the free basic check, content on LCA credibility and the EU Green Claims Directive, and cross-promotion from the alkatera platform and Tim's industry presence. Verified badges act as organic distribution as brands display them.

## Brand Voice

- **Personality:** The rigorous, independent expert who refuses to hide behind jargon or black-box scores. Authoritative on methodology, radically transparent in delivery, and firmly on the side of credible claims over greenwashing. Trustworthy, exacting, and refreshingly clear.
- **Tone of voice:** Authoritative rigour in the methodology, plain English in the outputs, transparency throughout. Never issues a verdict without showing its working. Example finding: "Major gap — ISO 14044 §4.2.3.6. All 14 inputs rely on secondary data, so data quality cannot reach Gold. To improve: collect primary data from your top 3 contributors." Example pass: "Conforms — ISO 14067 §6.4.9.3. Biogenic CO₂ is correctly reported separately from fossil CO₂."

> Visual identity (mood, anti-patterns, design tokens) is deliberately not
> captured here — it lives in docs/design.md, generated by the Design System
> skill from image references.

## Tech Stack

- **App type:** web
- **Frontend:** Next.js (App Router) with TypeScript — best-in-class for web apps with server-side document processing, strong AI coding-tool support, deploys cleanly to Vercel
- **Backend:** Next.js server actions and route handlers on Vercel — colocated with the frontend, serverless, handles PDF ingestion and verification orchestration without separate infrastructure
- **Database:** Supabase (Postgres) — stores verification records, standards definitions, findings, and certification history; SQL is well suited to auditable, structured verification data
- **Auth:** Supabase Auth — integrated with the database, email and social login, generous free tier keeps running cost low
- **Payments:** Stripe — supports the freemium model with paid per-verification and report/badge tiers; industry-standard and low friction
- **Analytics:** PostHog — free tier covers early volume, funnels and feature flags help optimise the free-to-paid inbound path
- **Email:** Resend — transactional email for auth, verification-complete notifications, and report delivery; clean fit with Next.js
- **Error tracking:** Sentry — catch production issues early on a lean, single-maintainer product

## Tooling

- **Coding agent:** Claude Code
