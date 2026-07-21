import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function ParametresLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <LoadingSkeleton rows={4} />
    </div>
  );
}
