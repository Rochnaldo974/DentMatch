import Link from "next/link";
import { Bookmark, Building2, CalendarDays, Home, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CONTRACT_TYPES,
  STRUCTURE_TYPES,
  OVERSEAS_TERRITORIES,
} from "@/lib/data/reference";
import {
  formatCompensation,
  formatDateRange,
  labelFor,
} from "@/components/job-posts/format";

export type JobPostCardData = {
  id: string;
  title: string;
  city: string | null;
  territory: string | null;
  start_date: string | null;
  end_date: string | null;
  urgent: boolean;
  contract_type: string | null;
  accommodation_provided: boolean;
  compensation_type: string | null;
  compensation_value: number | null;
  compensation_details: string | null;
  cabinet_profiles: {
    name: string;
    structure_type: string | null;
  } | null;
  specialties: {
    code: string;
    label: string;
    is_specialized: boolean;
  } | null;
};

/**
 * Carte d'annonce côté recherche remplaçant (Server Component).
 * Lien vers la page de détail /remplacant/annonces/[id].
 */
export function JobPostCard({
  post,
  applied = false,
  saved = false,
}: {
  post: JobPostCardData;
  applied?: boolean;
  saved?: boolean;
}) {
  const dates = formatDateRange(post.start_date, post.end_date);
  const compensation = formatCompensation(post);
  const contractLabel = labelFor(CONTRACT_TYPES, post.contract_type);
  const structureLabel = labelFor(
    STRUCTURE_TYPES,
    post.cabinet_profiles?.structure_type,
  );
  const isOverseas =
    post.territory != null &&
    (OVERSEAS_TERRITORIES as readonly string[]).includes(post.territory);

  return (
    <Link
      href={`/remplacant/annonces/${post.id}`}
      className="group flex h-full flex-col rounded-xl border bg-card p-5 transition-shadow duration-200 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug group-hover:text-primary">
          {post.title}
        </h3>
        <span className="flex shrink-0 items-center gap-1.5">
          {saved ? (
            <Bookmark
              className="size-4 fill-primary text-primary"
              aria-label="Annonce enregistrée"
            />
          ) : null}
          {post.urgent ? (
            <Badge className="border-destructive/25 bg-destructive/10 font-medium text-destructive" variant="outline">
              Urgent
            </Badge>
          ) : null}
        </span>
      </div>

      {post.cabinet_profiles ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {post.cabinet_profiles.name}
            {structureLabel ? ` · ${structureLabel}` : ""}
          </span>
        </p>
      ) : null}

      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">
          {post.city ?? "Ville non précisée"}
          {post.territory && post.territory !== "France métropolitaine"
            ? ` · ${post.territory}`
            : ""}
        </span>
        {isOverseas ? (
          <Badge variant="secondary" className="shrink-0">
            Outre-mer
          </Badge>
        ) : null}
      </p>

      {dates ? (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
          {dates}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {post.specialties ? (
          <Badge variant="secondary">{post.specialties.label}</Badge>
        ) : null}
        {contractLabel ? <Badge variant="outline">{contractLabel}</Badge> : null}
        {post.accommodation_provided ? (
          <Badge variant="outline" className="gap-1">
            <Home className="size-3" aria-hidden="true" />
            Hébergement
          </Badge>
        ) : null}
        {applied ? (
          <Badge
            variant="outline"
            className="border-verified/25 bg-verified-soft font-medium text-accent-foreground"
          >
            Déjà candidaté
          </Badge>
        ) : null}
      </div>

      {compensation ? (
        <p className="mt-auto pt-3 text-sm font-medium">{compensation}</p>
      ) : (
        <span className="mt-auto" />
      )}
    </Link>
  );
}
