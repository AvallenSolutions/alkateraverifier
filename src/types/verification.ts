import { z } from "zod";
import { lcaExtractionSchema } from "./lca";

/** Verification lifecycle (FR-010): pending → extracting → evaluating → complete/failed. */
export const verificationStatusSchema = z.enum([
  "pending",
  "extracting",
  "evaluating",
  "complete",
  "failed",
]);
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;

/** Certification bands (FR-006): gates decide not_certified, tiers rank the rest. */
export const tierSchema = z.enum([
  "not_certified",
  "bronze",
  "silver",
  "gold",
  "platinum",
]);
export type Tier = z.infer<typeof tierSchema>;

/** Clause finding results (FR-004). */
export const findingResultSchema = z.enum([
  "conforms",
  "minor_gap",
  "major_gap",
  "insufficient_info",
]);
export type FindingResult = z.infer<typeof findingResultSchema>;

export const clauseSeveritySchema = z.enum(["major", "minor"]);
export type ClauseSeverity = z.infer<typeof clauseSeveritySchema>;

export const standardCategorySchema = z.enum(["iso", "ghg", "global"]);
export type StandardCategory = z.infer<typeof standardCategorySchema>;

// --- Database row shapes (mirror supabase/migrations/0001_init.sql) ---

export interface Standard {
  id: string;
  code: string;
  name: string;
  category: StandardCategory;
  description: string | null;
  is_active: boolean;
}

export interface StandardClause {
  id: string;
  standard_id: string;
  clause_ref: string;
  title: string;
  check_description: string;
  severity: ClauseSeverity;
}

export interface Verification {
  id: string;
  user_id: string;
  product_name: string | null;
  source_platform: string | null;
  file_path: string;
  selected_standard_ids: string[];
  status: VerificationStatus;
  extraction: z.infer<typeof lcaExtractionSchema> | null;
  extraction_confidence: number | null;
  tier: Tier | null;
  score: number | null;
  is_paid: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface Finding {
  id: string;
  verification_id: string;
  standard_id: string;
  clause_ref: string;
  result: FindingResult;
  plain_summary: string;
  reasoning: string;
  recommendation: string | null;
  created_at: string;
}

export interface CalculationCheck {
  id: string;
  verification_id: string;
  check_name: string;
  reported_value: number | null;
  recomputed_value: number | null;
  unit: string | null;
  passed: boolean;
  tolerance_note: string | null;
}

/** Dashboard/history list item (GET /api/verifications). */
export interface VerificationSummary {
  id: string;
  product_name: string | null;
  status: VerificationStatus;
  tier: Tier | null;
  score: number | null;
  is_paid: boolean;
  created_at: string;
}
