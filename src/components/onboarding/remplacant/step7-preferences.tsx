"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { saveReplacementStep7 } from "@/app/actions/onboarding-remplacant";
import {
  replacementStep7Schema,
  type ReplacementStep7Input,
} from "@/lib/validation/onboarding-remplacant";
import {
  REPLACEMENT_PREFERENCE_TYPES,
  ENVIRONMENT_TYPES,
  EQUIPMENT,
} from "@/lib/data/reference";
import { APP_NAME } from "@/lib/constants";
import type { ReplacementOnboardingData } from "@/components/onboarding/types";
import { CheckboxGrid, StepFooter, StepHeader } from "./step-shell";

/** Valeur sentinelle : Radix Select interdit une valeur vide. */
const ANY_ENVIRONMENT = "indifferent";

type FormValues = {
  replacementPreferences: string[];
  minCompensation: string;
  prefersRetrocession: boolean;
  prefersDailyRate: boolean;
  minDaysCount: number | string;
  preferredEnvironment: string;
  desiredEquipment: string[];
};

export function StepPreferences({
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
  const rp = data.replacement;

  // Les coercitions du schéma rendent z.input différent de z.output :
  // on aligne le resolver sur les valeurs du formulaire (pattern du projet).
  const form = useForm<FormValues>({
    resolver: zodResolver(
      replacementStep7Schema,
    ) as unknown as Resolver<FormValues>,
    defaultValues: {
      replacementPreferences: rp?.replacement_preferences ?? [],
      minCompensation: rp?.min_compensation ?? "",
      prefersRetrocession: rp?.prefers_retrocession ?? false,
      prefersDailyRate: rp?.prefers_daily_rate ?? false,
      minDaysCount: rp?.min_days_count ?? "",
      preferredEnvironment: rp?.preferred_environment ?? "",
      desiredEquipment: rp?.desired_equipment ?? [],
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await saveReplacementStep7(
        values as unknown as ReplacementStep7Input,
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
          title="Préférences de remplacement"
          description="Précisez les remplacements que vous recherchez pour recevoir des annonces pertinentes."
        />

        <FormField
          control={form.control}
          name="replacementPreferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Types de remplacement recherchés</FormLabel>
              <FormControl>
                <CheckboxGrid
                  options={REPLACEMENT_PREFERENCE_TYPES}
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
            name="minCompensation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rémunération minimale (facultatif)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex. : 50 % de rétrocession"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Montant indicatif — aucun paiement ne transite par {APP_NAME}.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minDaysCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre minimum de jours</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={365}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  Durée minimale d’un remplacement qui vous intéresse.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <FormField
            control={form.control}
            name="prefersRetrocession"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-card px-4 py-3">
                <div className="space-y-0.5 pr-4">
                  <FormLabel>Rétrocession</FormLabel>
                  <FormDescription>
                    Vous privilégiez une rémunération en pourcentage des
                    honoraires.
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
            name="prefersDailyRate"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-card px-4 py-3">
                <div className="space-y-0.5 pr-4">
                  <FormLabel>Forfait journalier</FormLabel>
                  <FormDescription>
                    Vous privilégiez un montant fixe par jour travaillé.
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
          name="preferredEnvironment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Environnement préféré</FormLabel>
              <Select
                value={field.value || ANY_ENVIRONMENT}
                onValueChange={(v) =>
                  field.onChange(v === ANY_ENVIRONMENT ? "" : v)
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full sm:max-w-72">
                    <SelectValue placeholder="Indifférent" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_ENVIRONMENT}>Indifférent</SelectItem>
                  {ENVIRONMENT_TYPES.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="desiredEquipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Équipements souhaités</FormLabel>
              <FormControl>
                <CheckboxGrid
                  options={EQUIPMENT}
                  value={field.value}
                  onChange={field.onChange}
                  className="sm:grid-cols-2 lg:grid-cols-3"
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
