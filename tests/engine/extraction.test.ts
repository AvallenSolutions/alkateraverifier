import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import type Anthropic from "@anthropic-ai/sdk";
import {
  ExtractionError,
  extractLcaFromPdf,
  LOW_CONFIDENCE_THRESHOLD,
  NotAnLcaError,
  structuralCompleteness,
} from "@/lib/extraction/extract";
import { PdfParseError } from "@/lib/extraction/pdf";
import { lcaExtractionSchema, type LcaExtraction } from "@/types/lca";

const fixturesDir = path.resolve(__dirname, "../fixtures");

const knownGoodPdf = new Uint8Array(
  readFileSync(path.join(fixturesDir, "unrooted-mighty-ginger.pdf")),
);
const expectedLca: LcaExtraction = lcaExtractionSchema.parse(
  JSON.parse(
    readFileSync(
      path.join(fixturesDir, "unrooted-mighty-ginger.expected.json"),
      "utf-8",
    ),
  ),
);

/** A stub Anthropic client whose parse() returns the given payload. */
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

/** An extraction where Claude found almost nothing. */
function emptyLca(): LcaExtraction {
  return lcaExtractionSchema.parse({
    product: {
      name: null,
      company: null,
      functionalUnit: null,
      referenceYear: null,
      reportDate: null,
      reportVersion: null,
      sourcePlatform: null,
    },
    goalAndScope: {
      intendedApplication: null,
      intendedAudience: [],
      reasonsForStudy: null,
      comparativeAssertion: null,
      systemBoundary: null,
      includedStages: [],
      excludedStages: [],
      cutOffCriteria: null,
    },
    methodology: {
      lciaMethod: null,
      gwpMethod: null,
      referenceStandards: [],
      databases: [],
    },
    impacts: {
      climateTotalKgCo2e: null,
      fossilKgCo2e: null,
      biogenicKgCo2e: null,
      lulucKgCo2e: null,
      waterLitres: null,
      waterScarcityWeightedLitresEq: null,
      landUseM2: null,
      otherCategories: [],
      zeroImpactCategories: [],
    },
    lifecycleStages: [],
    ghgSpecies: [],
    ghgTotalAllSpeciesKgCo2e: null,
    scopeSplit: {
      scope1Percent: null,
      scope2Percent: null,
      scope3Percent: null,
    },
    dataQuality: {
      overallScorePercent: null,
      overallRating: null,
      pedigree: {
        reliability: null,
        completeness: null,
        temporal: null,
        geographic: null,
        technological: null,
      },
      primarySharePercent: null,
      secondarySharePercent: null,
      proxySharePercent: null,
      totalMaterials: null,
      materials: [],
    },
    allocation: {
      procedure: null,
      basis: null,
      avoidedBySubdivisionOrExpansion: null,
    },
    endOfLife: {
      grossKgCo2e: null,
      creditsKgCo2e: null,
      netKgCo2e: null,
      pathways: [],
    },
    topContributors: [],
    uncertainty: {
      propagatedPercent: null,
      ci95LowKgCo2e: null,
      ci95HighKgCo2e: null,
      uncertaintyAnalysisPresent: false,
      sensitivityAnalysisPresent: false,
      methodologyNotes: null,
    },
    criticalReview: { conducted: null, reviewer: null, notes: null },
    interpretation: {
      significantIssues: null,
      keyFindings: [],
      limitations: [],
      recommendations: [],
    },
  });
}

describe("extractLcaFromPdf (TASK-016/017, mocked Claude)", () => {
  it("returns the extraction with expected headline values", async () => {
    const client = stubClient({
      lca: expectedLca,
      confidence: 0.95,
      missingSections: [],
      isLcaReport: true,
    });

    const result = await extractLcaFromPdf(knownGoodPdf, { client });

    expect(result.lca.product.name).toContain("Mighty Ginger");
    expect(result.lca.impacts.climateTotalKgCo2e).toBeCloseTo(0.087, 3);
    expect(result.lca.ghgTotalAllSpeciesKgCo2e).toBeCloseTo(0.0866, 4);
    expect(result.confidence).toBeGreaterThanOrEqual(LOW_CONFIDENCE_THRESHOLD);
  });

  it("caps confidence at structural completeness (no silent guesses)", async () => {
    // Claude claims high confidence but found almost nothing.
    const client = stubClient({
      lca: emptyLca(),
      confidence: 0.9,
      missingSections: ["goal and scope", "data quality assessment"],
      isLcaReport: true,
    });

    const result = await extractLcaFromPdf(knownGoodPdf, { client });

    expect(structuralCompleteness(result.lca)).toBe(0);
    expect(result.confidence).toBeLessThan(LOW_CONFIDENCE_THRESHOLD);
  });

  it("rejects non-LCA documents with a plain-English error", async () => {
    const client = stubClient({
      lca: emptyLca(),
      confidence: 0.2,
      missingSections: ["everything"],
      isLcaReport: false,
    });

    await expect(extractLcaFromPdf(knownGoodPdf, { client })).rejects.toThrow(
      NotAnLcaError,
    );
  });

  it("throws a retryable ExtractionError when parsing fails", async () => {
    const client = stubClient(null);
    await expect(extractLcaFromPdf(knownGoodPdf, { client })).rejects.toThrow(
      ExtractionError,
    );
  });

  it("propagates PdfParseError for unreadable bytes", async () => {
    const client = stubClient({});
    const notAPdf = new TextEncoder().encode("not a pdf");
    await expect(extractLcaFromPdf(notAPdf, { client })).rejects.toThrow(
      PdfParseError,
    );
  });
});

// Live integration test — runs only when an API key is configured.
// Verifies FR-002 against the real alkatera example report.
describe.skipIf(!process.env.ANTHROPIC_API_KEY)(
  "extractLcaFromPdf (live Claude integration)",
  () => {
    it(
      "extracts the known-good report with high confidence and correct figures",
      { timeout: 300_000 },
      async () => {
        const result = await extractLcaFromPdf(knownGoodPdf);

        expect(result.lca.product.name).toMatch(/Mighty Ginger/i);
        expect(result.lca.product.sourcePlatform?.toLowerCase()).toContain(
          "alkatera",
        );
        expect(result.lca.impacts.climateTotalKgCo2e).toBeCloseTo(0.087, 2);
        expect(result.lca.ghgTotalAllSpeciesKgCo2e).toBeCloseTo(0.0866, 2);
        expect(result.lca.dataQuality.primarySharePercent).toBe(0);
        expect(result.lca.lifecycleStages.length).toBeGreaterThanOrEqual(5);
        expect(result.lca.endOfLife.netKgCo2e).toBeCloseTo(-0.0126, 2);
        expect(result.lca.criticalReview.conducted).toBe(false);
        expect(result.confidence).toBeGreaterThanOrEqual(0.75);
      },
    );
  },
);
