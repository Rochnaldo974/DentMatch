"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { signIn } from "@/app/actions/auth";
import { signInSchema, type SignInInput } from "@/lib/validation/auth";
import {
  DEMO_MODE,
  DEMO_ACCOUNTS,
  DEMO_DISCLAIMER,
} from "@/lib/constants";

export function SignInForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: SignInInput) {
    setServerError(null);
    const result = await signIn(values);
    if (result?.error) {
      setServerError(result.error);
      toast.error(result.error);
    }
    // En cas de succès, l'action redirige côté serveur.
  }

  function submitDemoAccount(account: keyof typeof DEMO_ACCOUNTS) {
    form.setValue("email", DEMO_ACCOUNTS[account].email);
    form.setValue("password", DEMO_ACCOUNTS[account].password);
    void form.handleSubmit(onSubmit)();
  }

  return (
    <div className="space-y-5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
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
                <div className="flex items-center justify-between">
                  <FormLabel>Mot de passe</FormLabel>
                  <Link
                    href="/mot-de-passe-oublie"
                    className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
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
            {isSubmitting ? "Connexion…" : "Se connecter"}
          </Button>
        </form>
      </Form>

      {DEMO_MODE ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">
              Mode démonstration
            </span>
            <Separator className="flex-1" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={() => submitDemoAccount("cabinet")}
            >
              <Building2 aria-hidden="true" />
              Tester comme cabinet
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={() => submitDemoAccount("remplacant")}
            >
              <Stethoscope aria-hidden="true" />
              Tester comme remplaçant
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {DEMO_DISCLAIMER}
          </p>
        </div>
      ) : null}
    </div>
  );
}
