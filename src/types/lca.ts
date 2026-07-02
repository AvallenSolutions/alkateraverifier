import { z } from "zod";

/**
 * Structured LCA extraction schema (FR-002), modelled on real product LCA
 * reports (the alkatera/UNROOTED example is the reference layout) but
 * platform-agnostic.
 *
 * Every field an arbitrary report might omit is nullable: extraction must
 * record "not stated" explicitly rather than guess (product principle:
 * never assert without a citation). Missing data later drives
 * insufficient_info findings, not defaults.
 */

export const dataSourceTypeSchema = z.enum(["primary", "secondary", "proxy"]);

export const lifecycleStageNameSchema = z.enum([
  "raw_materials",
  "processing",
  "packaging",
  "distribution",
  "use_phase",
  "end_of_life",
  "other",
]);

const nullableNumber = z.number().nullable();
const nullableString = z.string().nullable();

export const productSchema = z.object({
  name: nullableString,
  company: nullableString,
  functionalUnit: nullableString,
  referenceYear: z.number().int().nullable(),
  reportDate: nullableString,
  reportVersion: nullableString,
  // e.g. "alkatera", "Orbis Advisory", "unknown"
  sourcePlatform: nullableString,
});

export const goalAndScopeSchema = z.object({
  intendedApplication: nullableString,
  intendedAudience: z.array(z.string()),
  reasonsForStudy: nullableString,
  // Whether the study supports public comparative assertions.
  comparativeAssertion: z.boolean().nullable(),
  // Verbatim boundary statement, e.g. "Cradle-to-Grave".
  systemBoundary: nullableString,
  includedStages: z.array(z.string()),
  excludedStages: z.array(z.string()),
  cutOffCriteria: nullableString,
});

export const methodologySchema = z.object({
  lciaMethod: nullableString, // e.g. "ReCiPe 2016 v1.1 Midpoint (H)"
  gwpMethod: nullableString, // e.g. "IPCC AR6 GWP-100"
  referenceStandards: z.array(z.string()),
  databases: z.array(
    z.object({
      name: z.string(), // e.g. "ecoinvent"
      version: nullableString,
      factorCount: z.number().int().nullable(),
    }),
  ),
});

export const impactCategorySchema = z.object({
  name: z.string(), // e.g. "Acidification"
  value: z.number(),
  unit: z.string(), // e.g. "kg SO2-eq"
});

export const impactsSchema = z.object({
  // Headline climate figure as printed (kg CO2e per functional unit).
  climateTotalKgCo2e: nullableNumber,
  fossilKgCo2e: nullableNumber,
  biogenicKgCo2e: nullableNumber,
  lulucKgCo2e: nullableNumber,
  waterLitres: nullableNumber,
  waterScarcityWeightedLitresEq: nullableNumber,
  landUseM2: nullableNumber,
  otherCategories: z.array(impactCategorySchema),
  zeroImpactCategories: z.array(
    z.object({ name: z.string(), reason: nullableString }),
  ),
});

export const lifecycleStageSchema = z.object({
  stage: lifecycleStageNameSchema,
  label: z.string(), // as printed, e.g. "Raw Materials"
  kgCo2e: z.number(), // may be negative (EoL credits)
  sharePercent: nullableNumber,
});

export const ghgSpeciesRowSchema = z.object({
  species: z.string(), // e.g. "CO2 (fossil)", "CH4 (biogenic)", "N2O"
  massKg: nullableNumber,
  co2eKg: nullableNumber,
  gwp100: nullableNumber,
});

export const scopeSplitSchema = z.object({
  scope1Percent: nullableNumber,
  scope2Percent: nullableNumber,
  scope3Percent: nullableNumber,
});

export const pedigreeSchema = z.object({
  // ISO 14044 §4.2.3.6 pedigree matrix, 1 (best) to 5 (worst).
  reliability: nullableNumber,
  completeness: nullableNumber,
  temporal: nullableNumber,
  geographic: nullableNumber,
  technological: nullableNumber,
});

