import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "Créer un compte",
};

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  // Rôle présélectionné depuis la landing (CTA ou popup de choix).
  const defaultRole =
    role === "cabinet"
      ? ("cabinet" as const)
      : role === "remplacant"
        ? ("replacement_dentist" as const)
        : undefined;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Créer un compte
        </h1>
        <p className="text-sm text-muted-foreground">
          Rejoignez {APP_NAME} en quelques minutes.
        </p>
      </div>

      <SignUpForm defaultRole={defaultRole} />

      <p className="text-center text-sm text-muted-foreground">
        Déjà inscrit ?{" "}
        <Link
          href="/connexion"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
