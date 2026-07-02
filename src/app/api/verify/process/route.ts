import { after, NextResponse } from "next/server";
import { runVerification } from "@/lib/engine/run";

/**
 * POST /api/verify/process — async verification worker (TASK-027).
 * Accepts fast (202) and processes via after() so the caller's timeout
 * cannot kill the run; extraction + reasoning need the raised maxDuration.
 * Only pending/failed records are claimable, so stray calls are harmless.
 */
export const maxDuration = 300;

export async function POST(request: Request) {
  let verificationId: string | undefined;
  try {
    const body = await request.json();
    verificationId = typeof body.verificationId === "string" ? body.verificationId : undefined;
  } catch {
    // fall through to the 400 below
  }

  if (!verificationId) {
    return NextResponse.json(
      { error: "Missing verificationId" },
      { status: 400 },
    );
  }

  const id = verificationId;
  after(async () => {
    await runVerification(id);
  });

  return NextResponse.json({ accepted: true }, { status: 202 });
}
