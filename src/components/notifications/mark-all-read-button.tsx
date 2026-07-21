"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markAllNotificationsRead } from "@/app/actions/notifications";

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Toutes les notifications ont été marquées comme lues.");
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      <CheckCheck aria-hidden="true" />
      Tout marquer comme lu
    </Button>
  );
}
