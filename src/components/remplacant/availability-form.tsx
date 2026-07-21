"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { addAvailability } from "@/app/actions/onboarding-remplacant";
import {
  availabilitySchema,
  type AvailabilityInput,
} from "@/lib/validation/onboarding-remplacant";
import { AVAILABILITY_TYPES, WORKING_DAYS } from "@/lib/data/reference";

/** Formulaire d'ajout d'une disponibilité (ponctuelle, plage ou récurrente). */
export function AvailabilityForm() {
  const router = useRouter();

  const form = useForm<AvailabilityInput>({
    resolver: zodResolver(
      availabilitySchema,
    ) as unknown as Resolver<AvailabilityInput>,
    defaultValues: {
      type: "ponctuel",
      startDate: "",
      endDate: "",
      recurringDays: [],
      notes: "",
    },
  });

  const { isSubmitting } = form.formState;
  const type = form.watch("type");

  async function onSubmit(values: AvailabilityInput) {
    const result = await addAvailability(values);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Disponibilité ajoutée.");
    form.reset({
      type: values.type,
      startDate: "",
      endDate: "",
      recurringDays: [],
      notes: "",
    });
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de disponibilité</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-col gap-2 sm:flex-row sm:gap-5"
                >
                  {AVAILABILITY_TYPES.map((t) => (
                    <label
                      key={t.value}
                      className="flex items-center gap-2 text-sm"
                    >
                      <RadioGroupItem value={t.value} />
                      {t.label}
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {type !== "recurrent" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {type === "plage" ? "Date de début" : "Date"}
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {type === "plage" ? (
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de fin</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </div>
        ) : (
          <FormField
            control={form.control}
            name="recurringDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jours de disponibilité</FormLabel>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {WORKING_DAYS.map((day) => (
                    <label
                      key={day.value}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={field.value?.includes(day.value)}
                        onCheckedChange={(checked) => {
                          const current = field.value ?? [];
                          field.onChange(
                            checked === true
                              ? [...current, day.value]
                              : current.filter((d) => d !== day.value),
                          );
                        }}
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Notes{" "}
                <span className="font-normal text-muted-foreground">
                  (facultatif)
                </span>
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={2}
                  placeholder="Ex. : uniquement le matin, hors vacances scolaires…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          <Plus className="size-4" aria-hidden="true" />
          {isSubmitting ? "Ajout…" : "Ajouter la disponibilité"}
        </Button>
      </form>
    </Form>
  );
}
