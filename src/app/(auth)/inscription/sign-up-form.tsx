"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2, Stethoscope, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { signUp } from "@/app/actions/auth";
import { signUpSchema, type SignUpInput } from "@/lib/validation/auth";

const ROLE_OPTIONS = [
  {
    value: "cabinet",
    label: "Cabinet dentaire",
    description: "Je cherche un remplaçant pour mon cabinet.",
    icon: Building2,
  },
  {
    value: "replacement_dentist",
    label: "Chirurgien-dentiste remplaçant",
    description: "Je cherche des remplacements.",
    icon: Stethoscope,
  },
] as const;

export function SignUpForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined as unknown as SignUpInput["role"],
      acceptTerms: false as unknown as true,
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: SignUpInput) {
    setServerError(null);
    const result = await signUp(values);
    if (result?.error) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }
    if (result?.info) {
      setSuccessInfo(result.info);
    }
    // Sinon, l'action redirige vers /onboarding côté serveur.
  }

  if (successInfo) {
    return (
      <div className="flex flex-col items-center rounded-xl border bg-card px-6 py-10 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-verified-soft">
          <MailCheck className="size-6 text-verified" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold">Vérifiez votre boîte mail</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {successInfo}
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/connexion">Aller à la connexion</Link>
        </Button>
      </div>
    );
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
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vous êtes</FormLabel>
              <FormControl>
                <div
                  role="radiogroup"
                  aria-label="Choix du profil"
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {ROLE_OPTIONS.map(
                    ({ value, label, description, icon: Icon }) => {
                      const selected = field.value === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => field.onChange(value)}
                          className={cn(
                            "flex flex-col items-start gap-2 rounded-xl border bg-card p-4 text-left transition-colors duration-150",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            selected
                              ? "border-primary ring-1 ring-primary"
                              : "hover:border-muted-foreground/40",
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-9 items-center justify-center rounded-lg",
                              selected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            <Icon className="size-5" aria-hidden="true" />
                          </span>
                          <span className="text-sm font-medium">{label}</span>
                          <span className="text-xs text-muted-foreground">
                            {description}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.fr"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmez le mot de passe</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-2.5">
                <FormControl>
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal leading-snug text-muted-foreground">
                  J&apos;accepte les{" "}
                  <Link
                    href="/conditions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    conditions d&apos;utilisation
                  </Link>
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError ? (
          <p className="text-sm text-destructive" role="alert">
            {serverError}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Création du compte…" : "Créer mon compte"}
        </Button>
      </form>
    </Form>
  );
}
