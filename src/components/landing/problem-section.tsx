import {
  CalendarX,
  Hourglass,
  MessagesSquare,
  ShieldQuestion,
  Shuffle,
  Timer,
} from "lucide-react";

const PROBLEMS = [
  {
    icon: Shuffle,
    title: "Annonces dispersées",
    description:
      "Les offres de remplacement circulent sur des canaux multiples, sans espace de référence.",
  },
  {
    icon: MessagesSquare,
    title: "Groupes de discussion désorganisés",
    description:
      "Les messages importants se perdent dans des fils de conversation sans structure.",
  },
  {
    icon: ShieldQuestion,
    title: "Profils difficiles à vérifier",
    description:
      "Diplômes, inscription et expérience sont rarement vérifiables avant le premier contact.",
  },
  {
    icon: Hourglass,
    title: "Réponses tardives",
    description:
      "Sans suivi centralisé, les échanges traînent et les remplacements se décident au dernier moment.",
  },
  {
    icon: CalendarX,
    title: "Disponibilités invisibles",
    description:
      "Impossible de savoir qui est réellement disponible sur les dates recherchées.",
  },
  {
    icon: Timer,
    title: "Temps perdu par les cabinets",
    description:
      "Relances, tris manuels et allers-retours mobilisent un temps précieux au détriment des soins.",
  },
] as const;

export function ProblemSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="band-dark relative overflow-hidden rounded-3xl px-6 py-14 sm:px-10 sm:py-16 lg:px-14">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-widest text-sidebar-primary uppercase">
              Le constat
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
              Trouver un remplaçant ne devrait pas être un parcours d&apos;obstacles.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-sidebar-foreground">
              Aujourd&apos;hui, cabinets et remplaçants composent avec des outils
              qui n&apos;ont pas été pensés pour eux.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROBLEMS.map((problem) => (
              <div
                key={problem.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors duration-200 hover:bg-white/8"
              >
                <problem.icon
                  className="size-5 text-sidebar-primary"
                  aria-hidden="true"
                />
                <h3 className="mt-4 text-base font-semibold text-white">
                  {problem.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-sidebar-foreground">
                  {problem.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
