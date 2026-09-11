import { Skeleton } from "@/components/ui/Skeleton";

export default function VerificationLoading() {
  return (
    <div>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-3 h-9 w-80" />
      <Skeleton className="mt-3 h-3 w-48" />
      <Skeleton className="mt-6 h-28 w-full rounded-md" />
      <Skeleton className="mt-8 h-40 w-full rounded-md" />
      <div className="mt-8 space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
