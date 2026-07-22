import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Briefcase,
  CalendarDays,
  Languages,
  Map,
  MapPin,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge } from "@/components/shared/verification-badge";
import {
  InviteCandidateDialog,
  type InvitableJobPost,
} from "@/components/cabinet/invite-candidate-dialog";
import { labelFor } from "@/components/job-posts/format";
import { PROFESSIONAL_STATUS_LABELS, WORKING_DAYS } from "@/lib/data/reference";
import type { Tables } from "@/types/database";

const MAX_SPECIALTY_BADGES = 4;

/** Profil public de la vue `public_candidate_profiles` — aucune donnée sensible. */
export type CandidateCardData = Tables<"public_candidate_profiles">;

export type CandidateAvailability = {
  type: string;
  start_date: string | null;
  end_date: string | null;
  recurring_days: string[];
};

/** Date courte : « 3 août » / « 20 sept. 2027 » si année différente. */
function shortDate(date: string): string {
  const d = new Date(date);
  const pattern =
    d.getFullYear() === new Date().getFullYear() ? "d MMM" : "d MMM yyyy";
  return format(d, pattern, { locale: fr });
}

/** Libellé lisible d'une disponibilité déclarée. */
function availabilityLabel(a: CandidateAvailability): string | null {
  if (a.type === "recurrent") {
    const days = a.recurring_days
      .map((d) => labelFor(WORKING_DAYS, d) ?? d)
      .join(", ");
    return days ? `${days} (récurrent)` : null;
  }
  if (a.start_date && a.end_date && a.start_date !== a.end_date) {
    return `${shortDate(a.start_date)} — ${shortDate(a.end_date)}`;
  }
  if (a.start_date) return `À partir du ${shortDate(a.start_date)}`;
  return null;
}

/** Texte d'expérience : « 6 ans d'expérience ». */
function experienceLabel(years: number | null): string | null {
  if (years == null) return null;
  if (years === 0) return "Moins d'un an d'expérience";
  return years === 1 ? "1 an d'expérience" : `${years} ans d'expérience`;
}

/**
 * Carte annuaire d'un remplaçant (Server Component).
 * Confidentialité : n'affiche QUE les champs de la vue publique —
 * jamais de téléphone, email, RPPS ni adresse.
 */
export function CandidateCard({
  candidate,
  specialties,
  availabilities,
  jobPosts,
}: {
  candidate: CandidateCardData;
  specialties: string[];
  availabilities: CandidateAvailability[];
  jobPosts: InvitableJobPost[];
}) {
  const fullName = [candidate.first_name, candidate.last_name_initial]
    .filter(Boolean)
    .join(" ");
  const initials = `${candidate.first_name?.[0] ?? ""}${
    candidate.last_name_initial?.[0] ?? ""
  }`.toUpperCase();

  const location = [candidate.city, candidate.territory]
    .filter(Boolean)
    .join(" · ");
  const experience = experienceLabel(candidate.experience_years);
  const mobility = candidate.national_mobility
    ? "Mobilité nationale"
    : candidate.mobility_radius_km
      ? `Mobilité : ${candidate.mobility_radius_km} km`
      : null;

  const visibleSpecialties = specialties.slice(0, MAX_SPECIALTY_BADGES);
  const extraSpecialties = specialties.length - visibleSpecialties.length;

  const availabilityLabels = availabilities
    .map(availabilityLabel)
    .filter((l): l is string => Boolean(l));

  return (
    <article className="flex flex-col gap-4 rounded-xl border bg-card p-5 transition-shadow duration-200 hover:shadow-sm">
      <header className="flex items-start gap-3.5">
        <Avatar className="size-12">
          {candidate.avatar_url ? (
            <AvatarImage src={candidate.avatar_url} alt="" />
          ) : null}
          <AvatarFallback aria-hidden="true">{initials || "?"}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold">{fullName}</h3>
            <VerificationBadge
              status={candidate.verification_status ?? "unverified"}
              short
            />
          </div>
          {candidate.professional_status ? (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {PROFESSIONAL_STATUS_LABELS[candidate.professional_status]}
            </p>
          ) : null}
        </div>
      </header>

      <dl className="space-y-1.5 text-sm text-muted-foreground">
        {location ? (
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Localisation</dt>
            <dd className="truncate">{location}</dd>
          </div>
        ) : null}
        {experience ? (
          <div className="flex items-center gap-2">
            <Briefcase className="size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Expérience</dt>
            <dd>{experience}</dd>
          </div>
        ) : null}
        {mobility ? (
          <div className="flex items-center gap-2">
            <Map className="size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Mobilité</dt>
            <dd>{mobility}</dd>
          </div>
        ) : null}
        {candidate.languages && candidate.languages.length > 0 ? (
          <div className="flex items-center gap-2">
            <Languages className="size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Langues parlées</dt>
            <dd className="truncate">{candidate.languages.join(", ")}</dd>
          </div>
        ) : null}
      </dl>

      {visibleSpecialties.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5" aria-label="Compétences">
          {visibleSpecialties.map((label) => (
            <li key={label}>
              <Badge variant="secondary">{label}</Badge>
            </li>
          ))}
          {extraSpecialties > 0 ? (
            <li>
              <Badge
                variant="outline"
                aria-label={`${extraSpecialties} autres compétences`}
              >
                +{extraSpecialties}
              </Badge>
            </li>
          ) : null}
        </ul>
      ) : null}

      {candidate.bio ? (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {candidate.bio}
        </p>
      ) : null}

      {availabilityLabels.length > 0 ? (
        <p className="flex items-start gap-2 text-sm">
          <CalendarDays
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span>
            <span className="font-medium">Disponible :</span>{" "}
            {availabilityLabels.join(" · ")}
          </span>
        </p>
      ) : null}

      <div className="mt-auto pt-1">
        <InviteCandidateDialog
          candidateUserId={candidate.user_id ?? ""}
          candidateFirstName={candidate.first_name ?? "ce remplaçant"}
          jobPosts={jobPosts}
        />
      </div>
    </article>
  );
}
