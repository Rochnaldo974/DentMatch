import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { DocumentManager } from "@/components/documents/document-manager";
import {
  PROFESSIONAL_STATUS_LABELS,
  documentTypesForStatus,
  type ProfessionalStatus,
} from "@/lib/data/reference";

export const metadata = { title: "Mes documents" };

export default async function ReplacementDocumentsPage() {
  const profile = await requireRole("replacement_dentist");
  const supabase = await createClient();

  const [rpRes, docsRes] = await Promise.all([
    supabase
      .from("replacement_profiles")
      .select("professional_status")
      .eq("user_id", profile.id)
      .maybeSingle(),
    supabase
      .from("documents")
      .select("*")
      .eq("owner_user_id", profile.id)
      .eq("owner_type", "replacement_dentist")
      .order("created_at", { ascending: false }),
  ]);

  if (docsRes.error) {
    return <ErrorState />;
  }

  const status: ProfessionalStatus =
    rpRes.data?.professional_status ?? "qualified_dentist";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Documents"
        title="Mes documents"
        description={`Pièces requises pour votre statut : ${PROFESSIONAL_STATUS_LABELS[status].toLowerCase()}.`}
      />

      <DocumentManager
        definitions={documentTypesForStatus(status)}
        documents={docsRes.data ?? []}
        ownerType="replacement_dentist"
      />
    </div>
  );
}
