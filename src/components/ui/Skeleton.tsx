/** Loading placeholder block (TASK-045). */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-sm bg-surface-sunken ${className}`}
    />
  );
}
