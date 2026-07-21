"use client";

import { useState, useTransition } from "react";
import { Check, Download, X } from "lucide-react";
import { toast } from "sonner";
import { adminVerifyDocument, adminRejectDocument } from "@/app/actions/admin";
import { adminGetDocumentUrl } from "@/app/admin/documents/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Actions admin sur un document : valider, refuser (motif), télécharger. */
export function DocumentActions({
  documentId,
  isSimulated,
  status,
}: {
  documentId: string;
  isSimulated: boolean;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [downloading, setDownloading] = useState(false);

  function handleVerify() {
    startTransition(async () => {
      const result = await adminVerifyDocument(documentId);
      if (result.error) toast.error(result.error);
      else toast.success("Document validé.");
    });
  }

  function handleReject() {
    if (!reason.trim()) {
      toast.error("Le motif de refus est requis.");
      return;
    }
    startTransition(async () => {
      const result = await adminRejectDocument(documentId, reason);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Document refusé.");
        setRejectOpen(false);
        setReason("");
      }
    });
  }

  async function handleDownload() {
    setDownloading(true);
    const result = await adminGetDocumentUrl(documentId);
    setDownloading(false);
    if (result.error || !result.url) {
      toast.error(result.error ?? "Impossible de générer le lien.");
      return;
    }
    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {!isSimulated ? (
        <Button
          variant="outline"
          size="xs"
          onClick={handleDownload}
          disabled={downloading}
          aria-label="Télécharger le document"
        >
          <Download aria-hidden="true" />
          Télécharger
        </Button>
      ) : null}

      {status !== "verified" ? (
        <Button
          size="xs"
          onClick={handleVerify}
          disabled={pending}
          aria-label="Valider le document"
        >
          <Check aria-hidden="true" />
          Valider
        </Button>
      ) : null}

      {status !== "rejected" ? (
        <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="xs"
              className="text-destructive hover:text-destructive"
              disabled={pending}
              aria-label="Refuser le document"
            >
              <X aria-hidden="true" />
              Refuser
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Refuser le document</DialogTitle>
              <DialogDescription>
                Indiquez le motif du refus. Il sera visible par le propriétaire
                du document.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor={`reject-reason-${documentId}`}>
                Motif du refus
              </Label>
              <Textarea
                id={`reject-reason-${documentId}`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                placeholder="Ex. : document illisible, pièce expirée…"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRejectOpen(false)}
                disabled={pending}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={pending || !reason.trim()}
              >
                {pending ? "En cours…" : "Refuser le document"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
