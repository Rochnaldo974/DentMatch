import { BadgeCheck, CalendarDays, Check, MapPin } from "lucide-react";

/**
 * Preuve produit du hero : le parcours d'un remplacement raconté en trois
 * étapes — publication, candidatures vérifiées, acceptation. Données
 * fictives, purement décoratives.
 */

const CANDIDATE_AVATARS = [
  { initials: "SM", classes: "bg-primary text-primary-foreground" },
  { initials: "TL", classes: "bg-verified text-verified-foreground" },
  { initials: "IR", classes: "bg-secondary text-secondary-foreground" },
];

export function DashboardPreview() {
  return (
    <div
      aria-hidden="true"
      className="relative select-none rounded-3xl bg-card p-6 ring-1 ring-black/5 shadow-[var(--shadow-float)] sm:p-7"
    >
      {/* L'annonce */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Votre annonce</p>
          <p className="mt-2 font-display text-lg font-semibold leading-snug">
            Remplacement omnipratique
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              <span className="font-data">4 août — 19 sept.</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              Saint-Pierre
            </span>
          </p>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
          Publiée
        </span>
      </div>

      {/* Le parcours, en trois étapes */}
      <ol className="relative mt-6 space-y-5 border-l border-border/70 pl-6 [&>li]:relative">
        <li>
          <TimelineDot done />
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Annonce publiée</p>
            <p className="font-data text-xs text-muted-foreground">lun. 09:12</p>
          </div>
        </li>

        <li>
          <TimelineDot done />
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">3 candidatures reçues</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-verified">
                <BadgeCheck className="size-3.5" />
                Profils vérifiés
              </p>
            </div>
            <div className="flex -space-x-2">
              {CANDIDATE_AVATARS.map((avatar) => (
                <span
                  key={avatar.initials}
                  className={`flex size-8 items-center justify-center rounded-full text-[11px] font-semibold ring-2 ring-card ${avatar.classes}`}
                >
                  {avatar.initials}
                </span>
              ))}
            </div>
          </div>
        </li>

        <li>
          <TimelineDot done pulse />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">Dr Sarah M. acceptée</p>
            <span className="flex items-center gap-1.5 rounded-full bg-verified-soft px-2.5 py-1 text-xs font-semibold text-accent-foreground">
              <Check className="size-3.5" />
              Remplacement confirmé
            </span>
          </div>
        </li>
      </ol>

      {/* Métrique de clôture */}
      <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
        <p className="eyebrow">Du besoin à l&apos;accord</p>
        <p className="font-data text-2xl font-semibold tracking-tight">
          2 jours
        </p>
      </div>
    </div>
  );
}

/** Pastille de la frise : coche turquoise, halo pulsé pour l'étape finale. */
function TimelineDot({ done, pulse }: { done?: boolean; pulse?: boolean }) {
  return (
    <span className="absolute top-0.5 -left-[31px] flex size-5 items-center justify-center">
      {pulse ? (
        <span className="absolute inset-0 animate-ping rounded-full bg-verified/30" />
      ) : null}
      <span
        className={`relative flex size-5 items-center justify-center rounded-full ${
          done ? "bg-verified text-verified-foreground" : "border bg-card"
        }`}
      >
        <Check className="size-3" strokeWidth={3} />
      </span>
    </span>
  );
}
