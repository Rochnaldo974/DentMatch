import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function OnboardingLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <LoadingSkeleton rows={3} />
    </div>
  );
}
