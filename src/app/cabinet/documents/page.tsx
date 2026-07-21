import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DocumentManager } from "@/components/documents/document-manager";
import { CABINET_DOCUMENT_TYPES } from "@/lib/data/reference";

export const metadata = { title: "Documents" };

export default async function CabinetDocumentsPage() {
  const profile = await requireRole("cabinet");
  const supabase = await createClient();

  const { data: docs } = await supabase
    .from("documents")
    .select("*")
    .eq("owner_user_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
        <p className="text-sm text-muted-foreground">
          Téléversez les justificatifs de votre structure. Les documents
          obligatoires sont signalés par un astérisque.
        </p>
      </div>

      <DocumentManager
        definitions={CABINET_DOCUMENT_TYPES}
        documents={docs ?? []}
        ownerType="cabinet"
      />
    </div>
  );
}
