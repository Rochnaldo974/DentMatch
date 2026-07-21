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
import { REGIONS, STRUCTURE_TYPES, TERRITORIES } from "@/lib/data/reference";
import {
  cabinetStep2Schema,
  type CabinetStep2Input,
} from "@/lib/validation/onboarding-cabinet";
import { saveCabinetStep2 } from "@/app/actions/onboarding-cabinet";
import type { CabinetOnboardingData } from "@/components/onboarding/types";
import { StepActions } from "./step-actions";

const METROPOLE = "France métropolitaine";

/** Étape 2 — Informations administratives et adresse du cabinet. */
export function StepCabinetInfo({
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

  const form = useForm<CabinetStep2Input>({
    resolver: zodResolver(cabinetStep2Schema),
    defaultValues: {
      name: cabinet?.name ?? "",
      structureType: cabinet?.structure_type ?? "",
      siret: cabinet?.siret ?? "",
      finess: cabinet?.finess ?? "",
      addressLine1: cabinet?.address_line_1 ?? "",
      addressLine2: cabinet?.address_line_2 ?? "",
      postalCode: cabinet?.postal_code ?? "",
      city: cabinet?.city ?? "",
      department: cabinet?.department ?? "",
      region: cabinet?.region ?? "",
      territory: cabinet?.territory ?? METROPOLE,
      phone: cabinet?.phone ?? "",
      email: cabinet?.email ?? "",
      website: cabinet?.website ?? "",
    },
  });

  const territory = form.watch("territory");
  const isMetropole = territory === METROPOLE;

  const onSubmit = (values: CabinetStep2Input) => {
    startTransition(async () => {
      const result = await saveCabinetStep2(values);
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
        <CardTitle>Informations du cabinet</CardTitle>
        <CardDescription>
          Informations déclarées : elles permettent aux remplaçants d&apos;identifier
          votre structure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du cabinet</FormLabel>
                    <FormControl>
                      <Input autoComplete="organization" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="structureType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de structure</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STRUCTURE_TYPES.map((option) => (
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
              <FormField
                control={form.control}
                name="siret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SIRET</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="14 chiffres"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="finess"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FINESS (facultatif)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="9 chiffres"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input autoComplete="address-line1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Complément d&apos;adresse (facultatif)</FormLabel>
                    <FormControl>
                      <Input autoComplete="address-line2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code postal</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        autoComplete="postal-code"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <FormControl>
                      <Input autoComplete="address-level2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="territory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Territoire</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value !== METROPOLE) {
                          // En outre-mer, la région correspond au territoire.
                          form.setValue("region", value);
                        } else if (
                          !(REGIONS as readonly string[]).includes(
                            form.getValues("region"),
                          )
                        ) {
                          form.setValue("region", "");
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TERRITORIES.map((territoryOption) => (
                          <SelectItem key={territoryOption} value={territoryOption}>
                            {territoryOption}
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
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Région</FormLabel>
                    {isMetropole ? (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionnez" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {REGIONS.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Département</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex. : La Réunion, Rhône…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone du cabinet</FormLabel>
                    <FormControl>
                      <Input type="tel" autoComplete="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email du cabinet</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site web (facultatif)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://…"
                        autoComplete="url"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <StepActions onBack={onBack} pending={isPending} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
