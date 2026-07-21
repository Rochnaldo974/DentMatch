"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Pied de page commun des étapes d'onboarding : bouton « Retour » (ghost)
 * et bouton principal. Si `onNext` est fourni, le bouton principal est un
 * simple bouton d'action ; sinon c'est le submit du formulaire englobant.
 */
export function StepActions({
  onBack,
  pending,
  submitLabel = "Enregistrer et continuer",
  onNext,
}: {
  onBack?: () => void;
  pending: boolean;
  submitLabel?: string;
  onNext?: () => void;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
      {onBack ? (
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={onBack}
        >
          Retour
        </Button>
      ) : (
        <span aria-hidden="true" />
      )}
      <Button
        type={onNext ? "button" : "submit"}
        disabled={pending}
        onClick={onNext}
        className="sm:min-w-52"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        {submitLabel}
      </Button>
    </div>
  );
}
