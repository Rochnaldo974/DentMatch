"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { saveReplacementStep4 } from "@/app/actions/onboarding-remplacant";
import {
  replacementStep4Schema,
  type ReplacementStep4Input,
} from "@/lib/validation/onboarding-remplacant";
import {
  SPECIALTIES,
  SPECIALIZED_SPECIALTY_CODES,
  DENTAL_SOFTWARE_SUGGESTIONS,
  LANGUAGES_SUGGESTIONS,
  RESIDENT_SPECIALTIES,
  type ProfessionalStatus,
} from "@/lib/data/reference";
import type { ReplacementOnboardingData } from "@/components/onboarding/types";
import { CheckboxGrid, StepFooter, StepHeader, toOptions } from "./step-shell";

type FormValues = {
  specialties: string[];
  experienceYears: number | string;
  masteredProcedures: string;
  excludedProcedures: string;
  softwareUsed: string[];
  languages: string[];
};

export function StepCompetences({
  data,
  status,
  onBack,
  onNext,
}: {
  data: ReplacementOnboardingData;
  status: ProfessionalStatus;
  onBack: () => void;
  onNext: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const rp = data.replacement;
  const residentSpecialty = rp?.resident_specialty ?? null;

  const specializedCodes = SPECIALIZED_SPECIALTY_CODES as readonly string[];

  const isSpecialtyDisabled = (code: string) => {
    if (!specializedCodes.includes(code)) return false;
    if (status === "student") return true;
    if (status === "resident") return code !== residentSpecialty;
    return false;
  };

  // Les coercitions du schéma rendent z.input différent de z.output :
  // on aligne le resolver sur les valeurs du formulaire (pattern du projet).
  const form = useForm<FormValues>({
    resolver: zodResolver(
      replacementStep4Schema,
    ) as unknown as Resolver<FormValues>,
    defaultValues: {
      specialties: data.specialtyCodes.filter((c) => !isSpecialtyDisabled(c)),
      experienceYears: rp?.experience_years ?? "",
      masteredProcedures: rp?.mastered_procedures ?? "",
      excludedProcedures: rp?.excluded_procedures ?? "",
      softwareUsed: rp?.software_used ?? [],
      languages: rp?.languages?.length ? rp.languages : ["Français"],
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await saveReplacementStep4(
        values as unknown as ReplacementStep4Input,
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
      onNext();
    });
  }

  const specializedLabels = SPECIALTIES.filter((s) =>
    specializedCodes.includes(s.value),
  )
    .map((s) => s.label.toLowerCase())
    .join(", ");

  const residentSpecialtyLabel =
    RESIDENT_SPECIALTIES.find((s) => s.value === residentSpecialty)?.label ??
    "votre spécialité d’internat";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        <StepHeader
          title="Compétences"
          description="Indiquez les actes que vous pratiquez pour recevoir des annonces adaptées."
        />

        {status === "student" ? (
          <Alert>
            <Info aria-hidden="true" />
            <AlertDescription>
              Un étudiant autorisé à remplacer ne peut pas remplacer un
              spécialiste : les compétences spécialisées ({specializedLabels})
              sont désactivées.
            </AlertDescription>
          </Alert>
        ) : null}
        {status === "resident" ? (
          <Alert>
            <Info aria-hidden="true" />
            <AlertDescription>
              En tant qu’interne, seule la compétence correspondant à votre
              spécialité d’internat ({residentSpecialtyLabel}) est activée
              parmi les spécialités ({specializedLabels}).
            </AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="specialties"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spécialités et domaines maîtrisés</FormLabel>
              <FormControl>
                <CheckboxGrid
                  options={SPECIALTIES}
                  value={field.value}
                  onChange={field.onChange}
                  className="sm:grid-cols-2 lg:grid-cols-3"
                  isDisabled={(opt) => isSpecialtyDisabled(opt.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experienceYears"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Années d’expérience</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={60}
                  className="max-w-32"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="masteredProcedures"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Actes maîtrisés (facultatif)</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Ex. : soins conservateurs, extractions simples, prothèse fixée…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excludedProcedures"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Actes non pratiqués (facultatif)</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Ex. : chirurgie implantaire, orthodontie…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="softwareUsed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logiciels utilisés</FormLabel>
              <FormControl>
                <CheckboxGrid
                  options={toOptions(DENTAL_SOFTWARE_SUGGESTIONS)}
                  value={field.value}
                  onChange={field.onChange}
                  className="sm:grid-cols-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="languages"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Langues parlées</FormLabel>
              <FormControl>
                <CheckboxGrid
                  options={toOptions(LANGUAGES_SUGGESTIONS)}
                  value={field.value}
                  onChange={field.onChange}
                  className="sm:grid-cols-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <StepFooter onBack={onBack} pending={isPending} />
      </form>
    </Form>
  );
}
