"use client";

import { useEffect, useState } from "react";
import type { ProfessionalStatus } from "@/lib/data/reference";
import type { ReplacementOnboardingData } from "@/components/onboarding/types";
import { OnboardingStepper } from "@/components/onboarding/stepper";
import { StepStatut } from "./remplacant/step1-statut";
import { StepIdentite } from "./remplacant/step2-identite";
import { StepParcours } from "./remplacant/step3-parcours";
import { StepCompetences } from "./remplacant/step4-competences";
import { StepMobilite } from "./remplacant/step5-mobilite";
import { StepDisponibilites } from "./remplacant/step6-disponibilites";
import { StepPreferences } from "./remplacant/step7-preferences";
import { StepDocuments } from "./remplacant/step8-documents";
import { StepProfilPublic } from "./remplacant/step9-profil-public";
import { StepConfirmation } from "./remplacant/step-confirmation";

const STEPS = [
  "Statut",
  "Identité",
  "Parcours",
  "Compétences",
  "Mobilité",
  "Disponibilités",
  "Préférences",
  "Documents",
  "Profil public",
  "Confirmation",
];

/** Parcours d'onboarding du remplaçant : 10 écrans orchestrés côté client. */
export function ReplacementOnboarding({
  data,
}: {
  data: ReplacementOnboardingData;
}) {
  const [step, setStep] = useState(() =>
    Math.min(Math.max(data.profile.onboarding_step, 0), 9),
  );
  // Statut choisi à l'étape 1 (avant que router.refresh() ne rafraîchisse data).
  const [savedStatus, setSavedStatus] = useState<ProfessionalStatus | null>(
    null,
  );
  const status: ProfessionalStatus =
    savedStatus ??
    data.replacement?.professional_status ??
    "qualified_dentist";

  // Remonte en haut de page à chaque changement d'étape.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  const goTo = (next: number) => setStep(Math.min(Math.max(next, 0), 9));
  const next = () => goTo(step + 1);
  const back = () => goTo(step - 1);

  return (
    <div className="space-y-8">
      <OnboardingStepper steps={STEPS} current={step} />

      {step === 0 ? (
        <StepStatut data={data} onNext={next} onStatusSaved={setSavedStatus} />
      ) : step === 1 ? (
        <StepIdentite data={data} onBack={back} onNext={next} />
      ) : step === 2 ? (
        <StepParcours data={data} status={status} onBack={back} onNext={next} />
      ) : step === 3 ? (
        <StepCompetences
          data={data}
          status={status}
          onBack={back}
          onNext={next}
        />
      ) : step === 4 ? (
        <StepMobilite data={data} onBack={back} onNext={next} />
      ) : step === 5 ? (
        <StepDisponibilites data={data} onBack={back} onNext={next} />
      ) : step === 6 ? (
        <StepPreferences data={data} onBack={back} onNext={next} />
      ) : step === 7 ? (
        <StepDocuments data={data} onBack={back} onNext={next} />
      ) : step === 8 ? (
        <StepProfilPublic data={data} onBack={back} onNext={next} />
      ) : (
        <StepConfirmation data={data} onBack={back} />
      )}
    </div>
  );
}
