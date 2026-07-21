"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DocumentManager } from "@/components/documents/document-manager";
import { completeCabinetStep } from "@/app/actions/onboarding-cabinet";
import { CABINET_DOCUMENT_TYPES } from "@/lib/data/reference";
import { requiredDocumentsComplete } from "@/lib/business-rules";
import type { CabinetOnboardingData } from "@/components/onboarding/types";
import { StepActions } from "./step-actions";

/** Étape 6 — Documents justificatifs du cabinet. */
export function StepDocuments({
  data,
  onBack,
  onDone,
}: {
  data: CabinetOnboardingData;
  onBack: () => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const docsComplete = requiredDocumentsComplete(
    CABINET_DOCUMENT_TYPES,
    data.documents,
  );

  const handleContinue = () => {
    startTransition(async () => {
      const result = await completeCabinetStep(6);
      if (result.error) {
        toast.error(result.error);
      } else {
        router.refresh();
        onDone();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>
          Téléversez les pièces justificatives de votre cabinet. Les documents
          marqués d&apos;un astérisque sont obligatoires pour obtenir le badge
          « Profil test vérifié ».
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!docsComplete ? (
          <Alert>
            <Info aria-hidden="true" />
            <AlertTitle>Des documents obligatoires manquent</AlertTitle>
            <AlertDescription>
              Vous pouvez continuer sans les fournir, mais le badge « Profil
              test vérifié » ne sera pas attribué tant que tous les documents
              obligatoires ne sont pas téléversés ou simulés.
            </AlertDescription>
          </Alert>
        ) : null}
        <DocumentManager
          definitions={CABINET_DOCUMENT_TYPES}
          documents={data.documents}
          ownerType="cabinet"
        />
        <StepActions
          onBack={onBack}
          pending={isPending}
          submitLabel="Continuer"
          onNext={handleContinue}
        />
      </CardContent>
    </Card>
  );
}
