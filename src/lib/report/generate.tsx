import {
  Document,
  Page,
  renderToBuffer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { GateResult } from "@/lib/engine/score";
import type { Tier } from "@/types/verification";

/**
 * Verification report PDF (TASK-037, FR-008): tier, score, gates,
 * calculation checks, cited findings, and strictly scoped disclaimer —
 * in the studio language (docs/design.md): gallery-grey paper, cream
 * panels, hairlines, typographic tier. Built-in PDF fonts stand in for
 * the web stack (Helvetica-Bold for Space Grotesk, Helvetica for Inter,
 * Courier for JetBrains Mono); registering the real faces via
 * Font.register needs bundled TTFs and is a follow-up.
 */

export interface ReportData {
  verificationId: string;
  productName: string | null;
  sourcePlatform: string | null;
  tier: Tier;
  score: number | null;
  completedAt: string | null;
  extractionConfidence: number | null;
  gates: GateResult[];
  criticalReviewConducted: boolean | null;
  findings: Array<{
    standardName: string;
    clauseRef: string;
    result: string;
    plainSummary: string;
    reasoning: string;
    recommendation: string | null;
  }>;
  calculationChecks: Array<{
    checkName: string;
    reportedValue: number | null;
    recomputedValue: number | null;
    unit: string | null;
    passed: boolean;
    toleranceNote: string | null;
  }>;
}

const TIER_LABELS: Record<Tier, string> = {
  not_certified: "NOT CERTIFIED",
  bronze: "BRONZE",
  silver: "SILVER",
  gold: "GOLD",
  platinum: "PLATINUM",
};

const TIER_COLOURS: Record<Tier, string> = {
  not_certified: "#A81E2E",
  bronze: "#8A5A22",
  silver: "#59636E",
  gold: "#856009",
  platinum: "#3E5C76",
};

const RESULT_LABELS: Record<string, string> = {
  conforms: "CONFORMS",
  minor_gap: "MINOR GAP",
  major_gap: "MAJOR GAP",
  insufficient_info: "INSUFFICIENT INFO",
};

// Working tones (docs/design.md) — states, never decoration.
const RESULT_COLOURS: Record<string, string> = {
  conforms: "#036B4E",
  minor_gap: "#9A4708",
  major_gap: "#A81E2E",
  insufficient_info: "#5B21B6",
};

const TONE_GOOD = "#036B4E";
const TONE_LOST = "#A81E2E";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ECEAE3", // paper
    color: "#1A1B1D", // ink
    padding: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  eyebrow: {
    fontFamily: "Courier-Bold",
    fontSize: 8,
    letterSpacing: 2,
    color: "#0A5F52", // accent-strong
    marginBottom: 6,
  },
  title: { fontFamily: "Helvetica-Bold", fontSize: 24, marginBottom: 4 },
  meta: { fontFamily: "Courier", fontSize: 8, color: "#605F58" },
  tierRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 8,
  },
  // The verdict is typographic (docs/design.md § tier): a big word in its
  // tier tone over a mono label. No pill, no saturated block.
  tierWord: {
    fontFamily: "Helvetica-Bold",
    fontSize: 34,
    letterSpacing: -0.5,
  },
  tierLabel: {
    fontFamily: "Courier",
    fontSize: 7,
    letterSpacing: 1.5,
    color: "#565650",
    marginTop: 3,
  },
  score: { fontFamily: "Courier", fontSize: 11, color: "#1A1B1D" },
  section: { marginTop: 18 },
  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 14, marginBottom: 6 },
  card: {
    backgroundColor: "#F2F1EA", // cream
    borderWidth: 1,
    borderColor: "#D9D6CB", // hairline
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: {
    fontFamily: "Courier-Bold",
    fontSize: 7,
    letterSpacing: 1.5,
    color: "#605F58",
  },
  body: { fontSize: 9, lineHeight: 1.5, color: "#1A1B1D" },
  muted: { fontSize: 8, lineHeight: 1.5, color: "#565650" },
  resultChip: { fontFamily: "Courier-Bold", fontSize: 8 },
  disclaimer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#D9D6CB",
    paddingTop: 10,
  },
});

function formatValue(value: number | null): string {
  if (value === null) return "—";
  return Number(value.toFixed(4)).toString();
}

