import type Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ExtractionError,
  extractLcaFromPdf,
  NotAnLcaError,
} from "@/lib/extraction/extract";
import { PdfParseError } from "@/lib/extraction/pdf";
import { loadEngineClauses } from "@/lib/standards/clauses";
import { runCalculationChecks } from "./calculations";
import { evaluateClauses, EvaluationError } from "./evaluate";
import { scoreVerification } from "./score";

const BUCKET = "lca-uploads";

export type RunResult =
  | { status: "complete"; tier: string; score: number }
  | { status: "failed"; reason: string }
  | { status: "skipped"; reason: string };

/**
 * The verification pipeline (TASK-027): claim → extract → validate →
 * calculation checks → clause evaluation → score/tier → persist.
 *
 * Failures are honest and retryable: the record moves to `failed` with a
 * plain-English reason, the upload stays intact, and re-running re-claims
 * the record (old findings/checks are replaced, never duplicated).
 */
export async function runVerification(
  verificationId: string,
  options: { client?: Anthropic } = {},
): Promise<RunResult> {
  const admin = createAdminClient();

  // Claim atomically: only pending (or failed, for retries) rows process.
  const { data: claimed } = await admin
    .from("verifications")
    .update({ status: "extracting", failure_reason: null })
    .eq("id", verificationId)
    .in("status", ["pending", "failed"])
    .select()
    .single();

  if (!claimed) {
    return {
      status: "skipped",
      reason: "Not found, already processing, or already complete.",
    };
  }

  try {
    const { data: blob, error: downloadError } = await admin.storage
      .from(BUCKET)
      .download(claimed.file_path);
    if (downloadError || !blob) {
      throw new ExtractionError(
        "We could not read your uploaded file from storage. Retry the verification.",
      );
    }
    const bytes = new Uint8Array(await blob.arrayBuffer());

    // --- Extract (Claude) ---
    const extraction = await extractLcaFromPdf(bytes, options);

    await admin
      .from("verifications")
      .update({
        status: "evaluating",
        extraction: extraction.lca,
        extraction_confidence: extraction.confidence,
        product_name: extraction.lca.product.name,
        source_platform: extraction.lca.product.sourcePlatform ?? "unknown",
      })
      .eq("id", verificationId);

    // --- Deterministic calculation cross-checks ---
    const calcChecks = runCalculationChecks(extraction.lca);

    // --- Clause evaluation (LLM-guided, cited) ---
    const clauses = await loadEngineClauses(claimed.selected_standard_ids);
    const findings = await evaluateClauses(
      extraction.lca,
      clauses,
      calcChecks,
      options,
    );

    // --- Score + tier (deterministic rubric) ---
    const outcome = scoreVerification(findings, calcChecks, extraction.lca);

    // --- Persist (replace, never duplicate, so retries stay clean) ---
    await admin
      .from("calculation_checks")
      .delete()
      .eq("verification_id", verificationId);
    await admin.from("findings").delete().eq("verification_id", verificationId);

    if (calcChecks.length > 0) {
      const { error } = await admin.from("calculation_checks").insert(
        calcChecks.map((check) => ({
          verification_id: verificationId,
          ...check,
        })),
      );
      if (error) throw new EvaluationError(`Could not save calculation checks: ${error.message}`);
    }

    if (findings.length > 0) {
      const { error } = await admin.from("findings").insert(
        findings.map((finding) => ({
          verification_id: verificationId,
          standard_id: finding.standard_id,
          clause_ref: finding.clause_ref,
          result: finding.result,
          plain_summary: finding.plain_summary,
          reasoning: finding.reasoning,
          recommendation: finding.recommendation,
        })),
      );
      if (error) throw new EvaluationError(`Could not save findings: ${error.message}`);
    }

    await admin
      .from("verifications")
      .update({
        status: "complete",
        tier: outcome.tier,
        score: outcome.score,
        gates: outcome.gates,
        completed_at: new Date().toISOString(),
      })
      .eq("id", verificationId);

    return { status: "complete", tier: outcome.tier, score: outcome.score };
  } catch (error) {
    const reason =
      error instanceof NotAnLcaError ||
      error instanceof PdfParseError ||
      error instanceof ExtractionError ||
      error instanceof EvaluationError
        ? error.message
        : "The verification failed unexpectedly. Your upload is safe and you can retry.";

    await admin
      .from("verifications")
      .update({ status: "failed", failure_reason: reason })
      .eq("id", verificationId);

    return { status: "failed", reason };
  }
}
