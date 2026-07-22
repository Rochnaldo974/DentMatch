"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CONTRACT_TYPES,
  REGIONS,
  REPLACEMENT_TYPES,
  REUNION_COMMUNES,
  SPECIALTIES,
  STRUCTURE_TYPES,
  TERRITORIES,
} from "@/lib/data/reference";
import { LAUNCH_MARKET } from "@/lib/constants";

// Marché de lancement Réunion : filtre « Commune » à la place des filtres
// nationaux « Région » / « Département » (code conservé pour la suite).
const IS_REUNION_MARKET = LAUNCH_MARKET === "reunion";

export type JobPostFilterValues = {
  q?: string;
  territoire?: string;
  region?: string;
  departement?: string;
  ville?: string;
  debut?: string;
  fin?: string;
  specialite?: string;
  type_structure?: string;
  contrat?: string;
  type?: string;
  temps?: string;
  hebergement?: string;
  urgent?: string;
  tri?: string;
};

const selectClass =
  "h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

function NativeSelect({
  id,
  name,
  defaultValue,
  placeholder,
  options,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue ?? ""}
      className={selectClass}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/**
 * Formulaire de filtres de recherche d'annonces (GET, server-first).
 * Utilisé en sidebar desktop et dans le Sheet mobile.
 */
export function JobPostFiltersForm({
  values,
  idPrefix = "f",
}: {
  values: JobPostFilterValues;
  idPrefix?: string;
}) {
  return (
    <form method="GET" action="/remplacant/annonces" className="space-y-4">
      {/* Conserve la recherche texte et le tri courants. */}
      {values.q ? <input type="hidden" name="q" value={values.q} /> : null}
      {values.tri ? <input type="hidden" name="tri" value={values.tri} /> : null}

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-territoire`}>Territoire</Label>
        <NativeSelect
          id={`${idPrefix}-territoire`}
          name="territoire"
          defaultValue={values.territoire}
          placeholder="Tous les territoires"
          options={TERRITORIES.map((t) => ({ value: t, label: t }))}
        />
      </div>

      {IS_REUNION_MARKET ? (
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-ville`}>Commune</Label>
          <NativeSelect
            id={`${idPrefix}-ville`}
            name="ville"
            defaultValue={values.ville}
            placeholder="Toutes les communes"
            options={REUNION_COMMUNES.map((c) => ({ value: c, label: c }))}
          />
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-region`}>Région</Label>
            <NativeSelect
              id={`${idPrefix}-region`}
              name="region"
              defaultValue={values.region}
              placeholder="Toutes les régions"
              options={REGIONS.map((r) => ({ value: r, label: r }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-departement`}>Département</Label>
            <Input
              id={`${idPrefix}-departement`}
              name="departement"
              defaultValue={values.departement}
              placeholder="Ex. : 974, Rhône…"
            />
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-debut`}>Début</Label>
          <Input
            id={`${idPrefix}-debut`}
            type="date"
            name="debut"
            defaultValue={values.debut}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-fin`}>Fin</Label>
          <Input
            id={`${idPrefix}-fin`}
            type="date"
            name="fin"
            defaultValue={values.fin}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-specialite`}>Spécialité</Label>
        <NativeSelect
          id={`${idPrefix}-specialite`}
          name="specialite"
          defaultValue={values.specialite}
          placeholder="Toutes les spécialités"
          options={SPECIALTIES}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-type_structure`}>Type de structure</Label>
        <NativeSelect
          id={`${idPrefix}-type_structure`}
          name="type_structure"
          defaultValue={values.type_structure}
          placeholder="Toutes les structures"
          options={STRUCTURE_TYPES}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-contrat`}>Type de contrat</Label>
        <NativeSelect
          id={`${idPrefix}-contrat`}
          name="contrat"
          defaultValue={values.contrat}
          placeholder="Tous les contrats"
          options={CONTRACT_TYPES}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-type`}>Type de remplacement</Label>
        <NativeSelect
          id={`${idPrefix}-type`}
          name="type"
          defaultValue={values.type}
          placeholder="Tous les types"
          options={REPLACEMENT_TYPES}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-temps`}>Temps de travail</Label>
        <NativeSelect
          id={`${idPrefix}-temps`}
          name="temps"
          defaultValue={values.temps}
          placeholder="Plein ou partiel"
          options={[
            { value: "plein", label: "Temps plein" },
            { value: "partiel", label: "Temps partiel" },
          ]}
        />
      </div>

      <div className="space-y-2.5 pt-1">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="hebergement"
            value="1"
            defaultChecked={values.hebergement === "1"}
            className="size-4 rounded border-input accent-primary"
          />
          Hébergement proposé
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="urgent"
            value="1"
            defaultChecked={values.urgent === "1"}
            className="size-4 rounded border-input accent-primary"
          />
          Annonces urgentes uniquement
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" className="flex-1">
          Filtrer
        </Button>
        <Link
          href="/remplacant/annonces"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Réinitialiser
        </Link>
      </div>
    </form>
  );
}

/** Bouton « Filtres » mobile ouvrant le même formulaire dans un Sheet. */
export function MobileJobPostFilters({
  values,
}: {
  values: JobPostFilterValues;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filtres
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtres de recherche</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <JobPostFiltersForm values={values} idPrefix="fm" />
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Tri des résultats — met à jour le paramètre « tri » de l'URL. */
export function JobPostSortSelect({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "recent") params.delete("tri");
    else params.set("tri", next);
    params.delete("page");
    router.push(`/remplacant/annonces?${params.toString()}`);
  }

  return (
    <Select value={value || "recent"} onValueChange={handleChange}>
      <SelectTrigger size="sm" className="w-[190px]" aria-label="Trier les annonces">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="recent">Plus récent</SelectItem>
        <SelectItem value="debut">Date la plus proche</SelectItem>
        <SelectItem value="remuneration">Rémunération</SelectItem>
      </SelectContent>
    </Select>
  );
}
