import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type Anthropic from "@anthropic-ai/sdk";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { runVerification } from "@/lib/engine/run";
import { lcaExtractionSchema } from "@/types/lca";

/**
 * Full pipeline integration test (TASK-027) against the real Supabase
 * project with a stubbed Claude client: claim → download → extract →
 * calc checks → clause loading (TASK-023 live) → evaluation → score →
 * persist. Skips when no Supabase env is configured (e.g. CI).
 */

const hasEnv =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY;

const fixturesDir = path.resolve(__dirname, "../fixtures");

const expectedLca = lcaExtractionSchema.parse(
  JSON.parse(
    readFileSync(
      path.join(fixturesDir, "unrooted-mighty-ginger.expected.json"),
      "utf-8",
    ),
  ),
);

/** Findings the stub "engine model" returns for the seeded clauses. */
const STUB_FINDINGS = [
  { standardCode: "ISO_14044", clauseRef: "4.2", result: "conforms" },
  { standardCode: "ISO_14044", clauseRef: "4.2.3.6", result: "major_gap" },
  { standardCode: "ISO_14044", clauseRef: "4.3.4", result: "conforms" },
  { standardCode: "ISO_14044", clauseRef: "4.4", result: "conforms" },
  { standardCode: "ISO_14044", clauseRef: "4.5", result: "conforms" },
  { standardCode: "ISO_14044", clauseRef: "4.5.3", result: "conforms" },
  { standardCode: "ISO_14067", clauseRef: "6.4.9.3", result: "conforms" },
].map((f) => ({
  ...f,
  plainSummary: `Stubbed summary for ${f.clauseRef}.`,
  reasoning: `${f.standardCode} §${f.clauseRef}: stubbed reasoning.`,
  recommendation: f.result === "conforms" ? null : "Collect primary data.",
}));

/** Routes parse() calls to extraction or evaluation output by system prompt. */
function stubClient(): Anthropic {
  return {
    messages: {
      parse: async (request: {
        system: Array<{ text: string }>;
      }) => {
        const isExtraction = request.system[0].text.includes(
          "extraction engine",
        );
        return {
          stop_reason: "end_turn",
          parsed_output: isExtraction
            ? {
                lca: expectedLca,
                confidence: 0.95,
                missingSections: [],
                isLcaReport: true,
              }
            : { findings: STUB_FINDINGS },
        };
      },
    },
  } as unknown as Anthropic;
}

describe.skipIf(!hasEnv)("runVerification (pipeline integration)", () => {
  const admin = hasEnv
    ? createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } },
      )
    : null!;

  const verificationId = randomUUID();
  let userId: string;
  let filePath: string;

  beforeAll(async () => {
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .limit(1)
      .single();
    if (!profile) throw new Error("No profile exists to own the test verification");
    userId = profile.id;
    filePath = `${userId}/${verificationId}.pdf`;

    const pdf = readFileSync(
      path.join(fixturesDir, "unrooted-mighty-ginger.pdf"),
    );
    const { error: uploadError } = await admin.storage
      .from("lca-uploads")
      .upload(filePath, pdf, { contentType: "application/pdf" });
    if (uploadError) throw new Error(uploadError.message);

    const { data: standards } = await admin
      .from("standards")
      .select("id, code")
      .in("code", ["ISO_14044", "ISO_14067"]);

    const { error: insertError } = await admin.from("verifications").insert({
      id: verificationId,
      user_id: userId,
      file_path: filePath,
      selected_standard_ids: (standards ?? []).map((s) => s.id),
      status: "pending",
    });
    if (insertError) throw new Error(insertError.message);
  });

  afterAll(async () => {
    if (process.env.KEEP_VERIFICATION) {
      console.log(`kept verification ${verificationId}`);
      return;
    }
    await admin.from("verifications").delete().eq("id", verificationId);
    await admin.storage.from("lca-uploads").remove([filePath]);
  });

  it(
    "processes an upload end to end and persists the transparent verdict",
    { timeout: 120_000 },
    async () => {
      const result = await runVerification(verificationId, {
        client: stubClient(),
      });

      expect(result.status).toBe("complete");
      if (result.status !== "complete") return;
      expect(result.tier).toBe("bronze"); // known-good example: 0% primary data

      const { data: row } = await admin
        .from("verifications")
        .select("*")
        .eq("id", verificationId)
        .single();
      expect(row.status).toBe("complete");
      expect(row.tier).toBe("bronze");
      expect(row.product_name).toContain("Mighty Ginger");
      expect(row.extraction_confidence).toBeGreaterThan(0.9);
      expect(Array.isArray(row.gates)).toBe(true);
      expect(row.gates.every((gate: { passed: boolean }) => gate.passed)).toBe(
        true,
      );
      expect(row.completed_at).not.toBeNull();

      const { data: findings } = await admin
        .from("findings")
        .select("clause_ref, result, reasoning")
        .eq("verification_id", verificationId);
      expect(findings).toHaveLength(7); // every seeded clause, exactly once
      expect(
        findings!.every((finding) =>
          finding.reasoning.includes(finding.clause_ref),
        ),
      ).toBe(true); // never assert without a citation

      const { data: checks } = await admin
        .from("calculation_checks")
        .select("passed")
        .eq("verification_id", verificationId);
      expect(checks).toHaveLength(4);
      expect(checks!.every((check) => check.passed)).toBe(true);

      // Re-running skips: the record is complete, never double-processed.
      const rerun = await runVerification(verificationId, {
        client: stubClient(),
      });
      expect(rerun.status).toBe("skipped");
    },
  );
});