function ReportDocument({ data }: { data: ReportData }) {
  const conforms = data.findings.filter((f) => f.result === "conforms").length;

  return (
    <Document
      title={`LCA Verification Report · ${data.productName ?? data.verificationId}`}
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>ALKATERA VERIFIER · VERIFICATION REPORT</Text>
        <Text style={styles.title}>{data.productName ?? "LCA Verification"}</Text>
        <Text style={styles.meta}>
          Verification {data.verificationId}
          {data.completedAt
            ? ` · Completed ${new Date(data.completedAt).toLocaleDateString("en-GB")}`
            : ""}
          {data.sourcePlatform && data.sourcePlatform !== "unknown"
            ? ` · Source platform: ${data.sourcePlatform}`
            : ""}
        </Text>

        <View style={styles.tierRow}>
          <View>
            <Text
              style={[styles.tierWord, { color: TIER_COLOURS[data.tier] }]}
            >
              {TIER_LABELS[data.tier]}
            </Text>
            <Text style={styles.tierLabel}>VERDICT</Text>
          </View>
          <Text style={styles.score}>
            Score {data.score ?? "—"}/100 · Conforms on {conforms} of{" "}
            {data.findings.length} clauses
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certification gates</Text>
          {data.gates.map((gate) => (
            <View key={gate.key} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>{gate.label.toUpperCase()}</Text>
                <Text
                  style={[
                    styles.resultChip,
                    { color: gate.passed ? TONE_GOOD : TONE_LOST },
                  ]}
                >
                  {gate.passed ? "PASS" : "FAIL"}
                </Text>
              </View>
              <Text style={styles.muted}>{gate.detail}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calculation cross-checks</Text>
          {data.calculationChecks.length === 0 ? (
            <Text style={styles.muted}>
              No calculation cross-checks could be computed: the report does not
              state the figures needed to reconcile its totals.
            </Text>
          ) : (
            data.calculationChecks.map((check) => (
              <View key={check.checkName} style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.body}>{check.checkName}</Text>
                  <Text
                    style={[
                      styles.resultChip,
                      { color: check.passed ? TONE_GOOD : TONE_LOST },
                    ]}
                  >
                    {check.passed ? "PASS" : "FAIL"}
                  </Text>
                </View>
                <Text style={styles.muted}>
                  Reported {formatValue(check.reportedValue)} · Recomputed{" "}
                  {formatValue(check.recomputedValue)}
                  {check.unit ? ` ${check.unit}` : ""}
                  {check.toleranceNote ? ` — ${check.toleranceNote}` : ""}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section} break={data.findings.length > 3}>
          <Text style={styles.sectionTitle}>Findings, clause by clause</Text>
          {data.findings.map((finding) => (
            <View
              key={`${finding.standardName}-${finding.clauseRef}`}
              style={styles.card}
              wrap={false}
            >
              <View style={styles.row}>
                <Text style={styles.label}>
                  {finding.standardName.toUpperCase()} §{finding.clauseRef}
                </Text>
                <Text
                  style={[
                    styles.resultChip,
                    { color: RESULT_COLOURS[finding.result] ?? "#1A1B1D" },
                  ]}
                >
                  {RESULT_LABELS[finding.result] ?? finding.result}
                </Text>
              </View>
              <Text style={styles.body}>{finding.plainSummary}</Text>
              <Text style={styles.muted}>{finding.reasoning}</Text>
              {finding.recommendation ? (
                <Text style={styles.muted}>
                  To improve: {finding.recommendation}
                </Text>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.label}>SCOPE OF THIS VERIFICATION</Text>
          <Text style={styles.muted}>
            This automated verification checked the uploaded report against the
            specific clauses listed above, exactly as shown. It is not a
            certification of the product, and it does not assert the report is
            fit for all public claims. Critical review status:{" "}
            {data.criticalReviewConducted
              ? "an independent critical review is reported."
              : "not conducted."}{" "}
            Public comparative assertions still require an independent critical
            review per ISO 14044 §6, which this verification does not replace.
            {data.extractionConfidence !== null &&
            data.extractionConfidence < 0.6
              ? " Parts of the report could not be read with confidence; this verdict carries reduced reliability."
              : ""}
          </Text>
          <Text style={[styles.meta, { marginTop: 8 }]}>
            Generated by the alkatera verifier · verify the claim, not just the
            calculation · alkatera.com
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateReportPdf(data: ReportData): Promise<Buffer> {
  return renderToBuffer(<ReportDocument data={data} />);
}
