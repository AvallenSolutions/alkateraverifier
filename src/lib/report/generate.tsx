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
 * calculation checks, cited findings, and strictly scoped disclaimer.
 * Built-in PDF fonts stand in for the web stack: Times (serif display),
 * Helvetica (body), Courier (data).
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
  not_certified: "#A0554A",
  bronze: "#9A6532",
  silver: "#9CA3AC",
  gold: "#C6A02A",
  platinum: "#54707D",
};

const RESULT_LABELS: Record<string, string> = {
  conforms: "CONFORMS",
  minor_gap: "MINOR GAP",
  major_gap: "MAJOR GAP",
  insufficient_info: "INSUFFICIENT INFO",
};

const RESULT_COLOURS: Record<string, string> = {
  conforms: "#3F7A34",
  minor_gap: "#C08A1E",
  major_gap: "#B4342A",
  insufficient_info: "#3A6B8C",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FAF8F3",
    color: "#1C1B18",
    padding: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  eyebrow: {
    fontFamily: "Courier",
    fontSize: 8,
    letterSpacing: 1.5,
    color: "#8B887E",
    marginBottom: 6,
  },
  title: { fontFamily: "Times-Bold", fontSize: 22, marginBottom: 4 },
  meta: { fontFamily: "Courier", fontSize: 8, color: "#5E5C55" },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  tierPill: {
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 14,
    color: "#FFFFFF",
    fontFamily: "Courier-Bold",
    fontSize: 11,
    letterSpacing: 1,
  },
  score: { marginLeft: 12, fontFamily: "Courier", fontSize: 11 },
  section: { marginTop: 18 },
  sectionTitle: { fontFamily: "Times-Bold", fontSize: 14, marginBottom: 6 },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E1D6",
    borderRadius: 4,
    padding: 10,
    marginBottom: 6,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: {
    fontFamily: "Courier",
    fontSize: 7,
    letterSpacing: 1,
    color: "#8B887E",
  },
  body: { fontSize: 9, lineHeight: 1.5, color: "#1C1B18" },
  muted: { fontSize: 8, lineHeight: 1.5, color: "#5E5C55" },
  resultChip: { fontFamily: "Courier-Bold", fontSize: 8 },
  disclaimer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E1D6",
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
      title={`LCA Verification Report — ${data.productName ?? data.verificationId}`}
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>ALKATERA LCA VERIFIER — VERIFICATION REPORT</Text>
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
          <Text
            style={[styles.tierPill, { backgroundColor: TIER_COLOURS[data.tier] }]}
          >
            {TIER_LABELS[data.tier]}
          </Text>
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
                    { color: gate.passed ? "#3F7A34" : "#B4342A" },
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
                      { color: check.passed ? "#3F7A34" : "#B4342A" },
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
                    { color: RESULT_COLOURS[finding.result] ?? "#1C1B18" },
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
            Generated by the alkatera LCA Verifier — verify the claim, not just
            the calculation. alkatera.com
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateReportPdf(data: ReportData): Promise<Buffer> {
  return renderToBuffer(<ReportDocument data={data} />);
}
