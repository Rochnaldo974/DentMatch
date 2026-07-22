import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarSearch, Info, UserSearch } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  CandidateCard,
  type CandidateAvailability,
} from "@/components/cabinet/candidate-card";
import type { InvitableJobPost } from "@/components/cabinet/invite-candidate-dialog";
import {
  PROFESSIONAL_STATUSES,
  PROFESSIONAL_STATUS_LABELS,
  REUNION_ZONES,
  type ProfessionalStatus,
} from "@/lib/data/reference";

export const metadata = { title: "Trouver un remplaçant" };

/** Nombre maximal de profils affichés. */
const MAX_RESULTS = 30;
/** Taille du vivier chargé avant filtrage en mémoire (secteur / dates). */
const POOL_SIZE = 200;
/** Nombre maximal de disponibilités affichées par profil. */
const MAX_AVAILABILITIES = 2;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const selectClass =
  "h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/**
 * Commune → zone de mobilité, reprenant les groupes de REUNION_ZONES.
 * Utilisé en secours quand un candidat n'a déclaré aucune zone de mobilité.
 */
const COMMUNE_ZONE: Record<string, string> = {
  "Saint-Denis": "nord",
  "Sainte-Marie": "nord",
  "Sainte-Suzanne": "nord",
  "Saint-André": "est",
  "Bras-Panon": "est",
  "Saint-Benoît": "est",
  "Sainte-Rose": "est",
  "Saint-Paul": "ouest",
  "Le Port": "ouest",
  "La Possession": "ouest",
  "Saint-Leu": "ouest",
  "Trois-Bassins": "ouest",
  "Les Avirons": "ouest",
  "L'Étang-Salé": "ouest",
  "Saint-Pierre": "sud",
  "Le Tampon": "sud",
  "Saint-Joseph": "sud",
  "Saint-Louis": "sud",
  "Saint-Philippe": "sud",
  "Petite-Île": "sud",
  "Entre-Deux": "sud",
  Cilaos: "hauts",
  Salazie: "hauts",
  "La Plaine-des-Palmistes": "hauts",
};

/** Nom court d'une zone (« Nord », « Les Hauts et cirques »…). */
function zoneShortLabel(code: string): string {
  const label = REUNION_ZONES.find((z) => z.value === code)?.label ?? code;
  return label.split(" (")[0];
}

/** « 3 août » ou « 3 août 2027 » si l'année diffère de l'année en cours. */
function formatDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  const pattern =
    d.getFullYear() === new Date().getFullYear() ? "d MMMM" : "d MMMM yyyy";
  return format(d, pattern, { locale: fr });
}

/** « du 3 au 20 août » / « du 28 juillet au 3 août »… */
function formatRange(debut: string, fin: string): string {
  const d = new Date(`${debut}T00:00:00`);
  const f = new Date(`${fin}T00:00:00`);
  const sameMonth =
    d.getMonth() === f.getMonth() && d.getFullYear() === f.getFullYear();
  const debutLabel = sameMonth
    ? format(d, "d", { locale: fr })
    : formatDay(debut);
  return `du ${debutLabel} au ${formatDay(fin)}`;
}

type AvailabilityWindow = {
  type: string;
  start_date: string | null;
  end_date: string | null;
};

/**
 * Une disponibilité recouvre-t-elle l'intervalle demandé ?
 * Les jours récurrents matchent toujours ; comparaison ISO (lexicographique).
 */
function coversInterval(
  a: AvailabilityWindow,
  debut: string | undefined,
  fin: string | undefined,
): boolean {
  if (a.type === "recurrent") return true;
  const start = a.start_date;
  const end = a.end_date ?? a.start_date;
  if (debut && fin) {
    return start !== null && end !== null && start <= fin && end >= debut;
  }
  if (debut) return end !== null && end >= debut;
  if (fin) return start !== null && start <= fin;
  return true;
}

