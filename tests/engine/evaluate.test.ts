import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import type Anthropic from "@anthropic-ai/sdk";
import {
  evaluateClauses,
  EvaluationError,
} from "@/lib/engine/evaluate";
import type { EngineClause } from "@/types/standards";
import { lcaExtractionSchema, type LcaExtraction } from "@/types/lca";

const fixturePath = path.resolve(
  __dirname,
  "../fixtures/unrooted-mighty-ginger.expected.json",
);

const lca: LcaExtraction = lcaExtractionSchema.parse(
  JSON.parse(readFileSync(fixturePath, "utf-8")),
);

function clause(
  code: string,
  ref: string,
  severity: "major" | "minor" = "major",
): EngineClause {
  return {
    id: `clause-${code}-${ref}`,
    standard_id: `std-${code}`,
    clause_ref: ref,
    title: `${code} ${ref}`,
    check_description: "requirement text",
    severity,
    standard: { id: `std-${code}`, code, name: code.replace("_", " ") },
    descriptor: { standardCode: code, clauseRef: ref, mode: "llm" },
  };
}

function stubClient(parsedOutput: unknown, stopReason = "end_turn"): Anthropic {
  return {
    messages: {
      parse: async () => ({
        stop_reason: stopReason,
        parsed_output: parsedOutput,
      }),
    },
  } as unknown as Anthropic;
}

const CLAUSES = [
  clause("ISO_14044", "4.2"),
  clause("ISO_14044", "4.2.3.6"),
  clause("ISO_14067", "6.4.9.3"),
];

describe("evaluateClauses (TASK-025, FR-004)", () => {
  it("maps returned findings and enforces one finding per clause", async () => {
    const client = stubClient({
      findings: [
        {
          standardCode: "ISO_14044",
          clauseRef: "4.2",
          result: "conforms",
          plainSummary: "Goal and scope are clearly defined.",
          reasoning:
            "ISO 14044 §4.2: functional unit and cradle-to-grave boundary are stated.",
          recommendation: null,
        },
        {
          standardCode: "ISO_14044",
          clauseRef: "4.2.3.6",
          result: "major_gap",
          plainSummary: "All inputs rely on secondary data.",
          reasoning: "The report shows 0 primary data points across 14 materials.",
          recommendation: "Collect primary data from your top three contributors.",
        },
        {
          standardCode: "ISO_14067",
          clauseRef: "6.4.9.3",
          result: "conforms",
          plainSummary: "Biogenic carbon is reported separately.",
          reasoning:
            "ISO 14067 §6.4.9.3: fossil (0.0737) and biogenic (0.0129) are split.",
          recommendation: "This should be nulled for conforms results.",
        },
      ],
    });

    const findings = await evaluateClauses(lca, CLAUSES, [], { client });

    expect(findings).toHaveLength(3);
    // Every finding carries its citation structurally.
    expect(findings.every((finding) => finding.clause_ref)).toBe(true);
    expect(findings.every((finding) => finding.standard_id)).toBe(true);
    // Reasoning missing the clause ref gets it prefixed (never uncited).
    const dataQuality = findings.find((f) => f.clause_ref === "4.2.3.6");
    expect(dataQuality?.reasoning).toContain("4.2.3.6");
    // Conforming findings have no recommendation.
    const biogenic = findings.find((f) => f.clause_ref === "6.4.9.3");
    expect(biogenic?.recommendation).toBeNull();
  });

  it("returns insufficient_info (never a pass) for clauses the model skipped", async () => {
    const client = stubClient({ findings: [] });
    const findings = await evaluateClauses(lca, CLAUSES, [], { client });

    expect(findings).toHaveLength(3);
    for (const finding of findings) {
      expect(finding.result).toBe("insufficient_info");
      expect(finding.reasoning).toContain(finding.clause_ref);
    }
  });

  it("throws a retryable EvaluationError when the model output is unusable", async () => {
    const client = stubClient(null);
    await expect(
      evaluateClauses(lca, CLAUSES, [], { client }),
    ).rejects.toThrow(EvaluationError);
  });

  it("returns nothing to evaluate for an empty clause list without calling Claude", async () => {
    const client = stubClient(null); // would throw if called
    const findings = await evaluateClauses(lca, [], [], { client });
    expect(findings).toEqual([]);
  });
});
