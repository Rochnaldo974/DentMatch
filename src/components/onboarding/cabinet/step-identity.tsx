"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MANAGER_ROLES } from "@/lib/data/reference";
import {
  cabinetStep1Schema,
  type CabinetStep1Input,
} from "@/lib/validation/onboarding-cabinet";
import { saveCabinetStep1 } from "@/app/actions/onboarding-cabinet";
import type { CabinetOnboardingData } from "@/components/onboarding/types";
import { StepActions } from "./step-actions";

/** Étape 1 — Identité du responsable du cabinet. */
export function StepIdentity({
  data,
  onDone,
}: {
  data: CabinetOnboardingData;
  onDone: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CabinetStep1Input>({
    resolver: zodResolver(cabinetStep1Schema),
    defaultValues: {
      firstName: data.profile.first_name,
      lastName: data.profile.last_name,
      managerRole: data.cabinet?.manager_role ?? "",
      phone: data.profile.phone ?? "",
      managerEmail: data.cabinet?.manager_email ?? "",
    },
  });

  const onSubmit = (values: CabinetStep1Input) => {
    startTransition(async () => {
      const result = await saveCabinetStep1(values);
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
        <CardTitle>Identité du responsable</CardTitle>
        <CardDescription>
          Coordonnées de la personne qui gère les remplacements du cabinet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input autoComplete="given-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input autoComplete="family-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="managerRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fonction</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez votre fonction" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MANAGER_ROLES.map((option) => (
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
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        autoComplete="tel"
                        placeholder="06 12 34 56 78"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="managerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email professionnel</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="contact@cabinet.fr"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <StepActions pending={isPending} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
