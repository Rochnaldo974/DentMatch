"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BookOpen, GraduationCap, Hospital } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { saveReplacementStep1 } from "@/app/actions/onboarding-remplacant";
import {
  replacementStep1Schema,
  type ReplacementStep1Input,
} from "@/lib/validation/onboarding-remplacant";
import {
  PROFESSIONAL_STATUS_LABELS,
  type ProfessionalStatus,
} from "@/lib/data/reference";
import type { ReplacementOnboardingData } from "@/components/onboarding/types";
import { StepFooter, StepHeader } from "./step-shell";

const STATUS_OPTIONS: {
  value: ProfessionalStatus;
  icon: typeof GraduationCap;
  description: string;
}[] = [
  {
    value: "qualified_dentist",
    icon: GraduationCap,
    description:
      "Vous êtes titulaire du diplôme d’État de chirurgien-dentiste et inscrit au tableau de l’Ordre.",
  },
  {
    value: "student",
    icon: BookOpen,
    description:
      "Vous avez validé votre 5e année et obtenu le CSCT : vous pouvez remplacer avec une autorisation.",
  },
  {
    value: "resident",
    icon: Hospital,
    description:
      "Vous préparez un DES (ODF, chirurgie orale, médecine bucco-dentaire) avec une autorisation d’exercice.",
  },
];

export function StepStatut({
  data,
  onNext,
  onStatusSaved,
}: {
  data: ReplacementOnboardingData;
  onNext: () => void;
  onStatusSaved: (status: ProfessionalStatus) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ReplacementStep1Input>({
    resolver: zodResolver(replacementStep1Schema),
    defaultValues: {
      professionalStatus:
        data.replacement?.professional_status ??
        (undefined as unknown as ProfessionalStatus),
    },
  });

  function onSubmit(values: ReplacementStep1Input) {
    startTransition(async () => {
      const result = await saveReplacementStep1(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      onStatusSaved(values.professionalStatus);
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
          title="Votre statut professionnel"
          description="Ce statut détermine les informations et les documents qui vous seront demandés."
        />

        <FormField
          control={form.control}
          name="professionalStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Statut professionnel</FormLabel>
              <FormControl>
                <div
                  role="radiogroup"
                  aria-label="Statut professionnel"
                  className="grid gap-3"
                >
                  {STATUS_OPTIONS.map(({ value, icon: Icon, description }) => {
                    const selected = field.value === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => field.onChange(value)}
                        className={cn(
                          "flex items-start gap-4 rounded-xl border bg-card p-4 text-left transition-colors duration-150",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          selected
                            ? "border-primary ring-1 ring-primary"
                            : "hover:border-muted-foreground/40",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg",
                            selected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">
                            {PROFESSIONAL_STATUS_LABELS[value]}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <StepFooter pending={isPending} />
      </form>
    </Form>
  );
}
