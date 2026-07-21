"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DENTAL_SOFTWARE_SUGGESTIONS,
  ENVIRONMENT_TYPES,
  LANGUAGES_SUGGESTIONS,
} from "@/lib/data/reference";
import {
  cabinetStep3Schema,
  type CabinetStep3Input,
} from "@/lib/validation/onboarding-cabinet";
import { saveCabinetStep3 } from "@/app/actions/onboarding-cabinet";
import type { Tables } from "@/types/database";

// Les champs numériques (z.coerce) rendent z.input différent de z.output :
// on aligne le resolver sur les valeurs du formulaire.
const step3Resolver = zodResolver(
  cabinetStep3Schema,
) as unknown as Resolver<CabinetStep3Input>;

/** Édition de la présentation du cabinet (réutilise l'étape 3 de l'onboarding). */
export function ProfilePresentationForm({
  cabinet,
}: {
  cabinet: Tables<"cabinet_profiles">;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CabinetStep3Input>({
    resolver: step3Resolver,
    defaultValues: {
      description: cabinet.description ?? "",
      practitionersCount: cabinet.practitioners_count ?? 1,
      assistantsCount: cabinet.assistants_count ?? 0,
      treatmentRoomsCount: cabinet.treatment_rooms_count ?? 1,
      accessibility: cabinet.accessibility ?? false,
      parking: cabinet.parking ?? false,
      publicTransport: cabinet.public_transport ?? "",
      software: cabinet.software ?? "",
      languages: cabinet.languages?.length ? cabinet.languages : ["Français"],
      environmentType: cabinet.environment_type ?? "",
    },
  });

  const onSubmit = (values: CabinetStep3Input) => {
    startTransition(async () => {
      const result = await saveCabinetStep3(values);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Présentation enregistrée.");
        router.refresh();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Présentation</CardTitle>
        <CardDescription>
          Décrivez votre cabinet et son environnement de travail.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description du cabinet</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Équipe, patientèle, ambiance de travail, points forts…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-5 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="practitionersCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Praticiens</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} inputMode="numeric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assistantsCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assistant(e)s</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} inputMode="numeric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="treatmentRoomsCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salles de soins</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} inputMode="numeric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="accessibility"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-3 rounded-xl border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Accessibilité PMR</FormLabel>
                      <FormDescription>
                        Accès aux personnes à mobilité réduite.
                      </FormDescription>
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
              <FormField
                control={form.control}
                name="parking"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-3 rounded-xl border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Parking</FormLabel>
                      <FormDescription>
                        Stationnement à proximité du cabinet.
                      </FormDescription>
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
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="publicTransport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transports en commun (facultatif)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex. : bus ligne 12, tram T3…"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="software"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logiciel métier (facultatif)</FormLabel>
                    <FormControl>
                      <Input list="profil-software-suggestions" {...field} />
                    </FormControl>
                    <datalist id="profil-software-suggestions">
                      {DENTAL_SOFTWARE_SUGGESTIONS.map((software) => (
                        <option key={software} value={software} />
                      ))}
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Langues parlées au cabinet</FormLabel>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {LANGUAGES_SUGGESTIONS.map((language) => {
                      const checked = field.value?.includes(language) ?? false;
                      return (
                        <label
                          key={language}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) =>
                              field.onChange(
                                value === true
                                  ? [...(field.value ?? []), language]
                                  : (field.value ?? []).filter(
                                      (l) => l !== language,
                                    ),
                              )
                            }
                          />
                          {language}
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="environmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Environnement</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid gap-2 sm:grid-cols-3"
                    >
                      {ENVIRONMENT_TYPES.map((option) => (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                        >
                          <RadioGroupItem value={option.value} />
                          {option.label}
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                <Save aria-hidden />
                {isPending ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
