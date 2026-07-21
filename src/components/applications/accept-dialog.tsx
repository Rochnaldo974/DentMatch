"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { acceptApplication } from "@/app/actions/applications";
import { canAcceptApplication } from "@/lib/business-rules";
import type {
  ApplicationStatus,
  JobPostStatus,
} from "@/lib/data/reference";

/**
 * Dialogue de confirmation d'acceptation d'une candidature.
 * Vérifie les règles métier côté client (revérifiées en base par la
 * fonction transactionnelle accept_application).
 */
export function AcceptDialog({
  applicationId,
  applicationStatus,
  candidateName,
  jobTitle,
  jobDatesFr,
  postStatus,
  positionsCount,
  filledPositionsCount,
}: {
  applicationId: string;
  applicationStatus: ApplicationStatus;
  candidateName: string;
  jobTitle: string;
  jobDatesFr: string | null;
  postStatus: JobPostStatus;
  positionsCount: number;
  filledPositionsCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const isLastPosition = filledPositionsCount + 1 >= positionsCount;
  const [markFilled, setMarkFilled] = useState(isLastPosition);

  const check = canAcceptApplication({
    applicationStatus,
    postStatus,
    acceptedCount: filledPositionsCount,
    positionsCount,
  });

  async function handleAccept() {
    setPending(true);
    const result = await acceptApplication(applicationId, markFilled);
    setPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setOpen(false);
    const conversationId = result.conversationId;
    toast.success("Candidature acceptée. Une conversation a été créée.", {
      action: conversationId
        ? {
            label: "Ouvrir la conversation",
            onClick: () => router.push(`/messages/${conversationId}`),
          }
        : undefined,
    });
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setMarkFilled(isLastPosition);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <CheckCircle2 aria-hidden />
          Accepter la candidature
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accepter cette candidature ?</DialogTitle>
          <DialogDescription>
            Vous êtes sur le point d&apos;accepter la candidature de{" "}
            <span className="font-medium text-foreground">{candidateName}</span>{" "}
            pour l&apos;annonce «&nbsp;{jobTitle}&nbsp;»
            {jobDatesFr ? ` (${jobDatesFr.toLowerCase()})` : null}. Un
            remplacement sera créé et une conversation ouverte avec le candidat.
          </DialogDescription>
        </DialogHeader>

        {check.allowed ? (
          <label className="flex items-start gap-2.5 rounded-lg border p-4 text-sm">
            <Checkbox
              checked={markFilled}
              onCheckedChange={(checked) => setMarkFilled(checked === true)}
              disabled={pending}
            />
            <span className="leading-snug">
              Marquer l&apos;annonce comme pourvue
              <span className="block text-xs text-muted-foreground">
                {isLastPosition
                  ? "Dernière place disponible : l'annonce ne recevra plus de candidatures."
                  : `${filledPositionsCount + 1}/${positionsCount} places seront pourvues.`}
              </span>
            </span>
          </label>
        ) : (
          <Alert variant="destructive">
            <AlertDescription>
              {check.reason ?? "Cette candidature ne peut pas être acceptée."}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleAccept}
            disabled={pending || !check.allowed}
          >
            {pending ? "Acceptation…" : "Confirmer l'acceptation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
