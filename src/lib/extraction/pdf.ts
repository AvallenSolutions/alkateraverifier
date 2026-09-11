import { extractText, getDocumentProxy, renderPageAsImage } from "unpdf";

/**
 * Server-side PDF text extraction (TASK-015). Text-first per PRD § Open
 * Questions; when the text layer is sparse (scanned/image-only reports),
 * callers fall back to vision-based extraction on rendered page images.
 */

export interface PdfTextResult {
  pageTexts: string[];
  totalPages: number;
  totalCharacters: number;
  /** True when the text layer is too thin to extract from reliably. */
  isTextSparse: boolean;
}

/** Below this many characters per page on average, treat the PDF as image-only. */
const SPARSE_CHARS_PER_PAGE = 200;

export class PdfParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfParseError";
  }
}

export async function extractPdfText(
  bytes: Uint8Array | ArrayBuffer,
): Promise<PdfTextResult> {
  let pdf;
  try {
    // Copy: pdf.js takes ownership of the buffer and detaches it, which
    // would destroy the caller's bytes (needed again for the vision fallback).
    pdf = await getDocumentProxy(
      bytes instanceof Uint8Array ? bytes.slice() : new Uint8Array(bytes),
    );
  } catch {
    throw new PdfParseError(
      "We could not open this file as a PDF. Check it is the full, unencrypted report, then try again.",
    );
  }

  try {
    const { totalPages, text } = await extractText(pdf, { mergePages: false });
    const pageTexts = (text as string[]).map((page) => page.trim());
    const totalCharacters = pageTexts.reduce(
      (sum, page) => sum + page.length,
      0,
    );

    return {
      pageTexts,
      totalPages,
      totalCharacters,
      isTextSparse:
        totalPages === 0 ||
        totalCharacters / totalPages < SPARSE_CHARS_PER_PAGE,
    };
  } catch {
    throw new PdfParseError(
      "We could not read the contents of this PDF. Re-export it from your LCA platform and try again.",
    );
  } finally {
    await pdf.destroy();
  }
}

/**
 * Render pages as PNG images for vision-based extraction when the text
 * layer is sparse. Capped to keep Claude cost per verification low.
 */
export async function renderPdfPageImages(
  bytes: Uint8Array | ArrayBuffer,
  maxPages = 25,
): Promise<Uint8Array[]> {
  // Copy for the same buffer-detachment reason as extractPdfText.
  const data =
    bytes instanceof Uint8Array ? bytes.slice() : new Uint8Array(bytes);
  const pdf = await getDocumentProxy(data);
  try {
    const pageCount = Math.min(pdf.numPages, maxPages);
    const images: Uint8Array[] = [];
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
      const image = await renderPageAsImage(pdf, pageNumber, { scale: 1.5 });
      images.push(new Uint8Array(image));
    }
    return images;
  } finally {
    await pdf.destroy();
  }
}
