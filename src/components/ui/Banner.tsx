// Hairline left edge in a working tone; the panel stays cream (docs/design.md).
const VARIANTS = {
  info: { edge: "border-l-accent-strong", title: "text-accent-strong" },
  warning: { edge: "border-l-tone-attention", title: "text-tone-attention" },
  error: { edge: "border-l-tone-lost-ink", title: "text-tone-lost-ink" },
} as const;

export function Banner({
  variant,
  title,
  children,
}: {
  variant: keyof typeof VARIANTS;
  title?: string;
  children: React.ReactNode;
}) {
  const style = VARIANTS[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-sm border border-border border-l-[3px] bg-surface px-4 py-3 ${style.edge}`}
    >
      {title ? (
        <p className={`font-mono text-label uppercase ${style.title}`}>
          {title}
        </p>
      ) : null}
      <div className={`text-body-sm text-ink ${title ? "mt-1" : ""}`}>
        {children}
      </div>
    </div>
  );
}
