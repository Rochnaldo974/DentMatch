import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function MessagesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
      </div>
      <LoadingSkeleton rows={4} />
    </div>
  );
}
