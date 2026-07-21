"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DocumentStatusBadge } from "@/components/shared/status-badge";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { ProfileCompletion } from "@/components/shared/profile-completion";
import { finishReplacementOnboarding } from "@/app/actions/onboarding-remplacant";
import { documentTypesForStatus } from "@/lib/data/reference";
import {
  computeProfileCompletion,
  requiredDocumentsComplete,
} from "@/lib/business-rules";
import type { ReplacementOnboardingData } from "@/components/onboarding/types";
import { StepFooter, StepHeader } from "./step-shell";

/** Écran final — récapitulatif et accès aux annonces. */
export function StepConfirmation({
  data,
  onBack,
}: {
  data: ReplacementOnboardingData;
  onBack: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const rp = data.replacement;

  // Score indicatif, aligné sur le calcul serveur de finishReplacementOnboarding.
  const completion =
    rp?.profile_completion ||
    (rp
      ? computeProfileCompletion([
          rp.professional_status,
          rp.birth_date,
          rp.city,
          rp.territory,
          rp.bio,
          rp.university,
          rp.experience_years,
          rp.languages,
          rp.mobility_radius_km,
          rp.replacement_preferences,
          rp.professional_status === "qualified_dentist"
            ? rp.rpps_number
            : "ok",
          rp.professional_status === "student" ? rp.student_year : "ok",
          rp.professional_status === "resident" ? rp.resident_specialty : "ok",
        ])
      : 0);

  const status = rp?.professional_status ?? "qualified_dentist";
  const definitions = documentTypesForStatus(status);
  const requiredDocs = definitions.filter((def) => def.required);
  const docsComplete = requiredDocumentsComplete(definitions, data.documents);
  const missingDocs = requiredDocs.filter(
    (def) =>
      !data.documents.some(
        (doc) =>
          doc.document_type === def.type &&
          ["uploaded", "pending", "verified"].includes(doc.status),
      ),
  );

  function handleFinish(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const result = await finishReplacementOnboarding();
      if (result.error) {
        toast.error(result.error);
      } else {
        window.location.assign("/remplacant/annonces");
      }
    });
  }

  return (
    <form onSubmit={handleFinish} className="space-y-6" noValidate>
      <StepHeader
        title="Confirmation"
        description="Vérifiez votre récapitulatif avant d’accéder aux annonces. Vous pourrez compléter votre profil à tout moment."
      />

      <ProfileCompletion
        value={completion}
        label="Complétion estimée du profil"
      />

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Documents obligatoires</h3>
        <ul className="space-y-2">
          {requiredDocs.map((def) => {
            const doc = data.documents.find(
              (d) => d.document_type === def.type,
            );
            return (
              <li
                key={def.type}
                className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3 text-sm"
              >
                <span className="min-w-0">{def.label}</span>
                <DocumentStatusBadge status={doc?.status ?? "missing"} />
              </li>
            );
          })}
        </ul>
      </div>

      {docsComplete ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-verified/25 bg-verified-soft p-6 text-center">
          <VerificationBadge status="verified" />
          <p className="text-lg font-semibold">Profil test vérifié</p>
          <p className="text-sm text-muted-foreground">
            Tous vos documents obligatoires sont fournis. Votre profil de test
            sera marqué comme vérifié dès la finalisation.
          </p>
        </div>
      ) : (
        <Alert>
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>
            Le badge « Profil test vérifié » ne sera pas attribué
          </AlertTitle>
          <AlertDescription>
            <p>
              Vous pouvez terminer maintenant et fournir plus tard les
              documents manquants :
            </p>
            <ul className="list-disc pl-4">
              {missingDocs.map((def) => (
                <li key={def.type}>{def.label}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <StepFooter
        onBack={onBack}
        pending={isPending}
        submitLabel="Accéder aux annonces"
      />
    </form>
  );
}
