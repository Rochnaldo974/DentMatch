import { BadgeCheck, CalendarDays, CheckCircle2 } from "lucide-react";

/**
 * Preuve produit du hero — volontairement minimaliste : une annonce,
 * une candidature vérifiée, une confirmation. Trois idées, rien d'autre.
 * Données fictives, purement décoratives.
 */
export function DashboardPreview() {
  return (
    <div aria-hidden="true" className="relative select-none">
      {/* Badge flottant : la promesse du produit */}
      <div className="glass animate-float absolute -top-5 right-4 z-10 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium sm:right-8">
        <CheckCircle2 className="size-4.5 text-verified" />
        Remplacement confirmé
      </div>

      {/* Cadre double bordure */}
      <div className="rounded-3xl border bg-white/60 p-1.5 shadow-[var(--shadow-float)] backdrop-blur-sm">
        <div className="overflow-hidden rounded-[1.125rem] border border-border/60 bg-card">
          {/* Barre de fenêtre */}
          <div className="flex items-center gap-1.5 border-b border-border/60 px-5 py-3.5">
            <span className="size-2.5 rounded-full bg-destructive/30" />
            <span className="size-2.5 rounded-full bg-warning/50" />
            <span className="size-2.5 rounded-full bg-verified/40" />
          </div>

          <div className="space-y-5 p-6 sm:p-8">
            {/* L'annonce */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold sm:text-xl">
                  Remplacement omnipratique — Saint-Pierre
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" />
                  Du 4 août au 19 septembre
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                3 candidatures
              </span>
            </div>

            {/* La candidature */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-background/60 p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-linear-to-b from-primary to-primary/80 text-sm font-semibold text-primary-foreground">
                  SM
                </span>
                <div>
                  <p className="font-medium">Dr Sarah M.</p>
                  <p className="flex items-center gap-1 text-sm text-verified">
                    <BadgeCheck className="size-4" />
                    Profil vérifié
                  </p>
                </div>
              </div>
              <span className="rounded-xl bg-linear-to-b from-primary to-primary/85 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm">
                Accepter
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
