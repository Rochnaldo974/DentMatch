"use client";

import Link from "next/link";
import { ArrowRight, Building2, Stethoscope } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ROLES = [
  {
    href: "/inscription?role=cabinet",
    icon: Building2,
    title: "Je suis un cabinet",
    description: "Je cherche un remplaçant pour mon cabinet dentaire.",
    accent: "bg-primary text-primary-foreground",
  },
  {
    href: "/inscription?role=remplacant",
    icon: Stethoscope,
    title: "Je suis remplaçant(e)",
    description: "Je cherche des remplacements en cabinet.",
    accent: "bg-verified text-verified-foreground",
  },
] as const;

/** Popup de choix du profil avant l'inscription (« Tester gratuitement »). */
export function RoleChoiceDialog({ trigger }: { trigger: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Vous êtes… ?
          </DialogTitle>
          <DialogDescription>
            Deux profils, deux parcours. Choisissez le vôtre — c&apos;est
            gratuit pendant la phase de test.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <Link
                key={role.href}
                href={role.href}
                className="group flex flex-col gap-3 rounded-2xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)]"
              >
                <span
                  className={`flex size-11 items-center justify-center rounded-xl ${role.accent}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    {role.title}
                    <ArrowRight
                      className="size-4 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {role.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
