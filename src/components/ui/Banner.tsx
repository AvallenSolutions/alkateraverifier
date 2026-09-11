const VARIANTS = {
  info: "border-l-info",
  warning: "border-l-warning",
  error: "border-l-error",
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
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-sm border border-border border-l-[3px] bg-surface-sunken px-4 py-3 ${VARIANTS[variant]}`}
    >
      {title ? (
        <p className="font-mono text-label uppercase text-on-surface-subtle">
          {title}
        </p>
      ) : null}
      <div className={`text-body-sm text-ink ${title ? "mt-1" : ""}`}>
        {children}
      </div>
    </div>
  );
}
