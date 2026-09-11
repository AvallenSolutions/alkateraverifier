import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ClauseCheckDescriptor,
  EngineClause,
} from "@/types/standards";
import type { Standard, StandardClause } from "@/types/verification";

/**
 * Encoded check descriptors for the seeded clause catalogue (TASK-023).
 * Keyed by `${standardCode}:${clauseRef}`. Clauses without an entry fall
 * back to a plain LLM-guided check driven by their check_description.
 */
const DESCRIPTORS: Record<string, ClauseCheckDescriptor> = {
  "ISO_14044:4.2": {
    standardCode: "ISO_14044",
    clauseRef: "4.2",
    mode: "llm",
    evaluationGuidance:
      "Check the functional unit is explicit and quantified, the system boundary is named (e.g. cradle-to-grave) with included/excluded stages listed, cut-off criteria are stated, and the intended application/audience and comparative-assertion position are declared. Missing functional unit or boundary is a major gap.",
  },
  "ISO_14044:4.2.3.6": {
    standardCode: "ISO_14044",
    clauseRef: "4.2.3.6",
    mode: "llm",
    evaluationGuidance:
      "Check data quality is assessed against the pedigree dimensions (reliability, completeness, temporal, geographic, technological) and that primary/secondary/proxy shares are disclosed. 0% primary data with no site-specific measurement is a major gap in data quality even when the assessment itself is well documented. A missing data quality section entirely is a major gap or insufficient_info, never a pass.",
  },
  "ISO_14044:4.3.4": {
    standardCode: "ISO_14044",
    clauseRef: "4.3.4",
    mode: "llm",
    evaluationGuidance:
      "Check the allocation hierarchy: allocation avoided by subdivision or system expansion where possible; otherwise physical relationships before economic value, applied consistently and with justification. Economic allocation used where physical allocation was feasible, without justification, is a major gap.",
  },
  "ISO_14044:4.4": {
    standardCode: "ISO_14044",
    clauseRef: "4.4",
    mode: "llm",
    evaluationGuidance:
      "Check the LCIA method and characterisation models are named with versions (e.g. ReCiPe 2016, IPCC AR6 GWP-100) and impact category coverage matches the stated goal. Zero-value or excluded categories need a stated justification (§4.4.2.2).",
  },
  "ISO_14044:4.5": {
    standardCode: "ISO_14044",
    clauseRef: "4.5",
    mode: "llm",
    evaluationGuidance:
      "Check the interpretation identifies significant issues (dominant stages/contributors) consistent with the results, and states conclusions, limitations and recommendations that follow from the data.",
  },
  "ISO_14044:4.5.3": {
    standardCode: "ISO_14044",
    clauseRef: "4.5.3",
    mode: "llm",
    evaluationGuidance:
      "Check for completeness/sensitivity/consistency evaluation and an uncertainty treatment (propagated uncertainty, confidence interval, or sensitivity analysis on key contributors). Absence of any formal uncertainty or sensitivity analysis is a minor gap; do not fail the study for method choice.",
  },
  "ISO_14067:6.4.9.3": {
    standardCode: "ISO_14067",
    clauseRef: "6.4.9.3",
    mode: "llm",
    evaluationGuidance:
      "Check biogenic CO2 emissions and removals are quantified and reported separately from fossil GHG emissions (separate line items or a fossil/biogenic split), not silently netted into a single figure.",
  },
};

export function getDescriptor(
  standardCode: string,
  clauseRef: string,
): ClauseCheckDescriptor {
  return (
    DESCRIPTORS[`${standardCode}:${clauseRef}`] ?? {
      standardCode,
      clauseRef,
      mode: "llm",
    }
  );
}

/**
 * Load the clauses for the selected standards into the engine
 * (server-side, service role: runs inside the worker).
 */
export async function loadEngineClauses(
  selectedStandardIds: string[],
): Promise<EngineClause[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("standard_clauses")
    .select("*, standards!inner(id, code, name)")
    .in("standard_id", selectedStandardIds);

  if (error) {
    throw new Error(`Could not load standard clauses: ${error.message}`);
  }

  return ((data ?? []) as Array<
    StandardClause & { standards: Pick<Standard, "id" | "code" | "name"> }
  >).map((row) => {
    const { standards: standard, ...clause } = row;
    return {
      ...clause,
      standard,
      descriptor: getDescriptor(standard.code, clause.clause_ref),
    };
  });
}
