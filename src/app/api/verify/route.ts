import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import {
  createVerification,
  enqueueProcessing,
  MAX_UPLOAD_BYTES,
  VerificationCreateError,
} from "@/lib/verifications/create";

/**
 * POST /api/verify — LCA PDF ingestion (FR-001, TASK-018/021).
 * Multipart body: file (PDF), selectedStandardCodes (repeated fields or a
 * JSON array string). Creates a pending verification and enqueues processing.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Each verification costs Claude tokens — cap per user (TASK-048).
  const rate = checkRateLimit(`upload:${user.id}`, 10, 60 * 60 * 1000);
  if (!rate.allowed) {
    return rateLimitResponse(rate);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Send the upload as multipart form data." },
      { status: 400 },
    );
  }

  // --- File validation (reject before storage, PRD § Edge Cases) ---
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Attach your LCA report as a PDF file." },
      { status: 400 },
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      {
        error: `This file is larger than ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB. Export a smaller PDF and try again.`,
      },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const isPdf =
    new TextDecoder("latin1").decode(bytes.subarray(0, 5)) === "%PDF-";
  if (!isPdf) {
    return NextResponse.json(
      { error: "Only PDF files are supported. Upload your LCA report as a PDF." },
      { status: 400 },
    );
  }

  // --- Standards selection validation (FR-003) ---
  const rawCodes = formData.getAll("selectedStandardCodes").map(String);
  let codes: string[] = rawCodes;
  if (rawCodes.length === 1 && rawCodes[0].trim().startsWith("[")) {
    try {
      codes = JSON.parse(rawCodes[0]);
    } catch {
      codes = [];
    }
  }
  codes = [...new Set(codes.filter((code) => typeof code === "string" && code))];

  if (codes.length === 0) {
    return NextResponse.json(
      { error: "Choose at least one standard to verify against." },
      { status: 400 },
    );
  }

  const { data: standards, error: standardsError } = await supabase
    .from("standards")
    .select("id, code")
    .in("code", codes)
    .eq("is_active", true);

  if (standardsError || !standards || standards.length !== codes.length) {
    return NextResponse.json(
      { error: "One or more selected standards are not available." },
      { status: 400 },
    );
  }

  // --- Create record + enqueue ---
  try {
    const verification = await createVerification({
      userId: user.id,
      bytes,
      selectedStandardIds: standards.map((standard) => standard.id),
    });

    await enqueueProcessing(verification.id);

    return NextResponse.json(
      { id: verification.id, status: verification.status },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof VerificationCreateError
        ? error.message
        : "Something went wrong storing your upload. Try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
