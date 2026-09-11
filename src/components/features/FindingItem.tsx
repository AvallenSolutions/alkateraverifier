import type { FindingResult } from "@/types/verification";

const RESULT_STYLES: Record<
  FindingResult,
  { label: string; border: string; chip: string }
> = {
  conforms: {
    label: "Conforms",
    border: "border-l-success",
    chip: "bg-success text-on-success",
  },
  minor_gap: {
    label: "Minor gap",
    border: "border-l-warning",
    chip: "bg-warning text-on-warning",
  },
  major_gap: {
    label: "Major gap",
    border: "border-l-error",
    chip: "bg-error text-on-error",
  },
  insufficient_info: {
    label: "Insufficient info",
    border: "border-l-info",
    chip: "bg-info text-on-info",
  },
};

export interface FindingView {
  id: string;
  standardName: string;
  clauseRef: string;
  result: FindingResult;
  plainSummary: string;
  reasoning: string;
  recommendation: string | null;
}

/**
 * One clause finding (design.md finding-* components): semantic left
 * border, mono clause label, plain-English summary, expandable reasoning
 * and recommendation. <details> keeps it keyboard-accessible with no JS.
 */
export function FindingItem({ finding }: { finding: FindingView }) {
  const style = RESULT_STYLES[finding.result];

  return (
    <details
      className={`group rounded-sm border border-border border-l-[3px] bg-surface ${style.border}`}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="font-mono text-label uppercase text-on-surface-subtle">
            {finding.standardName} §{finding.clauseRef}
          </span>
          <span className="mt-1 block text-body text-ink">
            {finding.plainSummary}
          </span>
        </span>
        <span
          className={`mt-0.5 shrink-0 rounded-full px-3 py-1 font-mono text-label uppercase ${style.chip}`}
        >
          {style.label}
        </span>
      </summary>
      <div className="border-t border-border px-4 py-3">
        <p className="font-mono text-label uppercase text-on-surface-subtle">
          Reasoning
        </p>
        <p className="mt-1 text-body-sm text-on-surface-muted">
          {finding.reasoning}
        </p>
        {finding.recommendation ? (
          <>
            <p className="mt-3 font-mono text-label uppercase text-on-surface-subtle">
              To improve
            </p>
            <p className="mt-1 text-body-sm text-on-surface-muted">
              {finding.recommendation}
            </p>
          </>
        ) : null}
      </div>
    </details>
  );
}
