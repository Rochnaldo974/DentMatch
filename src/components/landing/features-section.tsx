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

const TILE_CLASS =
  "rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]";

function FeatureChip({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
}

function FeatureText({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function FeatureTile({
  icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn(TILE_CLASS, className)}>
      <FeatureChip icon={icon} />
      <FeatureText title={title} description={description} className="mt-4" />
    </div>
  );
}

/** Mini-maquette fictive : lignes de candidatures (décoratif). */
const FAKE_APPLICATIONS = [
  { initials: "SM", name: "Dr Sarah M.", status: "Nouvelle", isNew: true },
  { initials: "TL", name: "Dr Thomas L.", status: "Nouvelle", isNew: true },
  { initials: "IR", name: "Dr Inès R.", status: "Vue", isNew: false },
] as const;

function ApplicationsDemo() {
  return (
    <div aria-hidden="true" className="mt-5 select-none space-y-2">
      {FAKE_APPLICATIONS.map((application) => (
        <div
          key={application.name}
          className="flex items-center justify-between gap-3 rounded-lg border bg-background/70 px-3 py-2"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {application.initials}
            </span>
            <span className="truncate text-xs font-medium text-foreground">
              {application.name}
            </span>
          </span>
          <span
            className={
              application.isNew
                ? "shrink-0 rounded-full border border-verified/25 bg-verified-soft px-2 py-0.5 text-[10px] font-medium text-accent-foreground"
                : "shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
            }
          >
            {application.status}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Mini-maquette fictive : bulles de messagerie (décoratif). */
function ChatDemo() {
  return (
    <div aria-hidden="true" className="mt-5 select-none space-y-2">
      <p className="max-w-[85%] rounded-2xl rounded-bl-sm bg-secondary px-3.5 py-2 text-xs leading-relaxed text-secondary-foreground">
        Bonjour, je suis disponible du 17 au 29 août.
      </p>
      <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-xs leading-relaxed text-primary-foreground">
        Parfait, je vous envoie les détails du cabinet.
      </p>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Tout ce qu&apos;il faut pour organiser un remplacement.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Des outils pensés pour la réalité des cabinets dentaires et des
            praticiens remplaçants.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {/* Tuile large — candidatures centralisées */}
          <div className={cn(TILE_CLASS, "md:col-span-2")}>
            <FeatureChip icon={Inbox} />
            <FeatureText
              title="Candidatures centralisées"
              description="Toutes les candidatures d'une annonce au même endroit, avec leur statut."
              className="mt-4"
            />
            <ApplicationsDemo />
          </div>

          <FeatureTile
            icon={BadgeCheck}
            title="Profils vérifiés"
            description="Les informations professionnelles déclarées sont contrôlées par nos équipes."
          />

          <FeatureTile
            icon={FileText}
            title="Annonces détaillées"
            description="Dates, spécialité, rétrocession, plateau technique : tout est clair dès l'annonce."
          />

          {/* Tuile large — messagerie sécurisée */}
          <div className={cn(TILE_CLASS, "md:col-span-2")}>
            <FeatureChip icon={MessageSquare} />
            <FeatureText
              title="Messagerie sécurisée"
              description="Échangez directement sur la plateforme, sans partager vos coordonnées trop tôt."
              className="mt-4"
            />
            <ChatDemo />
          </div>

          <FeatureTile
            icon={MapPin}
            title="Recherche géographique"
            description="Trouvez des opportunités par ville, département ou territoire d'outre-mer."
          />

          <FeatureTile
            icon={CalendarCheck}
            title="Disponibilité par dates"
            description="Les remplaçants indiquent leurs périodes, les cabinets ciblent les bonnes personnes."
          />

          <FeatureTile
            icon={Bell}
            title="Notifications"
            description="Nouvelle candidature, réponse, message : soyez prévenu au bon moment."
          />

          {/* Tuile pleine largeur — suivi */}
          <div
            className={cn(
              TILE_CLASS,
              "md:col-span-3 md:flex md:items-center md:gap-5"
            )}
          >
            <FeatureChip icon={ClipboardCheck} />
            <FeatureText
              title="Suivi des remplacements"
              description="Une checklist claire pour suivre chaque remplacement, de l'accord à la fin de mission."
              className="mt-4 md:mt-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
