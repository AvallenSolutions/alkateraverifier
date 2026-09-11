import type { Config } from "tailwindcss";

/**
 * Design tokens from docs/design.md — light, paper-toned, ink-led system.
 * Colours, type scale, radii, and elevation are defined there; do not add
 * ad-hoc values here without extending the design doc first.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FAF8F3",
        surface: "#FFFFFF",
        "surface-sunken": "#F1EFE7",
        ink: "#1C1B18",
        "on-surface-muted": "#5E5C55",
        "on-surface-subtle": "#6E6B62",
        border: "#E5E1D6",
        "border-strong": "#D3CEC1",
        accent: "#C2F000",
        "on-accent": "#1C1B18",
        "accent-hover": "#A9D400",
        "accent-strong": "#52700A",
        "accent-subtle": "#EDF6C8",
        success: "#3F7A34",
        "on-success": "#FFFFFF",
        warning: "#C08A1E",
        "on-warning": "#1C1B18",
        error: "#B4342A",
        "on-error": "#FFFFFF",
        info: "#3A6B8C",
        "on-info": "#FFFFFF",
        "tier-not-certified": "#A0554A",
        "tier-bronze": "#9A6532",
        "tier-silver": "#9CA3AC",
        "tier-gold": "#C6A02A",
        "tier-platinum": "#54707D",
        "on-metal-light": "#FFFFFF",
        "on-metal-dark": "#1C1B18",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        display: [
          "48px",
          { lineHeight: "1.05", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        h1: [
          "34px",
          { lineHeight: "1.1", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        h2: ["26px", { lineHeight: "1.15", fontWeight: "600" }],
        h3: ["18px", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["16px", { lineHeight: "1.55" }],
        "body-sm": ["14px", { lineHeight: "1.5" }],
        caption: ["13px", { lineHeight: "1.4" }],
        label: [
          "12px",
          { lineHeight: "1.2", letterSpacing: "0.08em", fontWeight: "500" },
        ],
        data: ["14px", { lineHeight: "1.5" }],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
      boxShadow: {
        // The single soft shadow reserved for floating layers (modals, dropdowns, toasts).
        float: "0 1px 2px rgba(28,27,24,0.06), 0 4px 12px rgba(28,27,24,0.04)",
      },
      maxWidth: {
        // Single readable column for report and findings views.
        content: "880px",
      },
    },
  },
};

export default config;
