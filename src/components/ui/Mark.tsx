/**
 * The Verifier's maker's mark (docs/design.md § the marks): a ring with a
 * tick — the alkatera·OS assistant "ring" riffed into a verification stamp,
 * distinct from the four brand-room marks. Inherits currentColor.
 *
 * `glyph` — small, crisp, for the band. `watermark` — large, cropped by a
 * page corner at low opacity, a chop mark behind content.
 */
export function Mark({
  className = "",
  strokeWidth = 8,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
      className={className}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="50" cy="50" r="38" />
      <path d="M33 51 L45 64 L69 37" />
    </svg>
  );
}

/**
 * The mark as a page-corner watermark: 8% on paper, behind content.
 * Place inside a `relative overflow-hidden` surface.
 */
export function WatermarkMark({
  className = "",
  corner = "br",
}: {
  className?: string;
  corner?: "br" | "bl" | "tr" | "tl";
}) {
  const pos = {
    br: "-bottom-10 -right-10",
    bl: "-bottom-10 -left-10",
    tr: "-top-10 -right-10",
    tl: "-top-10 -left-10",
  }[corner];
  return (
    <Mark
      strokeWidth={6}
      className={`pointer-events-none absolute ${pos} h-40 w-40 opacity-[0.08] ${className}`}
    />
  );
}
