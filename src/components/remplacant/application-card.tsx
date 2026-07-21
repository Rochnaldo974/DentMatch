"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  ExternalLink,
  MapPin,
  MessageSquare,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ApplicationStatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  withdrawApplication,
  openApplicationConversation,
} from "@/app/actions/applications";
import { canWithdrawApplication } from "@/lib/business-rules";
import type { ApplicationStatus } from "@/lib/data/reference";
import { cn } from "@/lib/utils";

export type ApplicationCardData = {
  id: string;
  status: ApplicationStatus;
  /** Date d'envoi relative en français (ex. « il y a 3 jours »). */
  submittedAtFr: string;
  message: string | null;
  jobPostId: string;
  jobTitle: string;
  cabinetName: string | null;
  city: string | null;
  datesFr: string | null;
};

/** Carte d'une candidature du remplaçant (message repliable + actions). */
export function ApplicationCard({ app }: { app: ApplicationCardData }) {
  const router = useRouter();
  const [messageOpen, setMessageOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleOpenConversation() {
    startTransition(async () => {
      const result = await openApplicationConversation(app.id);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <article className="rounded-xl border bg-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-snug">{app.jobTitle}</h3>
          <div className="mt-1.5 space-y-1 text-sm text-muted-foreground">
            {app.cabinetName ? (
              <p className="flex items-center gap-1.5">
                <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
                {app.cabinetName}
              </p>
            ) : null}
            {app.city ? (
              <p className="flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                {app.city}
              </p>
            ) : null}
            {app.datesFr ? (
              <p className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
                {app.datesFr}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
          <ApplicationStatusBadge status={app.status} />
          <p className="text-xs text-muted-foreground">
            Envoyée {app.submittedAtFr}
          </p>
        </div>
      </div>

      {app.message ? (
        <Collapsible open={messageOpen} onOpenChange={setMessageOpen} className="mt-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-200",
                  messageOpen && "rotate-180",
                )}
                aria-hidden="true"
              />
              {messageOpen ? "Masquer mon message" : "Voir mon message"}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="mt-1 rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">
              {app.message}
            </p>
          </CollapsibleContent>
        </Collapsible>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
        <Button asChild variant="outline" size="sm">
          <Link href={`/remplacant/annonces/${app.jobPostId}`}>
            <ExternalLink className="size-4" aria-hidden="true" />
            Voir l&apos;annonce
          </Link>
        </Button>

        {app.status === "accepted" ? (
          <Button
            size="sm"
            disabled={isPending}
            onClick={handleOpenConversation}
          >
            <MessageSquare className="size-4" aria-hidden="true" />
            Ouvrir la conversation
          </Button>
        ) : null}

        {canWithdrawApplication(app.status) ? (
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Undo2 className="size-4" aria-hidden="true" />
                Retirer ma candidature
              </Button>
            }
            title="Retirer cette candidature ?"
            description="Le cabinet ne pourra plus consulter ni accepter votre candidature. Cette action est définitive."
            confirmLabel="Retirer"
            destructive
            onConfirm={async () => {
              const result = await withdrawApplication(app.id);
              if (result.error) toast.error(result.error);
              else {
                toast.success("Candidature retirée.");
                router.refresh();
              }
            }}
          />
        ) : null}
      </div>
    </article>
  );
}
