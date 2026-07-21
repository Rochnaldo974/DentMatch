"use client";

import { useTransition } from "react";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DocumentStatusBadge } from "@/components/shared/status-badge";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { ProfileCompletion } from "@/components/shared/profile-completion";
import { finishCabinetOnboarding } from "@/app/actions/onboarding-cabinet";
import { CABINET_DOCUMENT_TYPES } from "@/lib/data/reference";
import {
  computeProfileCompletion,
  requiredDocumentsComplete,
} from "@/lib/business-rules";
import type { CabinetOnboardingData } from "@/components/onboarding/types";
import { StepActions } from "./step-actions";

/** Écran final — récapitulatif et accès à l'espace cabinet. */
export function StepConfirmation({
  data,
  onBack,
}: {
  data: CabinetOnboardingData;
  onBack: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const cabinet = data.cabinet;

  // Score indicatif, aligné sur le calcul serveur de finishCabinetOnboarding.
  const completion = cabinet
    ? computeProfileCompletion([
        cabinet.name,
        cabinet.structure_type,
        cabinet.siret,
        cabinet.description,
        cabinet.address_line_1,
        cabinet.postal_code,
        cabinet.city,
        cabinet.territory,
        cabinet.phone,
        cabinet.email,
        cabinet.practitioners_count,
        cabinet.treatment_rooms_count,
        cabinet.software,
        cabinet.languages,
        cabinet.environment_type,
      ])
    : 0;

  const requiredDocs = CABINET_DOCUMENT_TYPES.filter((def) => def.required);
  const docsComplete = requiredDocumentsComplete(
    CABINET_DOCUMENT_TYPES,
    data.documents,
  );
  const missingDocs = requiredDocs.filter(
    (def) =>
      !data.documents.some(
        (doc) =>
          doc.document_type === def.type &&
          ["uploaded", "pending", "verified"].includes(doc.status),
      ),
  );

  const handleFinish = () => {
    startTransition(async () => {
      const result = await finishCabinetOnboarding();
      if (result.error) {
        toast.error(result.error);
      } else {
        window.location.assign("/cabinet/dashboard");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirmation</CardTitle>
        <CardDescription>
          Vérifiez votre récapitulatif avant d&apos;accéder à votre espace. Vous
          pourrez compléter votre profil à tout moment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
              Tous vos documents obligatoires sont fournis. Votre profil de
              test sera marqué comme vérifié dès la finalisation.
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

        <StepActions
          onBack={onBack}
          pending={isPending}
          submitLabel="Accéder à mon espace"
          onNext={handleFinish}
        />
      </CardContent>
    </Card>
  );
}
