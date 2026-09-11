import { Skeleton } from "@/components/ui/Skeleton";

export default function VerifyLoading() {
  return (
    <div>
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-3 h-9 w-56" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <Skeleton className="mt-6 h-48 w-full rounded-md" />
      <Skeleton className="mt-6 h-64 w-full rounded-md" />
    </div>
  );
}
