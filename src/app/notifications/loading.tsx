import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function NotificationsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <LoadingSkeleton rows={5} />
    </div>
  );
}
