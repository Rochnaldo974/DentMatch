import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import {
  DocumentStatusBadge,
  SimulatedBadge,
} from "@/components/shared/status-badge";
import { DocumentActions } from "@/components/admin/document-actions";
import { DOCUMENT_TYPE_LABELS } from "@/lib/data/reference";
import type { Enums } from "@/types/database";

export const metadata: Metadata = {
  title: "Documents",
};

type DocumentRow = {
  id: string;
  document_type: string;
  original_name: string;
  owner_type: string;
  status: Enums<"document_status">;
  is_simulated: boolean;
  created_at: string;
  profiles: { first_name: string; last_name: string } | null;
};

function ownerTypeLabel(ownerType: string) {
  return ownerType === "cabinet" ? "Cabinet" : "Remplaçant";
}

function DocumentsTable({ rows }: { rows: DocumentRow[] }) {
  return (
    <div className="hidden rounded-xl border bg-card lg:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4">Type</TableHead>
            <TableHead>Fichier</TableHead>
            <TableHead>Propriétaire</TableHead>
            <TableHead>Compte</TableHead>
            <TableHead>Déposé le</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="px-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((doc) => {
            const ownerName = doc.profiles
              ? `${doc.profiles.first_name} ${doc.profiles.last_name}`.trim()
              : "—";
            return (
              <TableRow key={doc.id}>
                <TableCell className="px-4 font-medium">
                  {DOCUMENT_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                </TableCell>
                <TableCell className="max-w-52 truncate text-muted-foreground">
                  {doc.original_name}
                </TableCell>
                <TableCell>{ownerName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {ownerTypeLabel(doc.owner_type)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {format(new Date(doc.created_at), "d MMM yyyy", {
                    locale: fr,
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <DocumentStatusBadge status={doc.status} />
                    {doc.is_simulated ? <SimulatedBadge /> : null}
                  </div>
                </TableCell>
                <TableCell className="px-4">
                  <DocumentActions
                    documentId={doc.id}
                    isSimulated={doc.is_simulated}
                    status={doc.status}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function DocumentsCards({ rows }: { rows: DocumentRow[] }) {
  return (
    <ul className="space-y-3 lg:hidden">
      {rows.map((doc) => {
        const ownerName = doc.profiles
          ? `${doc.profiles.first_name} ${doc.profiles.last_name}`.trim()
          : "—";
        return (
          <li key={doc.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {DOCUMENT_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {doc.original_name}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <DocumentStatusBadge status={doc.status} />
                {doc.is_simulated ? <SimulatedBadge /> : null}
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {ownerName} · {ownerTypeLabel(doc.owner_type)} · Déposé le{" "}
              {format(new Date(doc.created_at), "d MMM yyyy", { locale: fr })}
            </p>
            <div className="mt-3">
              <DocumentActions
                documentId={doc.id}
                isSimulated={doc.is_simulated}
                status={doc.status}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default async function AdminDocumentsPage() {
  const supabase = await createClient();

  const { data: documents } = await supabase
    .from("documents")
    .select(
      "id, document_type, original_name, owner_type, status, is_simulated, created_at, profiles!documents_owner_user_id_fkey(first_name, last_name)",
    )
    .order("created_at", { ascending: false })
    .limit(300);

  const rows: DocumentRow[] = documents ?? [];

  // À examiner en priorité : téléversés / en attente, non simulés.
  const toReview = rows.filter(
    (doc) =>
      (doc.status === "uploaded" || doc.status === "pending") &&
      !doc.is_simulated,
  );
  const others = rows.filter((doc) => !toReview.includes(doc));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
        <p className="text-sm text-muted-foreground">
          Vérifiez les documents déposés par les cabinets et les remplaçants.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun document"
          description="Les documents déposés par les utilisateurs apparaîtront ici."
        />
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">
              À examiner{toReview.length > 0 ? ` (${toReview.length})` : ""}
            </h2>
            {toReview.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Aucun document à examiner"
                description="Tous les documents déposés ont été traités."
              />
            ) : (
              <>
                <DocumentsTable rows={toReview} />
                <DocumentsCards rows={toReview} />
              </>
            )}
          </section>

          {others.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">
                Autres documents
              </h2>
              <DocumentsTable rows={others} />
              <DocumentsCards rows={others} />
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