export const materialDataQualitySchema = z.object({
  name: z.string(),
  sourceType: dataSourceTypeSchema.nullable(),
  grade: nullableString, // e.g. "HIGH", "MEDIUM"
  confidencePercent: nullableNumber,
  geography: nullableString,
});

export const dataQualitySchema = z.object({
  overallScorePercent: nullableNumber,
  overallRating: nullableString, // e.g. "Poor" | "Fair" | "Good" | "Excellent"
  pedigree: pedigreeSchema,
  primarySharePercent: nullableNumber,
  secondarySharePercent: nullableNumber,
  proxySharePercent: nullableNumber,
  totalMaterials: z.number().int().nullable(),
  materials: z.array(materialDataQualitySchema),
});

export const allocationSchema = z.object({
  // Verbatim description of the allocation procedure.
  procedure: nullableString,
  // Normalised basis, e.g. "physical-mass", "physical-volume", "economic".
  basis: nullableString,
  avoidedBySubdivisionOrExpansion: z.boolean().nullable(),
});

export const eolPathwaySchema = z.object({
  material: z.string(),
  massKg: nullableNumber,
  recyclingPercent: nullableNumber,
  landfillPercent: nullableNumber,
  incinerationPercent: nullableNumber,
  compostingPercent: nullableNumber,
  anaerobicDigestionPercent: nullableNumber,
  netKgCo2e: nullableNumber,
});

export const endOfLifeSchema = z.object({
  grossKgCo2e: nullableNumber,
  creditsKgCo2e: nullableNumber, // negative = avoided burden
  netKgCo2e: nullableNumber,
  pathways: z.array(eolPathwaySchema),
});

export const contributorSchema = z.object({
  name: z.string(),
  kgCo2e: nullableNumber,
  sharePercent: nullableNumber,
});

export const uncertaintySchema = z.object({
  propagatedPercent: nullableNumber, // e.g. ±22 (95% CI)
  ci95LowKgCo2e: nullableNumber,
  ci95HighKgCo2e: nullableNumber,
  uncertaintyAnalysisPresent: z.boolean(),
  sensitivityAnalysisPresent: z.boolean(),
  methodologyNotes: nullableString,
});

export const criticalReviewSchema = z.object({
  conducted: z.boolean().nullable(),
  reviewer: nullableString,
  notes: nullableString,
});

export const interpretationSchema = z.object({
  significantIssues: nullableString,
  keyFindings: z.array(z.string()),
  limitations: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export const lcaExtractionSchema = z.object({
  product: productSchema,
  goalAndScope: goalAndScopeSchema,
  methodology: methodologySchema,
  impacts: impactsSchema,
  lifecycleStages: z.array(lifecycleStageSchema),
  ghgSpecies: z.array(ghgSpeciesRowSchema),
  ghgTotalAllSpeciesKgCo2e: nullableNumber,
  scopeSplit: scopeSplitSchema,
  dataQuality: dataQualitySchema,
  allocation: allocationSchema,
  endOfLife: endOfLifeSchema,
  topContributors: z.array(contributorSchema),
  uncertainty: uncertaintySchema,
  criticalReview: criticalReviewSchema,
  interpretation: interpretationSchema,
});

export type LcaExtraction = z.infer<typeof lcaExtractionSchema>;
export type LifecycleStageName = z.infer<typeof lifecycleStageNameSchema>;
export type DataSourceType = z.infer<typeof dataSourceTypeSchema>;

/**
 * What the extraction step returns: the structured LCA plus an explicit
 * confidence and the sections the extractor could not find. Low confidence
 * is a first-class state (FR-002), never a silent guess.
 */
export const extractionPayloadSchema = z.object({
  lca: lcaExtractionSchema,
  confidence: z.number().min(0).max(1),
  missingSections: z.array(z.string()),
  // True when the document does not look like an LCA report at all.
  isLcaReport: z.boolean(),
});

export type ExtractionPayload = z.infer<typeof extractionPayloadSchema>;
