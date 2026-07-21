"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

/** Barre de progression + intitulé de l'étape courante. */
export function OnboardingStepper({
  steps,
  current,
}: {
  steps: string[];
  current: number; // index 0-based
}) {
  const percent = Math.round(((current + 1) / steps.length) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium">
          Étape {current + 1} sur {steps.length} —{" "}
          <span className="text-muted-foreground">{steps[current]}</span>
        </p>
        <p className="text-sm font-semibold tabular-nums text-muted-foreground">
          {percent}%
        </p>
      </div>
      <Progress value={percent} aria-label={`Progression : ${percent}%`} />
      {/* Points d'étape (desktop) */}
      <ol className="hidden items-center gap-1.5 md:flex" aria-hidden="true">
        {steps.map((step, i) => (
          <li key={step} className="flex flex-1 items-center gap-1.5">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
                i < current
                  ? "border-verified bg-verified text-verified-foreground"
                  : i === current
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
              )}
            >
              {i < current ? <Check className="size-3.5" /> : i + 1}
            </span>
            {i < steps.length - 1 ? (
              <span
                className={cn(
                  "h-px flex-1",
                  i < current ? "bg-verified" : "bg-border",
                )}
              />
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
