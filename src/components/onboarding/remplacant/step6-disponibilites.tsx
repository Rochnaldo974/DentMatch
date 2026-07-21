"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays, Loader2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  addAvailability,
  deleteAvailability,
  saveReplacementStep6,
} from "@/app/actions/onboarding-remplacant";
import {
  availabilitySchema,
  type AvailabilityInput,
} from "@/lib/validation/onboarding-remplacant";
import {
  AVAILABILITY_TYPES,
  AVAILABILITY_PREFERENCES,
  WORKING_DAYS,
} from "@/lib/data/reference";
import type { ReplacementOnboardingData } from "@/components/onboarding/types";
import type { Tables } from "@/types/database";
import { CheckboxGrid, StepFooter, StepHeader } from "./step-shell";

type AvailabilityRow = Tables<"availabilities">;

function formatDate(d: string) {
  return format(new Date(d), "d MMMM yyyy", { locale: fr });
}

/** Libellé lisible d'une disponibilité (dates ou jours récurrents). */
function availabilityDetail(a: AvailabilityRow): string {
  if (a.type === "recurrent") {
    return a.recurring_days
      .map((d) => WORKING_DAYS.find((w) => w.value === d)?.label ?? d)
      .join(", ");
  }
  if (a.type === "plage" && a.start_date && a.end_date) {
    return `Du ${formatDate(a.start_date)} au ${formatDate(a.end_date)}`;
  }
  return a.start_date ? formatDate(a.start_date) : "—";
}

function AvailabilityList({ items }: { items: AvailabilityRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed bg-card px-4 py-6 text-center text-sm text-muted-foreground">
        Aucune disponibilité ajoutée pour le moment.
      </p>
    );
  }

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteAvailability(id);
      setDeletingId(null);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Disponibilité supprimée.");
        router.refresh();
      }
    });
  };

  return (
    <ul className="space-y-2.5">
      {items.map((a) => (
        <li
          key={a.id}
          className="flex items-start justify-between gap-3 rounded-xl border bg-card p-3.5"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <CalendarDays
                className="size-4.5 text-secondary-foreground"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary">
                  {AVAILABILITY_TYPES.find((t) => t.value === a.type)?.label ??
                    a.type}
                </Badge>
              </div>
              <p className="mt-1 text-sm font-medium">
                {availabilityDetail(a)}
              </p>
              {a.notes ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {a.notes}
                </p>
              ) : null}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isPending}
            onClick={() => handleDelete(a.id)}
            aria-label="Supprimer cette disponibilité"
          >
            {deletingId === a.id ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="size-4 text-destructive" aria-hidden="true" />
            )}
          </Button>
        </li>
      ))}
    </ul>
  );
}

type AvailabilityFormValues = {
  type: "ponctuel" | "plage" | "recurrent";
  startDate: string;
  endDate: string;
  recurringDays: string[];
  notes: string;
};

const AVAILABILITY_DEFAULTS: AvailabilityFormValues = {
  type: "ponctuel",
  startDate: "",
  endDate: "",
  recurringDays: [],
  notes: "",
};

function AddAvailabilityForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Les valeurs par défaut du schéma rendent z.input différent de z.output :
  // on aligne le resolver sur les valeurs du formulaire (pattern du projet).
  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(
      availabilitySchema,
    ) as unknown as Resolver<AvailabilityFormValues>,
    defaultValues: AVAILABILITY_DEFAULTS,
  });

  const type = form.watch("type");

  function onSubmit(values: AvailabilityFormValues) {
    startTransition(async () => {
      const result = await addAvailability(
        values as unknown as AvailabilityInput,
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Disponibilité ajoutée.");
      form.reset({ ...AVAILABILITY_DEFAULTS, type: values.type });
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border bg-card p-4"
        noValidate
      >
        <p className="text-sm font-medium">Ajouter une disponibilité</p>

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
                  className="grid gap-2 sm:grid-cols-3"
                >
                  {AVAILABILITY_TYPES.map((t) => (
                    <Label
                      key={t.value}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-sm font-normal transition-colors duration-150 hover:border-muted-foreground/40 has-data-[state=checked]:border-primary/60"
                    >
                      <RadioGroupItem value={t.value} />
                      {t.label}
                    </Label>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {type === "recurrent" ? (
          <FormField
            control={form.control}
            name="recurringDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jours de la semaine</FormLabel>
                <FormControl>
                  <CheckboxGrid
                    options={WORKING_DAYS}
                    value={field.value}
                    onChange={field.onChange}
                    className="sm:grid-cols-3 lg:grid-cols-4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
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
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (facultatif)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex. : uniquement le matin"
                  maxLength={300}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="secondary" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
          Ajouter cette disponibilité
        </Button>
      </form>
    </Form>
  );
}

export function StepDisponibilites({
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
  const [preferences, setPreferences] = useState<string[]>(
    data.replacement?.availability_preferences ?? [],
  );

  function handleContinue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveReplacementStep6({
        availabilityPreferences: preferences,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
      onNext();
    });
  }

  return (
    <div className="space-y-6">
      <StepHeader
        title="Disponibilités"
        description="Indiquez quand vous êtes disponible : les cabinets verront vos créneaux sur votre profil."
      />

      <div className="space-y-2.5">
        <h3 className="text-sm font-medium">Vos disponibilités</h3>
        <AvailabilityList items={data.availabilities} />
      </div>

      <AddAvailabilityForm />

      <form onSubmit={handleContinue} className="space-y-6" noValidate>
        <div className="space-y-2.5">
          <h3 className="text-sm font-medium">Préférences de disponibilité</h3>
          <CheckboxGrid
            options={AVAILABILITY_PREFERENCES}
            value={preferences}
            onChange={setPreferences}
          />
        </div>

        <StepFooter onBack={onBack} pending={isPending} />
      </form>
    </div>
  );
}
