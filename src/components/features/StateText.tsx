import type { FindingResult } from "@/types/verification";

/**
 * Typographic states (docs/design.md § state-text): small bold mono in a
 * working tone. No badge pills, no backgrounds; the word and its colour
 * are enough. -ink tones are AA as text on paper.
 */
const RESULT_STYLES: Record<FindingResult, { label: string; className: string }> = {
  conforms: { label: "Conforms", className: "text-tone-good-ink" },
  minor_gap: { label: "Minor gap", className: "text-tone-attention" },
  major_gap: { label: "Major gap", className: "text-tone-lost-ink" },
  insufficient_info: {
    label: "Insufficient info",
    className: "text-tone-hold-ink",
  },
};

export function FindingState({ result }: { result: FindingResult }) {
  const style = RESULT_STYLES[result];
  return (
    <span className={`font-mono text-label uppercase ${style.className}`}>
      {style.label}
    </span>
  );
}

export function PassFail({ passed }: { passed: boolean }) {
  return (
    <span
      className={`font-mono text-label uppercase ${
        passed ? "text-tone-good-ink" : "text-tone-lost-ink"
      }`}
    >
      {passed ? "Pass" : "Fail"}
    </span>
  );
}

/** The left-edge tone for a finding row (hairline accent, not a border box). */
export const FINDING_EDGE: Record<FindingResult, string> = {
  conforms: "border-l-tone-good-ink",
  minor_gap: "border-l-tone-attention",
  major_gap: "border-l-tone-lost-ink",
  insufficient_info: "border-l-tone-hold-ink",
};
