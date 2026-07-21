"use client";

import { useState } from "react";
import { OnboardingStepper } from "@/components/onboarding/stepper";
import type { CabinetOnboardingData } from "@/components/onboarding/types";
import { StepIdentity } from "./cabinet/step-identity";
import { StepCabinetInfo } from "./cabinet/step-cabinet-info";
import { StepPresentation } from "./cabinet/step-presentation";
import { StepActivities } from "./cabinet/step-activities";
import { StepPhotos } from "./cabinet/step-photos";
import { StepDocuments } from "./cabinet/step-documents";
import { StepPreferences } from "./cabinet/step-preferences";
import { StepConfirmation } from "./cabinet/step-confirmation";

const STEPS = [
  "Identité",
  "Cabinet",
  "Présentation",
  "Activités",
  "Photos",
  "Documents",
  "Préférences",
  "Confirmation",
] as const;

/**
 * Parcours d'onboarding cabinet : orchestre les 8 étapes.
 * Chaque étape enregistre ses données via sa Server Action puis rafraîchit
 * les données serveur (`router.refresh()`) avant d'appeler `onDone`.
 * L'étape initiale reprend là où l'utilisateur s'était arrêté
 * (`profile.onboarding_step`), plafonnée à l'écran de confirmation.
 */
export function CabinetOnboarding({ data }: { data: CabinetOnboardingData }) {
  const [step, setStep] = useState(() =>
    Math.min(data.profile.onboarding_step, STEPS.length - 1),
  );

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="space-y-6">
      <OnboardingStepper steps={[...STEPS]} current={step} />
      {step === 0 ? <StepIdentity data={data} onDone={goNext} /> : null}
      {step === 1 ? (
        <StepCabinetInfo data={data} onBack={goBack} onDone={goNext} />
      ) : null}
      {step === 2 ? (
        <StepPresentation data={data} onBack={goBack} onDone={goNext} />
      ) : null}
      {step === 3 ? (
        <StepActivities data={data} onBack={goBack} onDone={goNext} />
      ) : null}
      {step === 4 ? (
        <StepPhotos data={data} onBack={goBack} onDone={goNext} />
      ) : null}
      {step === 5 ? (
        <StepDocuments data={data} onBack={goBack} onDone={goNext} />
      ) : null}
      {step === 6 ? (
        <StepPreferences data={data} onBack={goBack} onDone={goNext} />
      ) : null}
      {step === 7 ? <StepConfirmation data={data} onBack={goBack} /> : null}
    </div>
  );
}
