import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const fixturesDir = path.resolve(__dirname, "../fixtures");

const PDF_FIXTURES = [
  "unrooted-mighty-ginger.pdf",
  "flawed-ghg-mismatch.pdf",
  "flawed-missing-data-quality.pdf",
  "flawed-wrong-allocation.pdf",
];

describe("PDF fixtures (TASK-014)", () => {
  it.each(PDF_FIXTURES)("%s loads and is a valid PDF", (name) => {
    const bytes = readFileSync(path.join(fixturesDir, name));
    expect(bytes.length).toBeGreaterThan(1000);
    expect(bytes.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });
});
