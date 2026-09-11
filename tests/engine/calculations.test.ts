import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { runCalculationChecks } from "@/lib/engine/calculations";
import { lcaExtractionSchema, type LcaExtraction } from "@/types/lca";

const fixturePath = path.resolve(
  __dirname,
  "../fixtures/unrooted-mighty-ginger.expected.json",
);

function loadFixture(): LcaExtraction {
  return lcaExtractionSchema.parse(
    JSON.parse(readFileSync(fixturePath, "utf-8")),
  );
}

describe("runCalculationChecks (TASK-024)", () => {
  it("passes every reconciliation on the internally consistent report", () => {
    const checks = runCalculationChecks(loadFixture());
    expect(checks).toHaveLength(4);
    expect(checks.every((check) => check.passed)).toBe(true);
    expect(checks.map((check) => check.check_name)).toContain(
      "GHG species total vs headline",
    );
  });

  it("fails on a planted GHG total mismatch (never a false pass)", () => {
    const lca = loadFixture();
    // The planted error from flawed-ghg-mismatch.pdf: headline inflated ~17%.
    lca.impacts.climateTotalKgCo2e = 0.102;
    const checks = runCalculationChecks(lca);
    const failed = checks.filter((check) => !check.passed);
    expect(failed.length).toBeGreaterThanOrEqual(2); // species + stage sums
    expect(failed[0].tolerance_note).toContain("tolerance");
  });

  it("skips checks whose inputs the report does not state", () => {
    const lca = loadFixture();
    lca.endOfLife.grossKgCo2e = null;
    const checks = runCalculationChecks(lca);
    expect(checks).toHaveLength(3);
    expect(
      checks.find((check) => check.check_name.includes("end-of-life")),
    ).toBeUndefined();
  });

  it("tolerates report rounding within ±2%", () => {
    const lca = loadFixture();
    // Headline 0.087 vs species sum 0.0866 — a 0.46% rounding difference.
    const speciesCheck = runCalculationChecks(lca).find(
      (check) => check.check_name === "GHG species total vs headline",
    );
    expect(speciesCheck?.passed).toBe(true);
  });
});
