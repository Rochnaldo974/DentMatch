"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { updateBasicInfo, updateBio } from "@/app/remplacant/profil/actions";
import {
  basicInfoSchema,
  bioSchema,
  type BasicInfoInput,
  type BioInput,
} from "@/app/remplacant/profil/schemas";

/** Formulaire d'identité : prénom, nom, téléphone. */
export function IdentityForm({
  defaultValues,
}: {
  defaultValues: BasicInfoInput;
}) {
  const router = useRouter();
  const form = useForm<BasicInfoInput>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues,
  });
  const { isSubmitting } = form.formState;

  async function onSubmit(values: BasicInfoInput) {
    const result = await updateBasicInfo(values);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Informations mises à jour.");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  autoComplete="tel"
                  placeholder="Ex. : 06 12 34 56 78"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </Form>
  );
}

/** Formulaire de présentation (bio). */
export function BioForm({ defaultBio }: { defaultBio: string }) {
  const router = useRouter();
  const form = useForm<BioInput>({
    resolver: zodResolver(bioSchema),
    defaultValues: { bio: defaultBio },
  });
  const { isSubmitting } = form.formState;

  async function onSubmit(values: BioInput) {
    const result = await updateBio(values);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Présentation mise à jour.");
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
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Présentation</FormLabel>
              <FormControl>
                <Textarea
                  rows={5}
                  placeholder="Présentez votre parcours, vos points forts et ce que vous recherchez…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </Form>
  );
}
