import { BadgeCheck, CalendarDays, CheckCircle2 } from "lucide-react";

/**
 * Preuve produit du hero — un « readout » vertical compact : l'annonce,
 * la candidature vérifiée, une métrique. Trois idées, rien d'autre.
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

      <div className="rounded-2xl bg-card p-6 shadow-[var(--shadow-float)] ring-1 ring-black/5 sm:p-7">
        {/* En-tête du readout */}
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <p className="eyebrow">Espace cabinet</p>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            3 candidatures
          </span>
        </div>

        {/* L'annonce */}
        <div className="mt-5">
          <p className="font-display text-xl font-semibold tracking-tight">
            Remplacement omnipratique — Saint-Pierre
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-4" />
            <span className="font-data">Du 4 août au 19 septembre</span>
          </p>
        </div>

        {/* La candidature */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-background/70 p-4 ring-1 ring-border/60">
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

        {/* La métrique */}
        <div className="mt-6 flex items-baseline justify-between border-t border-border/70 pt-4">
          <span className="eyebrow">Temps de réponse</span>
          <span className="font-data text-2xl font-semibold tracking-tight">
            4 h
          </span>
        </div>
      </div>
    </div>
  );
}
