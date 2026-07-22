import { ShieldQuestion, Shuffle, Timer } from "lucide-react";

/** Trois problèmes, pas six : l'essentiel, sans noyer le lecteur. */
const PROBLEMS = [
  {
    icon: Shuffle,
    title: "Annonces éparpillées",
    description:
      "Groupes WhatsApp, bouche-à-oreille, petites annonces : rien n'est centralisé.",
  },
  {
    icon: ShieldQuestion,
    title: "Profils invérifiables",
    description:
      "Diplômes, inscription, disponibilités : impossible à vérifier avant le premier contact.",
  },
  {
    icon: Timer,
    title: "Temps perdu",
    description:
      "Relances, tris et allers-retours — au détriment des soins.",
  },
] as const;

export function ProblemSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="band-dark relative overflow-hidden rounded-3xl px-6 py-14 sm:px-10 sm:py-16 lg:px-14">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-widest text-verified uppercase">
              Le constat
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
              Trouver un remplaçant ne devrait pas être un parcours d&apos;obstacles.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-night-foreground">
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
                  className="size-5 text-verified"
                  aria-hidden="true"
                />
                <h3 className="mt-4 text-base font-semibold text-white">
                  {problem.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-night-foreground">
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
