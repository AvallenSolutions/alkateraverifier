import type { FindingResult } from "@/types/verification";
import { FindingState, FINDING_EDGE } from "./StateText";

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
 * One clause finding (docs/design.md § state-text, fact-row): a cream panel
 * with a hairline and a semantic left edge in the finding's tone; the state
 * is typographic mono (no pill). Reasoning and recommendation reveal on
 * approach. <details> keeps it keyboard-accessible with no JS.
 */
export function FindingItem({ finding }: { finding: FindingView }) {
  return (
    <details
      className={`group rounded-sm border border-border border-l-[3px] bg-surface ${FINDING_EDGE[finding.result]}`}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-4 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="font-mono text-label uppercase text-on-surface-subtle">
            {finding.standardName} §{finding.clauseRef}
          </span>
          <span className="mt-1.5 block text-body text-ink">
            {finding.plainSummary}
          </span>
        </span>
        <span className="mt-0.5 shrink-0">
          <FindingState result={finding.result} />
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
