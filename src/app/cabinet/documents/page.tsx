import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
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
      <PageHeader
        eyebrow="Documents"
        title="Documents"
        description="Téléversez les justificatifs de votre structure. Les documents obligatoires sont signalés par un astérisque."
      />

      <DocumentManager
        definitions={CABINET_DOCUMENT_TYPES}
        documents={docs ?? []}
        ownerType="cabinet"
      />
    </div>
  );
}
