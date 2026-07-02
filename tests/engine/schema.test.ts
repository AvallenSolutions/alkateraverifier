import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { lcaExtractionSchema } from "@/types/lca";

const fixturePath = path.resolve(
  __dirname,
  "../fixtures/unrooted-mighty-ginger.expected.json",
);

describe("lcaExtractionSchema (TASK-013)", () => {
  it("parses the hand-built UNROOTED fixture object", () => {
    const raw = JSON.parse(readFileSync(fixturePath, "utf-8"));
    const parsed = lcaExtractionSchema.parse(raw);

    expect(parsed.product.name).toBe(
      "UNROOTED Mighty Ginger, Chilli & Baobab Shot 60ml",
    );
    expect(parsed.impacts.climateTotalKgCo2e).toBeCloseTo(0.087, 5);
    expect(parsed.lifecycleStages).toHaveLength(6);
    expect(parsed.dataQuality.primarySharePercent).toBe(0);
    expect(parsed.ghgTotalAllSpeciesKgCo2e).toBeCloseTo(0.0866, 5);
    expect(parsed.endOfLife.netKgCo2e).toBeCloseTo(-0.0126, 5);
    expect(parsed.criticalReview.conducted).toBe(false);
  });

  it("rejects an object missing required sections", () => {
    const result = lcaExtractionSchema.safeParse({ product: { name: "x" } });
    expect(result.success).toBe(false);
  });

  it("records unstated values as explicit nulls, not defaults", () => {
    const raw = JSON.parse(readFileSync(fixturePath, "utf-8"));
    raw.impacts.climateTotalKgCo2e = null;
    raw.product.referenceYear = null;
    const parsed = lcaExtractionSchema.parse(raw);
    expect(parsed.impacts.climateTotalKgCo2e).toBeNull();
    expect(parsed.product.referenceYear).toBeNull();
  });
});
