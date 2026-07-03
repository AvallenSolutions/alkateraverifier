/**
 * Pill actions (docs/design.md § kit of parts). Ink is the default act,
 * outline the second, the reserved teal accent marks the one act the
 * Verifier exists for (Verify), ghost for the rest. Radius full, mono label.
 */
export type ButtonVariant = "primary" | "accent" | "outline" | "ghost";

const BASE =
  "inline-flex items-center justify-center rounded-full font-mono text-label uppercase transition-colors duration-150 ease-studio disabled:cursor-not-allowed disabled:opacity-40";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-ink text-on-ink px-5 py-3 hover:bg-ink/90",
  accent: "bg-accent text-on-accent px-5 py-3 hover:bg-accent-hover",
  outline:
    "border border-border-strong bg-surface text-ink px-5 py-3 hover:bg-surface-sunken",
  ghost: "bg-transparent text-on-surface-muted px-4 py-2.5 hover:text-ink",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  extra = "",
): string {
  return `${BASE} ${VARIANTS[variant]} ${extra}`.trim();
}
