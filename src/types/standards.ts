import type { Standard, StandardClause } from "./verification";

/**
 * Clause-check layer types (TASK-023). Hybrid approach per PRD § Open
 * Questions: deterministic checks handle calculation reconciliation
 * (src/lib/engine/calculations.ts); clause conformance is LLM-guided,
 * steered by the encoded check_description plus per-clause guidance,
 * and always cited.
 */

export type CheckMode = "deterministic" | "llm";

export interface ClauseCheckDescriptor {
  /** e.g. "ISO_14044" */
  standardCode: string;
  /** e.g. "4.2.3.6" */
  clauseRef: string;
  mode: CheckMode;
  /**
   * Extra evaluation guidance appended to the seeded check_description
   * when prompting the engine — encodes what a reviewer looks at first.
   */
  evaluationGuidance?: string;
}

/** A clause as loaded into the engine: DB row + standard + descriptor. */
export interface EngineClause extends StandardClause {
  standard: Pick<Standard, "id" | "code" | "name">;
  descriptor: ClauseCheckDescriptor;
}
