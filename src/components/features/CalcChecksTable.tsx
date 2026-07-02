export interface CalcCheckView {
  id: string;
  checkName: string;
  reportedValue: number | null;
  recomputedValue: number | null;
  unit: string | null;
  passed: boolean;
  toleranceNote: string | null;
}

/** Trim float noise; reports print 3–4 decimal places. */
function formatValue(value: number | null): string {
  if (value === null) return "—";
  return Number(value.toFixed(4)).toString();
}

/** Deterministic reconciliation results (FR-005), mono-aligned for scanning. */
export function CalcChecksTable({ checks }: { checks: CalcCheckView[] }) {
  if (checks.length === 0) {
    return (
      <p className="text-body-sm text-on-surface-muted">
        No calculation cross-checks could be computed: the report does not
        state the figures needed to reconcile its totals.
      </p>
    );
  }

  return (
    <div
      className="overflow-x-auto"
      tabIndex={0}
      role="region"
      aria-label="Calculation cross-checks"
    >
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border-strong">
            {["Check", "Reported", "Recomputed", "Result"].map((heading) => (
              <th
                key={heading}
                className="py-2 pr-4 font-mono text-label uppercase text-on-surface-subtle"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {checks.map((check) => (
            <tr key={check.id} className="border-b border-border align-top">
              <td className="py-2.5 pr-4 text-body-sm text-ink">
                {check.checkName}
                {check.toleranceNote ? (
                  <span className="mt-0.5 block text-caption text-on-surface-subtle">
                    {check.toleranceNote}
                  </span>
                ) : null}
              </td>
              <td className="py-2.5 pr-4 font-mono text-data text-ink">
                {formatValue(check.reportedValue)}
              </td>
              <td className="py-2.5 pr-4 font-mono text-data text-ink">
                {formatValue(check.recomputedValue)}
              </td>
              <td className="py-2.5 pr-4">
                <span
                  className={`rounded-full px-3 py-1 font-mono text-label uppercase ${
                    check.passed
                      ? "bg-success text-on-success"
                      : "bg-error text-on-error"
                  }`}
                >
                  {check.passed ? "Pass" : "Fail"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
