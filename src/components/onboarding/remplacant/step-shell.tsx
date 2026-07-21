"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Option } from "@/lib/data/reference";

/** En-tête d'étape : titre + description. */
export function StepHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

/** Pied d'étape : bouton Retour + bouton de validation (submit). */
export function StepFooter({
  onBack,
  pending,
  submitLabel = "Enregistrer et continuer",
}: {
  onBack?: () => void;
  pending?: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
      {onBack ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={pending}
        >
          Retour
        </Button>
      ) : (
        <span aria-hidden="true" />
      )}
      <Button type="submit" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        {submitLabel}
      </Button>
    </div>
  );
}

/** Convertit une liste de chaînes en options (value = label). */
export function toOptions(values: readonly string[]): Option[] {
  return values.map((v) => ({ value: v, label: v }));
}

/**
 * Grille de cases à cocher accessible (le libellé englobe la case).
 */
export function CheckboxGrid({
  options,
  value,
  onChange,
  className,
  isDisabled,
}: {
  options: Option[];
  value: string[];
  onChange: (next: string[]) => void;
  className?: string;
  isDisabled?: (option: Option) => boolean;
}) {
  const toggle = (v: string, checked: boolean) =>
    onChange(checked ? [...value, v] : value.filter((x) => x !== v));

  return (
    <div className={cn("grid gap-2 sm:grid-cols-2", className)}>
      {options.map((opt) => {
        const disabled = isDisabled?.(opt) ?? false;
        const checked = value.includes(opt.value);
        return (
          <label
            key={opt.value}
            className={cn(
              "flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-sm transition-colors duration-150",
              disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:border-muted-foreground/40",
              checked && !disabled ? "border-primary/60" : null,
            )}
          >
            <Checkbox
              checked={checked}
              disabled={disabled}
              onCheckedChange={(c) => toggle(opt.value, c === true)}
            />
            <span className="leading-snug">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
