import { Info } from "lucide-react";

const TESTIMONIALS = [
  {
    initials: "PG",
    name: "Pierre G.",
    role: "Chirurgien-dentiste titulaire, Lyon",
    quote:
      "J'ai publié mon annonce un lundi matin, j'avais trois candidatures vérifiées avant le soir. Le tri se fait tout seul.",
  },
  {
    initials: "LN",
    name: "Laure N.",
    role: "Remplaçante diplômée, La Réunion",
    quote:
      "Depuis La Réunion, trouver des remplacements sérieux était compliqué. Ici, les annonces sont claires et les échanges restent cadrés.",
  },
  {
    initials: "MB",
    name: "Mathis B.",
    role: "Étudiant en 6e année, Bordeaux",
    quote:
      "Mon profil était prêt en dix minutes. Je vois exactement quelles annonces correspondent à mes disponibilités entre deux stages.",
  },
] as const;

export function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="eyebrow">Ils témoignent</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Ce que la plateforme change au quotidien.
          </h2>
        </div>

        <p className="mt-6 inline-flex items-start gap-2 rounded-full bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-[var(--shadow-card)]">
          <Info className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          Témoignages fictifs présentés à titre d&apos;exemple pour la
          démonstration du MVP.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-card p-6 pt-14 shadow-[var(--shadow-card)] ring-1 ring-black/5"
            >
              <span
                aria-hidden="true"
                className="absolute -top-3 left-4 font-display text-7xl leading-none text-accent select-none"
              >
                «
              </span>
              <blockquote className="relative text-sm leading-relaxed text-foreground">
                « {testimonial.quote} »
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t pt-5">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-verified-soft to-secondary text-xs font-semibold text-accent-foreground"
                >
                  {testimonial.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
