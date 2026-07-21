import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { Logo } from "@/components/shared/logo";
import { PasswordForm } from "@/components/settings/password-form";

export const metadata: Metadata = {
  title: "Nouveau mot de passe",
};

export default async function MotDePassePage() {
  await requireUser();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            Nouveau mot de passe
          </h1>
          <p className="text-sm text-muted-foreground">
            Choisissez un nouveau mot de passe pour votre compte (8 caractères
            minimum).
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <PasswordForm />
        </div>

        <p className="text-center text-sm">
          <Link
            href="/parametres"
            className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Retour aux paramètres
          </Link>
        </p>
      </div>
    </div>
  );
}
