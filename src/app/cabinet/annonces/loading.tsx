import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-44" />
      </div>
      <Skeleton className="h-9 w-full max-w-md" />
      <LoadingSkeleton rows={4} />
    </div>
  );
}
