"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

/** Fires a funnel event exactly once when rendered (TASK-047). */
export function TrackOnMount({
  event,
  properties,
}: {
  event: string;
  properties?: Record<string, string | number | boolean | null>;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, properties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
