import {
  BadgeCheck,
  Bell,
  CalendarCheck,
  ClipboardCheck,
  FileText,
  Inbox,
  MapPin,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

/** Teintes des puces d'icônes, alternées pour rythmer la grille. */
const CHIP_TONES = [
  "bg-primary/10 text-primary",
  "bg-verified/10 text-verified",
  "bg-amber-500/10 text-amber-600",
  "bg-violet-500/10 text-violet-600",
] as const;

const FEATURES: readonly {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Inbox,
    title: "Candidatures centralisées",
    description:
      "Toutes les candidatures d'une annonce au même endroit, avec leur statut.",
  },
  {
    icon: BadgeCheck,
    title: "Profils vérifiés",
    description:
      "Les informations professionnelles déclarées sont contrôlées par nos équipes.",
  },
  {
    icon: FileText,
    title: "Annonces détaillées",
    description:
      "Dates, spécialité, rétrocession, plateau technique : tout est clair dès l'annonce.",
  },
  {
    icon: MessageSquare,
    title: "Messagerie sécurisée",
    description:
      "Échangez directement sur la plateforme, sans partager vos coordonnées trop tôt.",
  },
  {
    icon: MapPin,
    title: "Recherche géographique",
    description:
      "Trouvez des opportunités par ville, département ou territoire d'outre-mer.",
  },
  {
    icon: CalendarCheck,
    title: "Disponibilité par dates",
    description:
      "Les remplaçants indiquent leurs périodes, les cabinets ciblent les bonnes personnes.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description:
      "Nouvelle candidature, réponse, message : soyez prévenu au bon moment.",
  },
  {
    icon: ClipboardCheck,
    title: "Suivi des remplacements",
    description:
      "Une checklist claire pour suivre chaque remplacement, de l'accord à la fin de mission.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Fonctionnalités</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Tout ce qu&apos;il faut pour organiser un remplacement.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Des outils pensés pour la réalité des cabinets dentaires et des
            praticiens remplaçants.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 90}>
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-xl",
                  CHIP_TONES[i % CHIP_TONES.length],
                )}
              >
                <feature.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-medium">{feature.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
