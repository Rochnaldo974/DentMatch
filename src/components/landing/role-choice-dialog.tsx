"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Building2, Loader2, Stethoscope } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { signIn } from "@/app/actions/auth";
import { DEMO_ACCOUNTS, DEMO_MODE } from "@/lib/constants";

const ROLES = [
  {
    key: "cabinet" as const,
    icon: Building2,
    title: "Je suis un cabinet",
    description: "Je cherche un remplaçant pour mon cabinet dentaire.",
    accent: "bg-primary text-primary-foreground",
    signupHref: "/inscription?role=cabinet",
  },
  {
    key: "remplacant" as const,
    icon: Stethoscope,
    title: "Je suis remplaçant(e)",
    description: "Je cherche des remplacements en cabinet.",
    accent: "bg-verified text-verified-foreground",
    signupHref: "/inscription?role=remplacant",
  },
];

/**
 * Popup « Tester gratuitement » : en mode démonstration, chaque option
 * connecte INSTANTANÉMENT à un compte de test (aucun formulaire).
 * Hors mode démo, les options mènent à l'inscription avec le rôle prérempli.
 */
export function RoleChoiceDialog({ trigger }: { trigger: React.ReactNode }) {
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDemoLogin(role: "cabinet" | "remplacant") {
    setPendingRole(role);
    startTransition(async () => {
      const result = await signIn(DEMO_ACCOUNTS[role]);
      // signIn redirige vers le dashboard en cas de succès —
      // on n'arrive ici qu'en cas d'erreur.
      if (result?.error) {
        toast.error(result.error);
        setPendingRole(null);
      }
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Vous êtes… ?
          </DialogTitle>
          <DialogDescription>
            {DEMO_MODE
              ? "Choisissez votre profil : vous entrez immédiatement dans un espace de démonstration rempli de données de test."
              : "Deux profils, deux parcours. Choisissez le vôtre — c'est gratuit pendant la phase de test."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const loading = isPending && pendingRole === role.key;
            const cardClasses =
              "group flex w-full flex-col gap-3 rounded-2xl border bg-card p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)] disabled:pointer-events-none disabled:opacity-60";

            const content = (
              <>
                <span
                  className={`flex size-11 items-center justify-center rounded-xl ${role.accent}`}
                >
                  {loading ? (
                    <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Icon className="size-5" aria-hidden="true" />
                  )}
                </span>
                <span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    {loading ? "Connexion…" : role.title}
                    <ArrowRight
                      className="size-4 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {loading
                      ? "Ouverture de l'espace de démonstration."
                      : role.description}
                  </span>
                </span>
              </>
            );

            return DEMO_MODE ? (
              <button
                key={role.key}
                type="button"
                disabled={isPending}
                onClick={() => handleDemoLogin(role.key)}
                className={cardClasses}
              >
                {content}
              </button>
            ) : (
              <Link key={role.key} href={role.signupHref} className={cardClasses}>
                {content}
              </Link>
            );
          })}
        </div>

        {DEMO_MODE ? (
          <p className="text-center text-xs text-muted-foreground">
            Vous préférez votre propre compte ?{" "}
            <Link
              href="/inscription"
              className="font-medium underline underline-offset-4 hover:text-foreground"
            >
              Créer un compte
            </Link>
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
