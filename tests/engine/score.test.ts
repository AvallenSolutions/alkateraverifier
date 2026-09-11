import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { runCalculationChecks } from "@/lib/engine/calculations";
import type { EvaluatedFinding } from "@/lib/engine/evaluate";
import { scoreVerification } from "@/lib/engine/score";
import { lcaExtractionSchema, type LcaExtraction } from "@/types/lca";
import type { ClauseSeverity, FindingResult } from "@/types/verification";

const fixturePath = path.resolve(
  __dirname,
  "../fixtures/unrooted-mighty-ginger.expected.json",
);

function loadFixture(): LcaExtraction {
  return lcaExtractionSchema.parse(
    JSON.parse(readFileSync(fixturePath, "utf-8")),
  );
}

function finding(
  code: string,
  ref: string,
  result: FindingResult,
  severity: ClauseSeverity = "major",
): EvaluatedFinding {
  return {
    standard_id: `std-${code}`,
    standard_code: code,
    standard_name: code.replace("_", " "),
    clause_ref: ref,
    severity,
    result,
    plain_summary: "test",
    reasoning: `${code} §${ref}: test`,
    recommendation: result === "conforms" ? null : "fix it",
  };
}

/** The findings an honest engine returns for the UNROOTED report. */
function knownGoodFindings(): EvaluatedFinding[] {
  return [
    finding("ISO_14044", "4.2", "conforms"),
    finding("ISO_14044", "4.2.3.6", "major_gap"), // 0% primary data
    finding("ISO_14044", "4.3.4", "conforms"),
    finding("ISO_14044", "4.4", "conforms"),
    finding("ISO_14044", "4.5", "conforms"),
    finding("ISO_14044", "4.5.3", "conforms", "minor"),
    finding("ISO_14067", "6.4.9.3", "conforms"),
  ];
}

function allConformsFindings(): EvaluatedFinding[] {
  return knownGoodFindings().map((f) => ({
    ...f,
    result: "conforms" as const,
    recommendation: null,
  }));
}

describe("scoreVerification (TASK-026, FR-006)", () => {
  it("lands the known-good example (0% primary data) at Bronze", () => {
    const lca = loadFixture();
    const outcome = scoreVerification(
      knownGoodFindings(),
      runCalculationChecks(lca),
      lca,
    );
    expect(outcome.gates.every((gate) => gate.passed)).toBe(true);
    expect(outcome.tier).toBe("bronze");
    expect(outcome.score).toBeLessThanOrEqual(69);
  });

  it("a calculation-integrity breach always yields not_certified, regardless of other strengths", () => {
    const lca = loadFixture();
    lca.dataQuality.overallScorePercent = 95;
    lca.dataQuality.primarySharePercent = 90;
    lca.impacts.climateTotalKgCo2e = 0.102; // planted mismatch
    const outcome = scoreVerification(
      allConformsFindings(),
      runCalculationChecks(lca),
      lca,
    );
    expect(outcome.tier).toBe("not_certified");
    expect(outcome.score).toBeLessThanOrEqual(39);
    expect(
      outcome.gates.find((gate) => gate.key === "calculation_integrity")
        ?.passed,
    ).toBe(false);
  });

  it("a major methodological error (allocation) gates to not_certified", () => {
    const lca = loadFixture();
    const findings = knownGoodFindings().map((f) =>
      f.clause_ref === "4.3.4"
        ? { ...f, result: "major_gap" as const }
        : f,
    );
    const outcome = scoreVerification(
      findings,
      runCalculationChecks(lca),
      lca,
    );
    expect(outcome.tier).toBe("not_certified");
    expect(
      outcome.gates.find((gate) => gate.key === "methodology")?.passed,
    ).toBe(false);
  });

  it("any unresolved major gap caps the tier at Bronze", () => {
    const lca = loadFixture();
    lca.dataQuality.overallScorePercent = 90; // excellent DQ, but a major remains
    const outcome = scoreVerification(
      knownGoodFindings(),
      runCalculationChecks(lca),
      lca,
    );
    expect(outcome.tier).toBe("bronze");
  });

  it("reaches Silver with no majors and Good data quality", () => {
    const lca = loadFixture();
    lca.dataQuality.overallScorePercent = 70;
    lca.uncertainty.sensitivityAnalysisPresent = false; // blocks Gold
    const outcome = scoreVerification(
      allConformsFindings(),
      runCalculationChecks(lca),
      lca,
    );
    expect(outcome.tier).toBe("silver");
  });

  it("Gold-quality method below 70% verified primary stays Gold", () => {
    const lca = loadFixture();
    lca.dataQuality.overallScorePercent = 88;
    lca.dataQuality.primarySharePercent = 60;
    const outcome = scoreVerification(
      allConformsFindings(),
      runCalculationChecks(lca),
      lca,
    );
    expect(outcome.tier).toBe("gold");
  });

  it("reaches Platinum with Gold quality plus ≥70% verified primary data", () => {
    const lca = loadFixture();
    lca.dataQuality.overallScorePercent = 88;
    lca.dataQuality.primarySharePercent = 75;
    const outcome = scoreVerification(
      allConformsFindings(),
      runCalculationChecks(lca),
      lca,
    );
    expect(outcome.tier).toBe("platinum");
  });

  it("an unanswered major-severity clause can never support Silver or above", () => {
    const lca = loadFixture();
    lca.dataQuality.overallScorePercent = 90;
    const findings = allConformsFindings().map((f) =>
      f.clause_ref === "4.3.4"
        ? { ...f, result: "insufficient_info" as const }
        : f,
    );
    const outcome = scoreVerification(
      findings,
      runCalculationChecks(lca),
      lca,
    );
    expect(outcome.tier).toBe("bronze");
  });

  it("is deterministic: identical inputs always yield the same band and score", () => {
    const lca = loadFixture();
    const first = scoreVerification(
      knownGoodFindings(),
      runCalculationChecks(lca),
      lca,
    );
    const second = scoreVerification(
      knownGoodFindings(),
      runCalculationChecks(loadFixture()),
      loadFixture(),
    );
    expect(second).toEqual(first);
  });
});
