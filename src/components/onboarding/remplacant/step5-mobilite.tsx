"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { saveReplacementStep5 } from "@/app/actions/onboarding-remplacant";
import {
  replacementStep5Schema,
  type ReplacementStep5Input,
} from "@/lib/validation/onboarding-remplacant";
import {
  REGIONS,
  OVERSEAS_TERRITORIES,
  type Option,
} from "@/lib/data/reference";
import type { ReplacementOnboardingData } from "@/components/onboarding/types";
import { CheckboxGrid, StepFooter, StepHeader, toOptions } from "./step-shell";

const TRAVEL_DURATIONS: Option[] = [
  { value: "1_semaine", label: "1 semaine" },
  { value: "2_semaines", label: "2 semaines" },
  { value: "1_mois", label: "1 mois" },
  { value: "3_mois", label: "3 mois" },
  { value: "plus_3_mois", label: "Plus de 3 mois" },
];

const SWITCHES: {
  name:
    | "nationalMobility"
    | "hasVehicle"
    | "hasDrivingLicense"
    | "needsAccommodation"
    | "acceptsTravelWithAccommodation";
  label: string;
  description: string;
}[] = [
  {
    name: "nationalMobility",
    label: "Mobilité nationale",
    description: "Vous acceptez des remplacements partout en France.",
  },
  {
    name: "hasVehicle",
    label: "Véhicule personnel",
    description: "Vous disposez d’un véhicule pour vous déplacer.",
  },
  {
    name: "hasDrivingLicense",
    label: "Permis de conduire",
    description: "Vous êtes titulaire du permis B.",
  },
  {
    name: "needsAccommodation",
    label: "Besoin d’un logement",
    description: "Un logement sur place faciliterait vos remplacements.",
  },
  {
    name: "acceptsTravelWithAccommodation",
    label: "Déplacements avec hébergement",
    description:
      "Vous acceptez les remplacements éloignés si un hébergement est proposé.",
  },
];

type FormValues = {
  regions: string[];
  departments: string[];
  overseasTerritories: string[];
  mobilityRadiusKm: number | string;
  nationalMobility: boolean;
  hasVehicle: boolean;
  hasDrivingLicense: boolean;
  needsAccommodation: boolean;
  acceptsTravelWithAccommodation: boolean;
  maxTravelDuration: string;
};

export function StepMobilite({
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
  const [departmentInput, setDepartmentInput] = useState("");
  const rp = data.replacement;

  const areaValues = (type: string) =>
    data.mobilityAreas
      .filter((a) => a.area_type === type)
      .map((a) => a.area_value);

  // Les coercitions du schéma rendent z.input différent de z.output :
  // on aligne le resolver sur les valeurs du formulaire (pattern du projet).
  const form = useForm<FormValues>({
    resolver: zodResolver(
      replacementStep5Schema,
    ) as unknown as Resolver<FormValues>,
    defaultValues: {
      regions: areaValues("region"),
      departments: areaValues("department"),
      overseasTerritories: areaValues("territory"),
      mobilityRadiusKm: rp?.mobility_radius_km ?? 50,
      nationalMobility: rp?.national_mobility ?? false,
      hasVehicle: rp?.has_vehicle ?? false,
      hasDrivingLicense: rp?.has_driving_license ?? false,
      needsAccommodation: rp?.needs_accommodation ?? false,
      acceptsTravelWithAccommodation:
        rp?.accepts_travel_with_accommodation ?? false,
      maxTravelDuration: rp?.max_travel_duration ?? "",
    },
  });

  function addDepartment(current: string[], onChange: (v: string[]) => void) {
    const value = departmentInput.trim();
    if (!value) return;
    if (!current.includes(value)) onChange([...current, value]);
    setDepartmentInput("");
  }

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await saveReplacementStep5(
        values as unknown as ReplacementStep5Input,
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
      onNext();
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        <StepHeader
          title="Mobilité"
          description="Précisez les zones où vous acceptez des remplacements."
        />

        <FormField
          control={form.control}
          name="regions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Régions recherchées</FormLabel>
              <FormControl>
                <CheckboxGrid
                  options={toOptions(REGIONS)}
                  value={field.value}
                  onChange={field.onChange}
                  className="sm:grid-cols-2 lg:grid-cols-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="departments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Départements recherchés</FormLabel>
              <FormControl>
                <div className="space-y-2.5">
                  <div className="flex gap-2">
                    <Input
                      value={departmentInput}
                      onChange={(e) => setDepartmentInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addDepartment(field.value, field.onChange);
                        }
                      }}
                      placeholder="Ex. : 974 ou La Réunion"
                      aria-label="Ajouter un département"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => addDepartment(field.value, field.onChange)}
                    >
                      <Plus className="size-4" aria-hidden="true" />
                      Ajouter
                    </Button>
                  </div>
                  {field.value.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {field.value.map((dep) => (
                        <Badge key={dep} variant="secondary" className="gap-1">
                          {dep}
                          <button
                            type="button"
                            aria-label={`Retirer ${dep}`}
                            className="rounded-full transition-colors hover:text-destructive"
                            onClick={() =>
                              field.onChange(
                                field.value.filter((d) => d !== dep),
                              )
                            }
                          >
                            <X className="size-3" aria-hidden="true" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="overseasTerritories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Territoires d’outre-mer acceptés</FormLabel>
              <FormControl>
                <CheckboxGrid
                  options={toOptions(OVERSEAS_TERRITORIES)}
                  value={field.value}
                  onChange={field.onChange}
                  className="sm:grid-cols-2 lg:grid-cols-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="mobilityRadiusKm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rayon maximal (km)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={2000}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  Autour de votre lieu de résidence.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxTravelDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée maximale de déplacement</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisissez une durée" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TRAVEL_DURATIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          {SWITCHES.map((s) => (
            <FormField
              key={s.name}
              control={form.control}
              name={s.name}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-card px-4 py-3">
                  <div className="space-y-0.5 pr-4">
                    <FormLabel>{s.label}</FormLabel>
                    <FormDescription>{s.description}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
        </div>

        <StepFooter onBack={onBack} pending={isPending} />
      </form>
    </Form>
  );
}
