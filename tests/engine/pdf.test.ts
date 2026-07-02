import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { extractPdfText, PdfParseError } from "@/lib/extraction/pdf";

const fixturesDir = path.resolve(__dirname, "../fixtures");

function loadFixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync(path.join(fixturesDir, name)));
}

describe("extractPdfText (TASK-015)", () => {
  it("extracts readable text from the known-good alkatera report", async () => {
    const result = await extractPdfText(loadFixture("unrooted-mighty-ginger.pdf"));

    expect(result.totalPages).toBe(25);
    expect(result.isTextSparse).toBe(false);
    const fullText = result.pageTexts.join("\n");
    expect(fullText).toContain("UNROOTED");
    expect(fullText).toContain("Mighty Ginger");
    expect(fullText).toContain("0.087");
    expect(fullText).toContain("Cradle-to-Grave");
  });

  it("extracts the planted mismatch from the flawed fixture", async () => {
    const result = await extractPdfText(loadFixture("flawed-ghg-mismatch.pdf"));
    const fullText = result.pageTexts.join("\n");
    expect(fullText).toContain("0.6100");
    expect(fullText).toContain("0.5200");
    expect(result.isTextSparse).toBe(false);
  });

  it("throws a plain-English PdfParseError for non-PDF bytes", async () => {
    const notAPdf = new TextEncoder().encode("this is not a pdf at all");
    await expect(extractPdfText(notAPdf)).rejects.toThrow(PdfParseError);
  });
});
