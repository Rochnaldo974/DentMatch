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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { EQUIPMENT, SPECIALTIES, type Option } from "@/lib/data/reference";
import {
  cabinetStep4Schema,
  type CabinetStep4Input,
} from "@/lib/validation/onboarding-cabinet";
import { saveCabinetStep4 } from "@/app/actions/onboarding-cabinet";
import type { CabinetOnboardingData } from "@/components/onboarding/types";
import { StepActions } from "./step-actions";

// La spécialité d'internat « médecine bucco-dentaire » n'est pas proposée
// comme activité de cabinet.
const CABINET_SPECIALTIES = SPECIALTIES.filter(
  (specialty) => specialty.value !== "medecine_bucco_dentaire",
);

// Les valeurs par défaut du schéma rendent z.input différent de z.output :
// on aligne le resolver sur les valeurs du formulaire.
const step4Resolver = zodResolver(
  cabinetStep4Schema,
) as unknown as Resolver<CabinetStep4Input>;

function OptionCard({
  option,
  checked,
  onCheckedChange,
}: {
  option: Option;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-3 text-sm font-medium transition-colors hover:bg-muted/40 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      {option.label}
    </label>
  );
}

/** Étape 4 — Activités pratiquées et équipements disponibles. */
export function StepActivities({
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

  const form = useForm<CabinetStep4Input>({
    resolver: step4Resolver,
    defaultValues: {
      specialties: data.specialtyCodes,
      equipment: data.equipmentCodes,
    },
  });

  const onSubmit = (values: CabinetStep4Input) => {
    startTransition(async () => {
      const result = await saveCabinetStep4(values);
      if (result.error) {
        toast.error(result.error);
      } else {
        router.refresh();
        onDone();
      }
    });
  };

  const toggle = (list: string[], value: string, checked: boolean) =>
    checked ? [...list, value] : list.filter((item) => item !== value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activités et équipements</CardTitle>
        <CardDescription>
          Sélectionnez les activités pratiquées et les équipements mis à
          disposition des remplaçants.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="specialties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activités pratiquées</FormLabel>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {CABINET_SPECIALTIES.map((option) => (
                      <OptionCard
                        key={option.value}
                        option={option}
                        checked={field.value?.includes(option.value) ?? false}
                        onCheckedChange={(checked) =>
                          field.onChange(
                            toggle(field.value ?? [], option.value, checked),
                          )
                        }
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Équipements disponibles</FormLabel>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {EQUIPMENT.map((option) => (
                      <OptionCard
                        key={option.value}
                        option={option}
                        checked={field.value?.includes(option.value) ?? false}
                        onCheckedChange={(checked) =>
                          field.onChange(
                            toggle(field.value ?? [], option.value, checked),
                          )
                        }
                      />
                    ))}
                  </div>
                  <FormMessage />
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
