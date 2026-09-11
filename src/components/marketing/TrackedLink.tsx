"use client";

import { track } from "@/lib/analytics";

/** External link that fires a funnel event on click (TASK-047). */
export function TrackedLink({
  href,
  event,
  className,
  children,
}: {
  href: string;
  event: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => track(event, { href })}
    >
      {children}
    </a>
  );
}
