import type { LcaExtraction } from "@/types/lca";
import type { Tier } from "@/types/verification";
import type { CalculationCheckResult } from "./calculations";
import type { EvaluatedFinding } from "./evaluate";

/**
 * Gates + scoring/tiering rubric (TASK-026) — implements FR-006 exactly.
 *
 * Stage 1 — Gates (all must pass, else not_certified):
 *  1. Calculation integrity (HARD): every computed reconciliation check
 *     passes (±2% tolerance, see calculations.ts).
 *  2. Goal & scope integrity: functional unit and system boundary present,
 *     and no major gap on ISO 14044 §4.2.
 *  3. No major methodological error: no major gap on allocation (§4.3.4),
 *     LCIA/characterisation (§4.4), or biogenic accounting (ISO 14067
 *     §6.4.9.3).
 *
 * Stage 2 — Tiers: any unresolved major gap (or an unanswered
 * major-severity clause) caps at Bronze; Silver needs "Good" data quality;
 * Gold needs high data quality + formal uncertainty AND sensitivity +
 * full impact coverage + negligible minors; Platinum = Gold + ≥70% of
 * impact backed by verified primary data.
 *
 * Critical review (ISO 14044 §6) is disclosed, never gated.
 *
 * Deterministic by construction: same findings/checks/extraction always
 * produce the same band and 0–100 score.
 */

export interface GateResult {
  key: "calculation_integrity" | "goal_scope_integrity" | "methodology";
  label: string;
  passed: boolean;
  detail: string;
}

export interface ScoreOutcome {
  tier: Tier;
  score: number;
  gates: GateResult[];
}

// Calibration constants (PRD § Open Questions: tuned against the fixtures).
const GOOD_DATA_QUALITY_SCORE = 65;
const HIGH_DATA_QUALITY_SCORE = 80;
const PLATINUM_PRIMARY_SHARE = 70;
const GOLD_MAX_MINOR_GAPS = 1;

const METHODOLOGICAL_CLAUSES = new Set([
  "ISO_14044:4.3.4",
  "ISO_14044:4.4",
  "ISO_14067:6.4.9.3",
]);

const TIER_SCORE_CAPS: Record<Tier, number> = {
  not_certified: 39,
  bronze: 69,
  silver: 84,
  gold: 94,
  platinum: 100,
};

const findingKey = (finding: EvaluatedFinding) =>
  `${finding.standard_code}:${finding.clause_ref}`;

function evaluateGates(
  findings: EvaluatedFinding[],
  calcChecks: CalculationCheckResult[],
  lca: LcaExtraction,
): GateResult[] {
  const failedChecks = calcChecks.filter((check) => !check.passed);
  const calculationIntegrity: GateResult = {
    key: "calculation_integrity",
    label: "Calculation integrity",
    passed: failedChecks.length === 0,
    detail:
      calcChecks.length === 0
        ? "No reconciliation checks could be computed from the reported figures."
        : failedChecks.length === 0
          ? `${calcChecks.length} of ${calcChecks.length} reconciliation checks passed within tolerance.`
          : `${failedChecks.length} reconciliation check(s) failed: ${failedChecks
              .map((check) => check.check_name)
              .join("; ")}.`,
  };

  const goalScopeFinding = findings.find(
    (finding) => findingKey(finding) === "ISO_14044:4.2",
  );
  const functionalUnitPresent = lca.product.functionalUnit !== null;
  const boundaryPresent = lca.goalAndScope.systemBoundary !== null;
  const goalScopePassed =
    functionalUnitPresent &&
    boundaryPresent &&
    goalScopeFinding?.result !== "major_gap";
  const goalScopeIntegrity: GateResult = {
    key: "goal_scope_integrity",
    label: "Goal & scope integrity",
    passed: goalScopePassed,
    detail: goalScopePassed
      ? "Functional unit and system boundary are stated and consistent."
      : !functionalUnitPresent || !boundaryPresent
        ? "The functional unit or system boundary is not stated."
        : "ISO 14044 §4.2 shows a major gap.",
  };

  const methodologicalMajors = findings.filter(
    (finding) =>
      finding.result === "major_gap" &&
      METHODOLOGICAL_CLAUSES.has(findingKey(finding)),
  );
  const methodology: GateResult = {
    key: "methodology",
    label: "No major methodological error",
    passed: methodologicalMajors.length === 0,
    detail:
      methodologicalMajors.length === 0
        ? "No major methodological errors found in allocation, characterisation, or biogenic accounting."
        : `Major methodological gap(s): ${methodologicalMajors
            .map(
              (finding) => `${finding.standard_name} §${finding.clause_ref}`,
            )
            .join("; ")}.`,
  };

  return [calculationIntegrity, goalScopeIntegrity, methodology];
}

