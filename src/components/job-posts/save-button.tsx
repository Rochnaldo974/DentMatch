"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleSavedJobPost } from "@/app/actions/applications";
import { cn } from "@/lib/utils";

/** Enregistrer / retirer une annonce des favoris. */
export function SaveJobPostButton({
  jobPostId,
  saved,
}: {
  jobPostId: string;
  saved: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleSavedJobPost(jobPostId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.saved ? "Annonce enregistrée." : "Annonce retirée des favoris.",
      );
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={isPending}
      onClick={handleClick}
    >
      <Bookmark
        className={cn("size-4", saved && "fill-primary text-primary")}
        aria-hidden="true"
      />
      {saved ? "Enregistrée" : "Enregistrer"}
    </Button>
  );
}
