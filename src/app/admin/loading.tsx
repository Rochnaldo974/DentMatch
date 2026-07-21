import {
  LoadingSkeleton,
  StatsSkeleton,
} from "@/components/shared/loading-skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      </div>
      <StatsSkeleton />
      <LoadingSkeleton rows={3} />
    </div>
  );
}
