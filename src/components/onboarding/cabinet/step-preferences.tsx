"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONTRACT_TYPES,
  REPLACEMENT_TYPES,
  type Option,
} from "@/lib/data/reference";
import { APP_NAME } from "@/lib/constants";
import {
  cabinetStep7Schema,
  type CabinetStep7Input,
} from "@/lib/validation/onboarding-cabinet";
import { saveCabinetStep7 } from "@/app/actions/onboarding-cabinet";
import type { CabinetOnboardingData } from "@/components/onboarding/types";
import { StepActions } from "./step-actions";

/** Types de remplacements recherchés : natures + cadres d'exercice. */
const REPLACEMENT_TYPE_OPTIONS: Option[] = [
  ...REPLACEMENT_TYPES,
  ...CONTRACT_TYPES,
];

const FREQUENCY_OPTIONS: Option[] = [
  { value: "ponctuelle", label: "Ponctuelle" },
  { value: "mensuelle", label: "Mensuelle" },
  { value: "hebdomadaire", label: "Hebdomadaire" },
  { value: "continue", label: "Continue" },
];

/**
 * Valeurs du formulaire : identiques au schéma, mais la case d'acceptation
 * démarre décochée (boolean) — Zod exige `true` à la soumission.
 */
type Step7FormValues = Omit<CabinetStep7Input, "acceptTestTerms"> & {
  acceptTestTerms: boolean;
};

// Les valeurs par défaut et coercitions du schéma rendent z.input différent
// de z.output : on aligne le resolver sur les valeurs du formulaire.
const step7Resolver = zodResolver(
  cabinetStep7Schema,
) as unknown as Resolver<Step7FormValues>;

/** Étape 7 — Préférences de notifications et de recherche. */
export function StepPreferences({
  data,
  onBack,
  onDone,
}: {
  data: CabinetOnboardingData;
  onBack: () => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const cabinet = data.cabinet;

  const form = useForm<Step7FormValues>({
    resolver: step7Resolver,
    defaultValues: {
      emailNotifications: data.preferences?.email_notifications ?? true,
      inAppNotifications: data.preferences?.in_app_notifications ?? true,
      replacementTypesSought: cabinet?.replacement_types_sought ?? [],
      searchRadiusKm: cabinet?.search_radius_km ?? 50,
      replacementFrequency: cabinet?.replacement_frequency ?? "",
      acceptTestTerms: false,
    },
  });

  const onSubmit = (values: Step7FormValues) => {
    startTransition(async () => {
      const result = await saveCabinetStep7(values as CabinetStep7Input);
      if (result.error) {
        toast.error(result.error);
      } else {
        router.refresh();
        onDone();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Préférences</CardTitle>
        <CardDescription>
          Réglez vos notifications et précisez les remplacements que vous
          recherchez.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-3 rounded-xl border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Notifications par email</FormLabel>
                      <FormDescription>
                        Candidatures, messages et rappels.
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
                name="inAppNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-3 rounded-xl border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Notifications dans l&apos;application</FormLabel>
                      <FormDescription>
                        Alertes visibles depuis votre espace.
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
            <FormField
              control={form.control}
              name="replacementTypesSought"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Types de remplacements recherchés</FormLabel>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {REPLACEMENT_TYPE_OPTIONS.map((option) => {
                      const checked =
                        field.value?.includes(option.value) ?? false;
                      return (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) =>
                              field.onChange(
                                value === true
                                  ? [...(field.value ?? []), option.value]
                                  : (field.value ?? []).filter(
                                      (v) => v !== option.value,
                                    ),
                              )
                            }
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="searchRadiusKm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rayon géographique (km)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={1000}
                        inputMode="numeric"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="replacementFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fréquence estimée</FormLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionnez (facultatif)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FREQUENCY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="acceptTestTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3 rounded-xl border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel className="font-normal">
                      J&apos;accepte les conditions de la phase de test
                    </FormLabel>
                    <FormDescription>
                      Les informations saisies servent uniquement à tester le
                      parcours {APP_NAME}.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <StepActions onBack={onBack} pending={isPending} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
