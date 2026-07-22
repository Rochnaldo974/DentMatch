import Link from "next/link";
import { Info, Search, UserSearch } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import {
  CandidateCard,
  type CandidateAvailability,
} from "@/components/cabinet/candidate-card";
import type { InvitableJobPost } from "@/components/cabinet/invite-candidate-dialog";
import {
  PROFESSIONAL_STATUSES,
  PROFESSIONAL_STATUS_LABELS,
  REUNION_COMMUNES,
  type ProfessionalStatus,
} from "@/lib/data/reference";

export const metadata = { title: "Trouver un remplaçant" };

/** Nombre maximal de profils affichés. */
const MAX_RESULTS = 30;
/** Nombre maximal de disponibilités affichées par profil. */
const MAX_AVAILABILITIES = 2;

const selectClass =
  "h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export default async function CabinetCandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; statut?: string; ville?: string }>;
}) {
  const params = await searchParams;
  const profile = await requireRole("cabinet");
  const supabase = await createClient();

  const q = params.q?.trim() || undefined;
  const statut = PROFESSIONAL_STATUSES.includes(
    params.statut as ProfessionalStatus,
  )
    ? (params.statut as ProfessionalStatus)
    : undefined;
  const ville = params.ville?.trim() || undefined;
  const hasFilters = Boolean(q || statut || ville);

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

  let candidatesQuery = supabase
    .from("public_candidate_profiles")
    .select("*");

  if (q) {
    const sanitized = q.replace(/[,()%]/g, " ").trim();
    if (sanitized) {
      candidatesQuery = candidatesQuery.or(
        `first_name.ilike.%${sanitized}%,city.ilike.%${sanitized}%`,
      );
    }
  }
  if (statut) candidatesQuery = candidatesQuery.eq("professional_status", statut);
  if (ville) candidatesQuery = candidatesQuery.eq("city", ville);

  const [candidatesRes, jobPostsRes] = await Promise.all([
    candidatesQuery
      .order("experience_years", { ascending: false, nullsFirst: false })
      .limit(MAX_RESULTS),
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

  const candidates = candidatesRes.data ?? [];
  const jobPosts: InvitableJobPost[] = jobPostsRes.data ?? [];
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Trouver un remplaçant
        </h1>
        <p className="text-sm text-muted-foreground">
          Parcourez les profils publics des remplaçants et invitez-les à
          candidater à vos annonces.
        </p>
      </div>

      {jobPosts.length === 0 ? (
        <Alert>
          <Info className="size-4" aria-hidden="true" />
          <AlertTitle>
            Publiez une annonce pour pouvoir inviter des remplaçants
          </AlertTitle>
          <AlertDescription>
            Les invitations sont rattachées à une annonce publiée.{" "}
            <Link
              href="/cabinet/annonces/nouvelle"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Créer une annonce
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Filtres server-first : le formulaire GET recharge la page. */}
      <form
        method="GET"
        action="/cabinet/remplacants"
        className="rounded-xl border bg-card p-4"
      >
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_200px_auto]">
          <div className="relative">
            <Label htmlFor="recherche-remplacant" className="sr-only">
              Rechercher par prénom ou ville
            </Label>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="recherche-remplacant"
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Prénom, ville…"
              className="pl-9"
            />
          </div>

          <div>
            <Label htmlFor="filtre-statut" className="sr-only">
              Statut professionnel
            </Label>
            <select
              id="filtre-statut"
              name="statut"
              defaultValue={statut ?? ""}
              className={selectClass}
            >
              <option value="">Tous les statuts</option>
              {PROFESSIONAL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {PROFESSIONAL_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="filtre-ville" className="sr-only">
              Ville
            </Label>
            <select
              id="filtre-ville"
              name="ville"
              defaultValue={ville ?? ""}
              className={selectClass}
            >
              <option value="">Toutes les villes</option>
              {REUNION_COMMUNES.map((commune) => (
                <option key={commune} value={commune}>
                  {commune}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" className="flex-1 md:flex-none">
              Filtrer
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
        <EmptyState
          icon={UserSearch}
          title="Aucun remplaçant ne correspond à ces critères"
          description="Essayez d'élargir votre recherche ou de réinitialiser les filtres."
          action={
            hasFilters ? (
              <Button variant="outline" asChild>
                <Link href="/cabinet/remplacants">Réinitialiser les filtres</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {candidates.length === 1
              ? "1 profil trouvé"
              : `${candidates.length} profils trouvés`}
            {candidates.length === MAX_RESULTS
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
