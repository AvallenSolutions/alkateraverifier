import type { LcaExtraction } from "@/types/lca";

/**
 * Deterministic calculation cross-checks (TASK-024, FR-005).
 *
 * Recomputes core figures from the extracted report and reconciles them
 * against the printed values within tolerance. These feed the HARD gate in
 * FR-006: any breach → Not Certified. A check whose inputs the report does
 * not state is skipped (missing data is a clause finding, not a false
 * pass or a false failure).
 */

export interface CalculationCheckResult {
  check_name: string;
  reported_value: number | null;
  recomputed_value: number | null;
  unit: string;
  passed: boolean;
  tolerance_note: string;
}

/** FR-006 default reconciliation tolerance: ±2%. */
export const RELATIVE_TOLERANCE = 0.02;
/** Absolute floor so report rounding (3–4 decimal places) never fails tiny values. */
export const ABSOLUTE_TOLERANCE = 0.0005;

function withinTolerance(reported: number, recomputed: number): boolean {
  const allowed = Math.max(
    RELATIVE_TOLERANCE * Math.abs(reported),
    ABSOLUTE_TOLERANCE,
  );
  return Math.abs(recomputed - reported) <= allowed;
}

function toleranceNote(reported: number, recomputed: number): string {
  const diff = recomputed - reported;
  const relative =
    Math.abs(reported) > 1e-12
      ? ` (${((Math.abs(diff) / Math.abs(reported)) * 100).toFixed(1)}% difference)`
      : "";
  return `Recomputed ${recomputed.toFixed(4)} vs reported ${reported.toFixed(4)}${relative}; tolerance ±${(RELATIVE_TOLERANCE * 100).toFixed(0)}%.`;
}

function makeCheck(
  name: string,
  reported: number,
  recomputed: number,
  unit = "kg CO2e",
): CalculationCheckResult {
  return {
    check_name: name,
    reported_value: reported,
    recomputed_value: recomputed,
    unit,
    passed: withinTolerance(reported, recomputed),
    tolerance_note: toleranceNote(reported, recomputed),
  };
}

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);

export function runCalculationChecks(
  lca: LcaExtraction,
): CalculationCheckResult[] {
  const checks: CalculationCheckResult[] = [];
  const headline = lca.impacts.climateTotalKgCo2e;

  // 1. GHG species total vs headline climate figure.
  const speciesValues = lca.ghgSpecies
    .map((row) => row.co2eKg)
    .filter((value): value is number => value !== null);
  if (headline !== null && speciesValues.length > 0) {
    checks.push(
      makeCheck(
        "GHG species total vs headline",
        headline,
        sum(speciesValues),
      ),
    );
  }

  // 2. Lifecycle stage sum vs headline total.
  if (headline !== null && lca.lifecycleStages.length > 0) {
    checks.push(
      makeCheck(
        "Lifecycle stage sum vs total",
        headline,
        sum(lca.lifecycleStages.map((stage) => stage.kgCo2e)),
      ),
    );
  }

  // 3. Fossil + biogenic (+ LULUC) split vs all-species total.
  const { fossilKgCo2e, biogenicKgCo2e, lulucKgCo2e } = lca.impacts;
  const splitTotal = lca.ghgTotalAllSpeciesKgCo2e ?? headline;
  if (splitTotal !== null && fossilKgCo2e !== null && biogenicKgCo2e !== null) {
    checks.push(
      makeCheck(
        "Fossil/biogenic split vs total",
        splitTotal,
        fossilKgCo2e + biogenicKgCo2e + (lulucKgCo2e ?? 0),
      ),
    );
  }

  // 4. Net end-of-life = gross − credits (credits are negative).
  const { grossKgCo2e, creditsKgCo2e, netKgCo2e } = lca.endOfLife;
  if (grossKgCo2e !== null && creditsKgCo2e !== null && netKgCo2e !== null) {
    checks.push(
      makeCheck(
        "Net end-of-life = gross + credits",
        netKgCo2e,
        grossKgCo2e + creditsKgCo2e,
      ),
    );
  }

  return checks;
}
