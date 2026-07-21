"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openApplicationConversation } from "@/app/actions/applications";

/** Ouvre (ou crée) la conversation liée à une candidature acceptée. */
export function OpenConversationButton({
  applicationId,
  size = "sm",
  variant = "outline",
}: {
  applicationId: string;
  size?: "sm" | "default";
  variant?: "outline" | "default" | "secondary";
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size={size}
      variant={variant}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await openApplicationConversation(applicationId);
          if (result?.error) toast.error(result.error);
        })
      }
    >
      <MessageSquare className="size-4" aria-hidden="true" />
      {isPending ? "Ouverture…" : "Ouvrir la conversation"}
    </Button>
  );
}