function decideTier(
  findings: EvaluatedFinding[],
  gates: GateResult[],
  lca: LcaExtraction,
): Tier {
  if (gates.some((gate) => !gate.passed)) return "not_certified";

  const majors = findings.filter((finding) => finding.result === "major_gap");
  const minors = findings.filter((finding) => finding.result === "minor_gap");
  const insufficient = findings.filter(
    (finding) => finding.result === "insufficient_info",
  );
  // An unanswered major-severity clause can never support Silver or above.
  const majorSeverityInsufficient = insufficient.filter(
    (finding) => finding.severity === "major",
  );

  const dataQuality = lca.dataQuality;
  const dqScore = dataQuality.overallScorePercent;
  const dqRating = dataQuality.overallRating?.toLowerCase() ?? "";
  const goodDataQuality =
    (dqScore !== null && dqScore >= GOOD_DATA_QUALITY_SCORE) ||
    ["good", "high", "excellent"].some((label) => dqRating.includes(label));
  const highDataQuality = dqScore !== null && dqScore >= HIGH_DATA_QUALITY_SCORE;

  if (majors.length > 0 || majorSeverityInsufficient.length > 0) {
    return "bronze";
  }
  if (!goodDataQuality) {
    return "bronze";
  }

  // Silver reached. Now Gold:
  const coverageFinding = findings.find(
    (finding) => findingKey(finding) === "ISO_14044:4.4",
  );
  const coverageOk = coverageFinding
    ? coverageFinding.result === "conforms"
    : lca.impacts.otherCategories.length >= 3;
  const uncertaintyOk =
    lca.uncertainty.uncertaintyAnalysisPresent &&
    lca.uncertainty.sensitivityAnalysisPresent;
  const goldReached =
    highDataQuality &&
    uncertaintyOk &&
    coverageOk &&
    minors.length <= GOLD_MAX_MINOR_GAPS &&
    insufficient.length === 0;

  if (!goldReached) return "silver";

  const primaryShare = dataQuality.primarySharePercent ?? 0;
  return primaryShare >= PLATINUM_PRIMARY_SHARE ? "platinum" : "gold";
}

const FINDING_POINTS: Record<string, number> = {
  conforms: 1,
  minor_gap: 0.5,
  insufficient_info: 0.25,
  major_gap: 0,
};

function rawScore(
  findings: EvaluatedFinding[],
  calcChecks: CalculationCheckResult[],
  lca: LcaExtraction,
): number {
  const calcShare =
    calcChecks.length === 0
      ? 0.5 // nothing reconcilable: neither confirmed nor breached
      : calcChecks.filter((check) => check.passed).length / calcChecks.length;

  let findingShare = 0;
  if (findings.length > 0) {
    const weight = (finding: EvaluatedFinding) =>
      finding.severity === "major" ? 2 : 1;
    const totalWeight = findings.reduce((total, f) => total + weight(f), 0);
    const points = findings.reduce(
      (total, f) => total + weight(f) * FINDING_POINTS[f.result],
      0,
    );
    findingShare = points / totalWeight;
  }

  const dqShare = Math.min(
    Math.max((lca.dataQuality.overallScorePercent ?? 40) / 100, 0),
    1,
  );

  return Math.round(35 * calcShare + 45 * findingShare + 20 * dqShare);
}

export function scoreVerification(
  findings: EvaluatedFinding[],
  calcChecks: CalculationCheckResult[],
  lca: LcaExtraction,
): ScoreOutcome {
  const gates = evaluateGates(findings, calcChecks, lca);
  const tier = decideTier(findings, gates, lca);
  const score = Math.min(rawScore(findings, calcChecks, lca), TIER_SCORE_CAPS[tier]);
  return { tier, score, gates };
}