export default async function CabinetCandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{
    secteur?: string;
    statut?: string;
    debut?: string;
    fin?: string;
  }>;
}) {
  const params = await searchParams;
  const profile = await requireRole("cabinet");
  const supabase = await createClient();

  const secteur = REUNION_ZONES.some((z) => z.value === params.secteur)
    ? params.secteur
    : undefined;
  const statut = PROFESSIONAL_STATUSES.includes(
    params.statut as ProfessionalStatus,
  )
    ? (params.statut as ProfessionalStatus)
    : undefined;
  let debut =
    params.debut && DATE_RE.test(params.debut) ? params.debut : undefined;
  let fin = params.fin && DATE_RE.test(params.fin) ? params.fin : undefined;
  // Bornes inversées : on les remet dans l'ordre plutôt que d'échouer.
  if (debut && fin && fin < debut) [debut, fin] = [fin, debut];

  const hasFilters = Boolean(secteur || statut || debut || fin);
  const hasDateFilter = Boolean(debut || fin);

  const { data: cabinet } = await supabase
    .from("cabinet_profiles")
    .select("id")
    .eq("user_id", profile.id)
    .single();

  if (!cabinet) {
    return (
      <ErrorState
        title="Profil cabinet introuvable"
        description="Terminez votre onboarding pour parcourir les profils des remplaçants."
      />
    );
  }

  let candidatesQuery = supabase.from("public_candidate_profiles").select("*");
  if (statut) candidatesQuery = candidatesQuery.eq("professional_status", statut);

  const [candidatesRes, jobPostsRes] = await Promise.all([
    candidatesQuery
      .order("experience_years", { ascending: false, nullsFirst: false })
      .limit(POOL_SIZE),
    supabase
      .from("job_posts")
      .select("id, title, city, start_date, end_date")
      .eq("cabinet_id", cabinet.id)
      .eq("status", "published")
      .order("published_at", { ascending: false }),
  ]);

  if (candidatesRes.error || jobPostsRes.error) {
    return <ErrorState />;
  }

  let candidates = candidatesRes.data ?? [];
  const jobPosts: InvitableJobPost[] = jobPostsRes.data ?? [];
  const allUserIds = candidates
    .map((c) => c.user_id)
    .filter((id): id is string => Boolean(id));

  // Correspondance secteur / dates : petites requêtes ciblées puis filtrage en JS.
  const [mobilityRes, windowsRes] = await Promise.all([
    secteur && allUserIds.length > 0
      ? supabase
          .from("mobility_areas")
          .select("user_id, area_value")
          .eq("area_type", "region")
          .in("user_id", allUserIds)
      : Promise.resolve({ data: [], error: null }),
    hasDateFilter && allUserIds.length > 0
      ? supabase
          .from("availabilities")
          .select("user_id, type, start_date, end_date")
          .eq("available", true)
          .in("user_id", allUserIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (mobilityRes.error || windowsRes.error) {
    return <ErrorState />;
  }

  if (secteur) {
    const zonesByUser = new Map<string, Set<string>>();
    for (const row of mobilityRes.data ?? []) {
      const set = zonesByUser.get(row.user_id) ?? new Set<string>();
      set.add(row.area_value);
      zonesByUser.set(row.user_id, set);
    }
    candidates = candidates.filter((c) => {
      if (c.national_mobility) return true;
      const zones = c.user_id ? zonesByUser.get(c.user_id) : undefined;
      if (zones && zones.size > 0) return zones.has(secteur);
      // Aucune zone déclarée : on se rabat sur la commune du profil.
      return c.city ? COMMUNE_ZONE[c.city] === secteur : false;
    });
  }

  if (hasDateFilter) {
    const windowsByUser = new Map<string, AvailabilityWindow[]>();
    for (const row of windowsRes.data ?? []) {
      const list = windowsByUser.get(row.user_id) ?? [];
      list.push(row);
      windowsByUser.set(row.user_id, list);
    }
    candidates = candidates.filter((c) => {
      const windows = c.user_id ? (windowsByUser.get(c.user_id) ?? []) : [];
      return windows.some((w) => coversInterval(w, debut, fin));
    });
  }

  const totalMatches = candidates.length;
  candidates = candidates.slice(0, MAX_RESULTS);
  const userIds = candidates
    .map((c) => c.user_id)
    .filter((id): id is string => Boolean(id));

  // Enrichissement : compétences et prochaines disponibilités des profils.
  const today = new Date().toISOString().slice(0, 10);
  const [specialtiesRes, availabilitiesRes] =
    userIds.length > 0
      ? await Promise.all([
          supabase
            .from("profile_specialties")
            .select("user_id, specialties(label)")
            .in("user_id", userIds),
          supabase
            .from("availabilities")
            .select("user_id, type, start_date, end_date, recurring_days")
            .in("user_id", userIds)
            .eq("available", true)
            .or(`start_date.gte.${today},type.eq.recurrent`)
            .order("start_date", { ascending: true, nullsFirst: false }),
        ])
      : [{ data: [] }, { data: [] }];

  const specialtiesByUser = new Map<string, string[]>();
  for (const row of specialtiesRes.data ?? []) {
    const label = row.specialties?.label;
    if (!label) continue;
    const list = specialtiesByUser.get(row.user_id) ?? [];
    list.push(label);
    specialtiesByUser.set(row.user_id, list);
  }

  const availabilitiesByUser = new Map<string, CandidateAvailability[]>();
  for (const row of availabilitiesRes.data ?? []) {
    const list = availabilitiesByUser.get(row.user_id) ?? [];
    if (list.length < MAX_AVAILABILITIES) {
      list.push(row);
      availabilitiesByUser.set(row.user_id, list);
    }
  }

  // Titre du CTA « aucun résultat » reprenant les critères actifs.
  let emptyTitle = "Aucun remplaçant disponible";
  if (secteur) emptyTitle += ` dans le secteur ${zoneShortLabel(secteur)}`;
  if (debut && fin) emptyTitle += ` ${formatRange(debut, fin)}`;
  else if (debut) emptyTitle += ` à partir du ${formatDay(debut)}`;
  else if (fin) emptyTitle += ` jusqu'au ${formatDay(fin)}`;

  const publishParams = new URLSearchParams();
  if (debut) publishParams.set("debut", debut);
  if (fin) publishParams.set("fin", fin);
  const publishHref = `/cabinet/annonces/nouvelle${
    publishParams.toString() ? `?${publishParams.toString()}` : ""
  }`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Recherche"
        title="Trouver un remplaçant"
        description="Parcourez les profils publics des remplaçants et invitez-les à candidater à vos annonces."
      />

      {jobPosts.length === 0 ? (
        <Alert>
          <Info className="size-4" aria-hidden="true" />
          <AlertTitle>Vous n&apos;avez pas encore d&apos;annonce publiée</AlertTitle>
          <AlertDescription>
            Vous pouvez quand même inviter un remplaçant : nous vous guiderons
            pour créer l&apos;annonce, et l&apos;invitation partira
            automatiquement à sa publication.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Filtres server-first : le formulaire GET recharge la page. */}
      <form
        method="GET"
        action="/cabinet/remplacants"
        className="rounded-xl border bg-card p-4"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] xl:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="filtre-secteur">Secteur</Label>
            <select
              id="filtre-secteur"
              name="secteur"
              defaultValue={secteur ?? ""}
              className={selectClass}
            >
              <option value="">Toute l&apos;île</option>
              {REUNION_ZONES.map((zone) => (
                <option key={zone.value} value={zone.value}>
                  {zone.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="filtre-statut">Statut</Label>
            <select
              id="filtre-statut"
              name="statut"
              defaultValue={statut ?? ""}
              className={selectClass}
            >
              <option value="">Tous</option>
              {PROFESSIONAL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {PROFESSIONAL_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="min-w-0 sm:col-span-2 xl:col-span-1">
            <legend className="pb-1.5 text-sm leading-none font-medium">
              Dates du remplacement
            </legend>
            <div className="flex flex-wrap items-center gap-2">
              <Label
                htmlFor="filtre-debut"
                className="font-normal text-muted-foreground"
              >
                Du
              </Label>
              <Input
                id="filtre-debut"
                type="date"
                name="debut"
                defaultValue={debut}
                aria-label="Date de début du remplacement"
                className="w-auto min-w-0 flex-1 sm:flex-none"
              />
              <Label
                htmlFor="filtre-fin"
                className="font-normal text-muted-foreground"
              >
                Au
              </Label>
              <Input
                id="filtre-fin"
                type="date"
                name="fin"
                defaultValue={fin}
                aria-label="Date de fin du remplacement"
                className="w-auto min-w-0 flex-1 sm:flex-none"
              />
            </div>
          </fieldset>

          <div className="flex items-center gap-3 sm:col-span-2 xl:col-span-1">
            <Button type="submit" className="flex-1 xl:flex-none">
              Rechercher
            </Button>
            {hasFilters ? (
              <Link
                href="/cabinet/remplacants"
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Réinitialiser
              </Link>
            ) : null}
          </div>
        </div>
      </form>

      {candidates.length === 0 ? (
        hasFilters ? (
          <section
            aria-label="Aucun résultat"
            className="rounded-xl border bg-card px-6 py-12 text-center sm:py-16"
          >
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
              <CalendarSearch
                className="size-7 text-primary"
                aria-hidden="true"
              />
            </div>
            <h2 className="mx-auto mt-5 max-w-xl text-xl font-semibold tracking-tight">
              {emptyTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Publiez votre annonce dès maintenant : elle sera visible par tous
              les remplaçants et les nouveaux inscrits pourront candidater
              directement.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href={publishHref}>
                  {hasDateFilter
                    ? "Publier une annonce pour ces dates"
                    : "Publier une annonce"}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/cabinet/remplacants">
                  Réinitialiser la recherche
                </Link>
              </Button>
            </div>
          </section>
        ) : (
          <EmptyState
            icon={UserSearch}
            title="Aucun profil de remplaçant pour le moment"
            description="Les remplaçants inscrits apparaîtront ici dès qu'ils auront complété leur profil."
          />
        )
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {candidates.length === 1
              ? "1 profil trouvé"
              : `${candidates.length} profils trouvés`}
            {totalMatches > candidates.length
              ? " (affinez vos filtres pour préciser la recherche)"
              : null}
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.user_id}
                candidate={candidate}
                specialties={
                  candidate.user_id
                    ? (specialtiesByUser.get(candidate.user_id) ?? [])
                    : []
                }
                availabilities={
                  candidate.user_id
                    ? (availabilitiesByUser.get(candidate.user_id) ?? [])
                    : []
                }
                jobPosts={jobPosts}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
