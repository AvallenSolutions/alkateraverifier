/**
 * The big number (docs/design.md § big-number): display-bold and tabular,
 * with a mono label beneath at 9.5px, +20% tracking, 70% opacity. Never a
 * number without its label.
 */
export function BigNumber({
  value,
  label,
  className = "",
  tone = "text-ink",
}: {
  value: React.ReactNode;
  label: string;
  className?: string;
  tone?: string;
}) {
  return (
    <div className={className}>
      <div className={`font-display text-big-number tabular ${tone}`}>
        {value}
      </div>
      <div
        className="mt-1 font-mono uppercase text-on-surface-muted"
        style={{ fontSize: "9.5px", letterSpacing: "0.2em" }}
      >
        {label}
      </div>
    </div>
  );
}
