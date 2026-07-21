"use client";

import { useTransition } from "react";
import { OctagonPause } from "lucide-react";
import { toast } from "sonner";
import { adminSuspendJobPost } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

/** Bouton admin : suspendre une annonce publiée (avec confirmation). */
export function SuspendJobPostButton({
  jobPostId,
  jobPostTitle,
}: {
  jobPostId: string;
  jobPostTitle: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleSuspend() {
    startTransition(async () => {
      const result = await adminSuspendJobPost(jobPostId);
      if (result.error) toast.error(result.error);
      else toast.success("Annonce suspendue.");
    });
  }

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="outline"
          size="xs"
          className="text-destructive hover:text-destructive"
          disabled={pending}
          aria-label={`Suspendre l'annonce ${jobPostTitle}`}
        >
          <OctagonPause aria-hidden="true" />
          Suspendre
        </Button>
      }
      title="Suspendre cette annonce ?"
      description={`L'annonce « ${jobPostTitle} » ne sera plus visible des remplaçants. Cette action est réservée à la modération.`}
      confirmLabel="Suspendre l'annonce"
      destructive
      onConfirm={handleSuspend}
    />
  );
}
