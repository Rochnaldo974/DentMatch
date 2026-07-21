import { Building2, Stethoscope } from "lucide-react";

const CABINET_STEPS = [
  {
    title: "Créez votre cabinet",
    description: "Présentez votre structure, votre équipe et votre plateau technique.",
  },
  {
    title: "Publiez votre besoin",
    description: "Dates, spécialité, conditions : votre annonce est en ligne en quelques minutes.",
  },
  {
    title: "Recevez des candidatures qualifiées",
    description: "Chaque candidature affiche un profil complet et son statut de vérification.",
  },
  {
    title: "Acceptez votre remplaçant",
    description: "Validez la candidature qui vous convient et suivez le remplacement.",
  },
] as const;

const REPLACEMENT_STEPS = [
  {
    title: "Créez votre profil vérifié",
    description: "Renseignez votre parcours et transmettez vos justificatifs en toute confidentialité.",
  },
  {
    title: "Indiquez vos disponibilités",
    description: "Précisez vos périodes et zones d'exercice souhaitées.",
  },
  {
    title: "Découvrez les annonces adaptées",
    description: "Les offres correspondant à vos dates et votre secteur vous sont proposées.",
  },
  {
    title: "Candidatez en quelques secondes",
    description: "Un clic suffit, votre profil parle pour vous.",
  },
] as const;

function StepList({ steps }: { steps: readonly { title: string; description: string }[] }) {
  return (
    <ol className="mt-8">
      {steps.map((step, index) => (
        <li key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
          {index < steps.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute top-9 bottom-1 left-4 w-px -translate-x-1/2 border-l border-dashed border-border"
            />
          )}
          <span
            aria-hidden="true"
            className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-primary to-primary/85 text-sm font-semibold text-white tabular-nums shadow-sm"
          >
            {index + 1}
          </span>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              {step.title}
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function HowItWorks() {
  return (
    <section id="fonctionnement" className="scroll-mt-28 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Un parcours simple, de chaque côté du fauteuil.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Quatre étapes pour les cabinets, quatre étapes pour les remplaçants.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div
            id="cabinets"
            className="scroll-mt-28 rounded-3xl border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <Building2 className="size-5" aria-hidden="true" />
              </span>
              <h3 className="text-xl font-semibold">Pour les cabinets</h3>
            </div>
            <StepList steps={CABINET_STEPS} />
          </div>

          <div
            id="remplacants"
            className="scroll-mt-28 rounded-3xl border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Stethoscope className="size-5" aria-hidden="true" />
              </span>
              <h3 className="text-xl font-semibold">Pour les remplaçants</h3>
            </div>
            <StepList steps={REPLACEMENT_STEPS} />
          </div>
        </div>
      </div>
    </section>
  );
}
