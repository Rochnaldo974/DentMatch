"use client";

import { useTransition } from "react";
import { BadgeCheck, Clock, MoreHorizontal, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { adminSetProfileVerification } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Menu d'actions admin sur la vérification d'un profil. */
export function UserVerificationActions({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [pending, startTransition] = useTransition();

  function setStatus(status: "verified" | "pending" | "rejected") {
    startTransition(async () => {
      const result = await adminSetProfileVerification(userId, status);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Statut de vérification mis à jour.");
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={pending}
          aria-label={`Actions pour ${userName}`}
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Vérification du profil</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setStatus("verified")}>
          <BadgeCheck className="size-4" aria-hidden="true" />
          Marquer vérifié
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setStatus("pending")}>
          <Clock className="size-4" aria-hidden="true" />
          Mettre en attente
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => setStatus("rejected")}
        >
          <ShieldX className="size-4" aria-hidden="true" />
          Refuser la vérification
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
