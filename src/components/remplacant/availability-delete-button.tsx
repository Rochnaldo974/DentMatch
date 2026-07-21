"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteAvailability } from "@/app/actions/onboarding-remplacant";

/** Suppression d'une disponibilité avec confirmation. */
export function AvailabilityDeleteButton({ id }: { id: string }) {
  const router = useRouter();

  return (
    <ConfirmDialog
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Supprimer cette disponibilité"
        >
          <Trash2 className="size-4 text-destructive" aria-hidden="true" />
        </Button>
      }
      title="Supprimer cette disponibilité ?"
      description="Elle ne sera plus prise en compte dans les suggestions d'annonces."
      confirmLabel="Supprimer"
      destructive
      onConfirm={async () => {
        const result = await deleteAvailability(id);
        if (result.error) toast.error(result.error);
        else {
          toast.success("Disponibilité supprimée.");
          router.refresh();
        }
      }}
    />
  );
}
