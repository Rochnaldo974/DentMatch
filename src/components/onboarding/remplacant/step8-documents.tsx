"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DocumentManager } from "@/components/documents/document-manager";
import { completeReplacementStep8 } from "@/app/actions/onboarding-remplacant";
import { documentTypesForStatus } from "@/lib/data/reference";
import { requiredDocumentsComplete } from "@/lib/business-rules";
import type { ReplacementOnboardingData } from "@/components/onboarding/types";
import { StepFooter, StepHeader } from "./step-shell";

export function StepDocuments({
  data,
  onBack,
  onNext,
}: {
  data: ReplacementOnboardingData;
  onBack: () => void;
  onNext: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const status = data.replacement?.professional_status ?? "qualified_dentist";
  const definitions = documentTypesForStatus(status);
  const docsComplete = requiredDocumentsComplete(definitions, data.documents);

  function handleContinue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const result = await completeReplacementStep8();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
      onNext();
    });
  }

  return (
    <div className="space-y-6">
      <StepHeader
        title="Documents"
        description="Les documents demandés dépendent de votre statut. Ils restent confidentiels et servent uniquement à la vérification."
      />

      {!docsComplete ? (
        <Alert>
          <Info aria-hidden="true" />
          <AlertDescription>
            Vous pouvez continuer sans avoir fourni tous les documents
            obligatoires, mais le badge « Profil test vérifié » ne sera pas
            attribué tant qu’ils seront manquants.
          </AlertDescription>
        </Alert>
      ) : null}

      <DocumentManager
        definitions={definitions}
        documents={data.documents}
        ownerType="replacement_dentist"
      />

      <form onSubmit={handleContinue} noValidate>
        <StepFooter
          onBack={onBack}
          pending={isPending}
          submitLabel="Continuer"
        />
      </form>
    </div>
  );
}
