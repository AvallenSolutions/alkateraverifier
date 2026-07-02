import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-9 w-64" />
      <div className="mt-6 space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
