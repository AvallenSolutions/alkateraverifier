import type { Config } from "tailwindcss";

/**
 * Design tokens from docs/design.md — the alkatera·OS studio language,
 * adapted for the Verifier: gallery-grey paper, cream panels, hairlines,
 * ink-led with one reserved teal accent, Space Grotesk / Inter / JetBrains
 * Mono, and a typographic certification ladder.
 *
 * Existing utility names (text-display, text-label, bg-accent, tier-*, …)
 * are kept but remapped to studio values so surfaces migrate incrementally;
 * new names (statement, big-number, eyebrow, meta, tone-*) are the target.
 * Do not add ad-hoc values without extending docs/design.md first.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#ECEAE3", // paper
        surface: "#F2F1EA", // cream
        "surface-sunken": "#E4E1D7",
        ink: "#1A1B1D",
        "on-ink": "#F2F1EA",
        "on-surface-muted": "#565650", // dim, AA on paper
        "on-surface-subtle": "#605F58", // meta margins, AA on paper
        border: "#D9D6CB", // hairline
        "border-strong": "#C9C5B8",

        // Reserved Verifier accent — teal, not one of the four brand rooms.
        accent: "#0B6E5E",
        "on-accent": "#F2F1EA",
        "accent-hover": "#0A5F52",
        "accent-strong": "#0A5F52",
        "accent-subtle": "#D9E8E3",

        // Cream text on any saturated block / ink band.
        "on-colour": "#F2F1EA",
        "on-metal-light": "#F2F1EA",
        "on-metal-dark": "#1A1B1D",

        // The four brand rooms (defined; the Verifier does not claim one).
        forest: "#205E40",
        cobalt: "#2B46C0",
        ochre: "#DFA32B",
        "ochre-ink": "#A97C14",
        brick: "#BF4B2A",

        // Working tones — states only. -ink forms are AA as text on paper.
        "tone-good": "#047857",
        "tone-good-ink": "#036B4E",
        "tone-attention": "#9A4708",
        "tone-lost": "#BE123C",
        "tone-lost-ink": "#A81E2E",
        "tone-hold": "#6D28D9",
        "tone-hold-ink": "#5B21B6",

        // Legacy semantic aliases → tones (kept until every surface migrates).
        success: "#047857",
        "on-success": "#F2F1EA",
        warning: "#9A4708",
        "on-warning": "#F2F1EA",
        error: "#BE123C",
        "on-error": "#F2F1EA",
        info: "#3E5C76",
        "on-info": "#F2F1EA",

        // Certification ladder — typographic tones, AA as text on paper.
        "tier-not-certified": "#A81E2E",
        "tier-bronze": "#8A5A22",
        "tier-silver": "#59636E",
        "tier-gold": "#856009",
        "tier-platinum": "#3E5C76",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Space Grotesk voices
        statement: [
          "56px",
          { lineHeight: "0.95", letterSpacing: "-0.035em", fontWeight: "700" },
        ],
        display: [
          "56px",
          { lineHeight: "0.95", letterSpacing: "-0.035em", fontWeight: "700" },
        ],
        h1: [
          "34px",
          { lineHeight: "1.0", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        h2: [
          "22px",
          { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        h3: ["15px", { lineHeight: "1.2", fontWeight: "600" }],
        "card-title": ["14px", { lineHeight: "1.2", fontWeight: "600" }],
        "big-number": ["30px", { lineHeight: "1.0", fontWeight: "700" }],
        // Inter voices
        body: ["14px", { lineHeight: "1.5" }],
        "body-sm": ["13px", { lineHeight: "1.5" }],
        caption: ["12.5px", { lineHeight: "1.4" }],
        // JetBrains Mono voices
        data: ["14px", { lineHeight: "1.5" }],
        label: [
          "10px",
          { lineHeight: "1.2", letterSpacing: "0.22em", fontWeight: "700" },
        ],
        eyebrow: [
          "10px",
          { lineHeight: "1.2", letterSpacing: "0.22em", fontWeight: "700" },
        ],
        meta: [
          "10.5px",
          { lineHeight: "1.4", letterSpacing: "0.02em", fontWeight: "400" },
        ],
      },
      borderRadius: {
        sm: "4px",
        md: "6px", // the studio panel radius
        lg: "10px",
      },
      transitionTimingFunction: {
        studio: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      boxShadow: {
        // One soft shadow, reserved for genuinely floating layers (toast, modal).
        float: "0 1px 2px rgba(26,27,29,0.06), 0 8px 24px rgba(26,27,29,0.08)",
      },
      maxWidth: {
        content: "960px",
      },
    },
  },
};

export default config;
