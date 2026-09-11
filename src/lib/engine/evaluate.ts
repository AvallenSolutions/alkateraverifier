import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { EVALUATION_MODEL, getAnthropicClient } from "@/lib/anthropic";
import type { LcaExtraction } from "@/types/lca";
import type { EngineClause } from "@/types/standards";
import {
  findingResultSchema,
  type ClauseSeverity,
  type FindingResult,
} from "@/types/verification";
import type { CalculationCheckResult } from "./calculations";

/**
 * LLM-guided, cited clause evaluation (TASK-025, FR-004).
 *
 * One batched call evaluates every selected clause against the extracted
 * LCA plus the deterministic calculation-check results. The
 * "never assert without a citation" invariant is enforced twice: in the
 * prompt, and structurally after the fact — every finding carries its
 * standard + clause_ref, and any clause the model failed to return comes
 * back as insufficient_info, never a silent pass.
 */

export class EvaluationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvaluationError";
  }
}

const clauseFindingSchema = z.object({
  standardCode: z.string(),
  clauseRef: z.string(),
  result: findingResultSchema,
  plainSummary: z.string(),
  reasoning: z.string(),
  recommendation: z.string().nullable(),
});

const evaluationResponseSchema = z.object({
  findings: z.array(clauseFindingSchema),
});

export interface EvaluatedFinding {
  standard_id: string;
  standard_code: string;
  standard_name: string;
  clause_ref: string;
  severity: ClauseSeverity;
  result: FindingResult;
  plain_summary: string;
  reasoning: string;
  recommendation: string | null;
}

const SYSTEM_PROMPT = `You are the clause-evaluation engine of an independent LCA verification service. You assess whether a life cycle assessment conforms to specific clauses of international standards, using ONLY the structured data extracted from the report and the deterministic calculation-check results you are given.

Voice: authoritative, transparent, plain-spoken, firmly anti-greenwashing. Exacting but never condescending. You do not flatter, and you do not soften a failing finding.

Rules:
- Evaluate every clause you are given, exactly once each. Return one finding per clause with its standardCode and clauseRef copied exactly.
- result must be one of: "conforms" (the extracted data demonstrably satisfies the clause), "minor_gap" (a deficiency that does not undermine the study's conclusions), "major_gap" (a deficiency that undermines reliability or breaches the clause's core requirement), "insufficient_info" (the extracted data does not contain enough to judge; NEVER guess or give the benefit of the doubt).
- reasoning must name the standard and clause (e.g. "ISO 14044 §4.2.3.6") and point at the specific extracted values or absences that drive the result. No verdict without its evidence.
- plainSummary is one or two sentences a non-expert brand manager can act on. No jargon without translation.
- recommendation: for anything other than "conforms", a concrete, prioritised fix (what to collect, measure, or document); null when the clause conforms.
- Missing data is never a pass. If a section the clause requires is absent from the extraction, that is "insufficient_info" or a gap per the clause guidance, never "conforms".
- Judge the report, not the product. Never comment on whether the footprint is good or bad, only whether the study meets the clause.`;

function buildUserPrompt(
  lca: LcaExtraction,
  clauses: EngineClause[],
  calcChecks: CalculationCheckResult[],
): string {
  const clauseList = clauses
    .map((clause) => {
      const guidance = clause.descriptor.evaluationGuidance
        ? `\n  Evaluation guidance: ${clause.descriptor.evaluationGuidance}`
        : "";
      return `- standardCode: ${clause.standard.code} | clauseRef: ${clause.clause_ref} | ${clause.standard.name} §${clause.clause_ref} — ${clause.title} (severity if breached: ${clause.severity})\n  Requirement: ${clause.check_description}${guidance}`;
    })
    .join("\n");

  const checksBlock =
    calcChecks.length > 0
      ? JSON.stringify(calcChecks, null, 2)
      : "No calculation checks could be computed (required figures were not stated in the report).";

  return `Evaluate the following LCA against each listed clause.

CLAUSES TO EVALUATE (one finding per clause):
${clauseList}

DETERMINISTIC CALCULATION CHECK RESULTS (already computed; use as evidence where relevant):
${checksBlock}

EXTRACTED LCA DATA:
${JSON.stringify(lca, null, 2)}`;
}

/** Structural citation guarantee: reasoning always names standard + clause. */
function ensureCitation(
  reasoning: string,
  standardName: string,
  clauseRef: string,
): string {
  return reasoning.includes(clauseRef)
    ? reasoning
    : `${standardName} §${clauseRef}: ${reasoning}`;
}

function fallbackFinding(clause: EngineClause): EvaluatedFinding {
  return {
    standard_id: clause.standard.id,
    standard_code: clause.standard.code,
    standard_name: clause.standard.name,
    clause_ref: clause.clause_ref,
    severity: clause.severity,
    result: "insufficient_info",
    plain_summary:
      "We could not complete the check for this clause on this run. This is not a pass.",
    reasoning: `${clause.standard.name} §${clause.clause_ref}: the evaluation engine did not return a judgement for this clause, so no conformance can be asserted.`,
    recommendation:
      "Re-run the verification. If this repeats, contact support.",
  };
}

export async function evaluateClauses(
  lca: LcaExtraction,
  clauses: EngineClause[],
  calcChecks: CalculationCheckResult[],
  options: { client?: Anthropic } = {},
): Promise<EvaluatedFinding[]> {
  if (clauses.length === 0) return [];

  const client = options.client ?? getAnthropicClient();

  const response = await client.messages.parse({
    model: EVALUATION_MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      { role: "user", content: buildUserPrompt(lca, clauses, calcChecks) },
    ],
    output_config: {
      format: zodOutputFormat(evaluationResponseSchema),
    },
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new EvaluationError(
      "The evaluation engine could not assess this report. The verification can be retried.",
    );
  }

  const returned = response.parsed_output.findings;

  return clauses.map((clause) => {
    const match = returned.find(
      (finding) =>
        finding.standardCode === clause.standard.code &&
        finding.clauseRef === clause.clause_ref,
    );
    if (!match) return fallbackFinding(clause);

    return {
      standard_id: clause.standard.id,
      standard_code: clause.standard.code,
      standard_name: clause.standard.name,
      clause_ref: clause.clause_ref,
      severity: clause.severity,
      result: match.result,
      plain_summary: match.plainSummary,
      reasoning: ensureCitation(
        match.reasoning,
        clause.standard.name,
        clause.clause_ref,
      ),
      recommendation: match.result === "conforms" ? null : match.recommendation,
    };
  });
}
