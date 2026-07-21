"use client";

import { useRef, useState, useTransition } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Download,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DocumentStatusBadge,
  SimulatedBadge,
} from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  uploadDocument,
  simulateDocument,
  deleteDocument,
  getDocumentDownloadUrl,
} from "@/app/actions/documents";
import { DEMO_MODE, DOCUMENTS_DISCLAIMER } from "@/lib/constants";
import type { DocumentTypeDef } from "@/lib/data/reference";
import type { Tables } from "@/types/database";

type DocumentRow = Tables<"documents">;

function DocumentLine({
  def,
  doc,
  ownerType,
}: {
  def: DocumentTypeDef;
  doc: DocumentRow | undefined;
  ownerType: "cabinet" | "replacement_dentist";
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [simulating, setSimulating] = useState(false);

  const handleUpload = (file: File) => {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("documentType", def.type);
    formData.set("ownerType", ownerType);
    startTransition(async () => {
      const result = await uploadDocument(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`« ${def.label} » téléversé.`);
        router.refresh();
      }
    });
  };

  const handleSimulate = () => {
    setSimulating(true);
    startTransition(async () => {
      // Courte transition pour matérialiser la « vérification ».
      await new Promise((r) => setTimeout(r, 800));
      const result = await simulateDocument({
        documentType: def.type,
        ownerType,
      });
      setSimulating(false);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Document simulé validé pour « ${def.label} ».`);
        router.refresh();
      }
    });
  };

  const handleDownload = () => {
    if (!doc) return;
    startTransition(async () => {
      const result = await getDocumentDownloadUrl(doc.id);
      if (result.error || !result.url) {
        toast.error(result.error ?? "Téléchargement impossible.");
      } else {
        window.open(result.url, "_blank", "noopener");
      }
    });
  };

  const status = doc?.status ?? "missing";

  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <FileText
            className="size-4.5 text-secondary-foreground"
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {def.label}
            {def.required ? (
              <span className="text-destructive" aria-hidden="true">
                {" "}
                *
              </span>
            ) : null}
          </p>
          {def.hint ? (
            <p className="text-xs text-muted-foreground">{def.hint}</p>
          ) : null}
          {doc ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {doc.original_name} — ajouté le{" "}
              {format(new Date(doc.created_at), "d MMMM yyyy", { locale: fr })}
            </p>
          ) : null}
          {doc?.status === "rejected" && doc.rejection_reason ? (
            <p className="mt-1 text-xs text-destructive">
              Motif : {doc.rejection_reason}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <DocumentStatusBadge status={status} />
            {doc?.is_simulated ? <SimulatedBadge /> : null}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label={`Téléverser ${def.label}`}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" aria-hidden="true" />
          {doc ? "Remplacer" : "Téléverser"}
        </Button>
        {DEMO_MODE && !doc?.is_simulated ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isPending}
            onClick={handleSimulate}
          >
            {simulating ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="size-4" aria-hidden="true" />
            )}
            Simuler un document valide
          </Button>
        ) : null}
        {doc && !doc.is_simulated && doc.storage_path ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isPending}
            onClick={handleDownload}
            aria-label={`Télécharger ${def.label}`}
          >
            <Download className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
        {doc ? (
          <ConfirmDialog
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                aria-label={`Supprimer ${def.label}`}
              >
                <Trash2 className="size-4 text-destructive" aria-hidden="true" />
              </Button>
            }
            title="Supprimer ce document ?"
            description={`« ${def.label} » sera définitivement supprimé.`}
            confirmLabel="Supprimer"
            destructive
            onConfirm={async () => {
              const result = await deleteDocument(doc.id);
              if (result.error) toast.error(result.error);
              else {
                toast.success("Document supprimé.");
                router.refresh();
              }
            }}
          />
        ) : null}
      </div>
    </li>
  );
}

/**
 * Gestionnaire de documents : téléversement réel ou simulation (mode démo),
 * suppression, remplacement, téléchargement via URL signée.
 */
export function DocumentManager({
  definitions,
  documents,
  ownerType,
}: {
  definitions: DocumentTypeDef[];
  documents: DocumentRow[];
  ownerType: "cabinet" | "replacement_dentist";
}) {
  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {definitions.map((def) => (
          <DocumentLine
            key={def.type}
            def={def}
            doc={documents.find((d) => d.document_type === def.type)}
            ownerType={ownerType}
          />
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">{DOCUMENTS_DISCLAIMER}</p>
    </div>
  );
}
