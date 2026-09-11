"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

/**
 * Fires the magic-moment funnel event exactly once when a completed
 * verification result first renders (TASK-032).
 */
export function MagicMomentEvent({
  verificationId,
  tier,
}: {
  verificationId: string;
  tier: string;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track("verification_completed", { verification_id: verificationId, tier });
  }, [verificationId, tier]);

  return null;
}
