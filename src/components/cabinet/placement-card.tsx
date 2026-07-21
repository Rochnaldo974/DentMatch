"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarDays,
  CheckCircle2,
  MessageSquare,
  Phone,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PlacementStatusBadge } from "@/components/shared/status-badge";
import { PlacementChecklist } from "@/components/cabinet/placement-checklist";
import { openApplicationConversation } from "@/app/actions/applications";
import {
  cancelPlacement,
  completePlacement,
} from "@/app/cabinet/remplacements/actions";
import type { PlacementStatus } from "@/lib/data/reference";

export type CabinetPlacementItem = {
  id: string;
  status: PlacementStatus;
  startDate: string | null;
  endDate: string | null;
  applicationId: string;
  checklist: Record<string, boolean>;
  jobTitle: string;
  replacement: {
    firstName: string;
    lastName: string;
    phone: string | null;
    avatarUrl: string | null;
  };
};

function datesFr(start: string | null, end: string | null): string | null {
  const fmt = (d: string) => format(new Date(d), "d MMMM yyyy", { locale: fr });
  if (start && end) return `Du ${fmt(start)} au ${fmt(end)}`;
  if (start) return `À partir du ${fmt(start)}`;
  return null;
}

/** Carte d'un remplacement du cabinet : remplaçant, dates, checklist, actions. */
export function PlacementCard({ placement }: { placement: CabinetPlacementItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const fullName =
    `${placement.replacement.firstName} ${placement.replacement.lastName}`.trim();
  const initials =
    `${placement.replacement.firstName.charAt(0)}${placement.replacement.lastName.charAt(0)}`.toUpperCase() ||
    "?";

  function handleOpenConversation() {
    startTransition(async () => {
      const result = await openApplicationConversation(placement.applicationId);
      if (result?.error) toast.error(result.error);
    });
  }

  async function runAction(
    action: () => Promise<{ error?: string }>,
    successMessage: string,
  ) {
    const result = await action();
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(successMessage);
      router.refresh();
    }
  }

  return (
    <article className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar className="size-11">
            {placement.replacement.avatarUrl ? (
              <AvatarImage src={placement.replacement.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-semibold leading-snug">{placement.jobTitle}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>{fullName}</span>
              {placement.replacement.phone ? (
                <a
                  href={`tel:${placement.replacement.phone}`}
                  className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
                >
                  <Phone className="size-3.5" aria-hidden />
                  {placement.replacement.phone}
                </a>
              ) : null}
            </div>
            {datesFr(placement.startDate, placement.endDate) ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-3.5" aria-hidden />
                {datesFr(placement.startDate, placement.endDate)}
              </p>
            ) : null}
          </div>
        </div>
        <PlacementStatusBadge status={placement.status} />
      </div>

      <Separator />

      <PlacementChecklist
        placementId={placement.id}
        checklist={placement.checklist}
        readOnly={placement.status !== "confirmed"}
      />

      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={handleOpenConversation}
        >
          <MessageSquare aria-hidden />
          Conversation
        </Button>

        {placement.status === "confirmed" ? (
          <>
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm">
                  <CheckCircle2 aria-hidden />
                  Marquer terminé
                </Button>
              }
              title="Marquer ce remplacement comme terminé ?"
              description={`Le remplacement de ${fullName} sera clôturé. Cette action est définitive.`}
              confirmLabel="Marquer terminé"
              onConfirm={() =>
                runAction(
                  () => completePlacement(placement.id),
                  "Remplacement marqué comme terminé.",
                )
              }
            />
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <XCircle aria-hidden />
                  Annuler
                </Button>
              }
              title="Annuler ce remplacement ?"
              description={`Le remplacement de ${fullName} sera annulé. Pensez à prévenir le remplaçant via la messagerie.`}
              confirmLabel="Annuler le remplacement"
              destructive
              onConfirm={() =>
                runAction(
                  () => cancelPlacement(placement.id),
                  "Remplacement annulé.",
                )
              }
            />
          </>
        ) : null}
      </div>
    </article>
  );
}
