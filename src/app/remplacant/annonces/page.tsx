import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import {
  JobPostCard,
  type JobPostCardData,
} from "@/components/job-posts/job-post-card";
import {
  JobPostFiltersForm,
  JobPostSortSelect,
  MobileJobPostFilters,
  type JobPostFilterValues,
} from "@/components/job-posts/filters";

export const metadata = { title: "Rechercher une annonce" };

const PAGE_SIZE = 12;

const FILTER_KEYS = [
  "q",
  "territoire",
  "region",
  "departement",
  "debut",
  "fin",
  "specialite",
  "type_structure",
  "contrat",
  "type",
  "temps",
  "hebergement",
  "urgent",
  "tri",
] as const;

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v?.trim() ? v.trim() : undefined;
}

/** Reconstruit la query string en conservant les filtres actifs. */
function buildQuery(
  values: JobPostFilterValues,
  page?: number,
): string {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const v = values[key];
    if (v) params.set(key, v);
  }
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export default async function ReplacementJobPostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const profile = await requireRole("replacement_dentist");
  const params = await searchParams;
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const values: JobPostFilterValues = Object.fromEntries(
    FILTER_KEYS.map((k) => [k, first(params[k])]).filter(([, v]) => v),
  );
  const page = Math.max(1, Number(first(params.page)) || 1);

  // Résolution du code de spécialité vers son identifiant.
  let specialtyId: string | undefined;
  if (values.specialite) {
    const { data: specialty } = await supabase
      .from("specialties")
      .select("id")
      .eq("code", values.specialite)
      .maybeSingle();
    specialtyId = specialty?.id;
  }

  let query = supabase
    .from("job_posts")
    .select(
      "id, title, city, territory, start_date, end_date, urgent, contract_type, accommodation_provided, compensation_type, compensation_value, compensation_details, cabinet_profiles!inner(name, structure_type), specialties!job_posts_specialty_id_fkey(code, label, is_specialized)",
      { count: "exact" },
    )
    .eq("status", "published")
    // Les annonces dont la date limite de candidature est dépassée
    // n'apparaissent plus dans la recherche des candidats.
    .or(`application_deadline.is.null,application_deadline.gte.${today}`);

  if (values.q) {
    const q = values.q.replace(/[,()%]/g, " ").trim();
    if (q) {
      query = query.or(
        `title.ilike.%${q}%,city.ilike.%${q}%,description.ilike.%${q}%`,
      );
    }
  }
  if (values.territoire) query = query.eq("territory", values.territoire);
  if (values.region) query = query.eq("region", values.region);
  if (values.departement) query = query.eq("department", values.departement);
  if (values.debut) query = query.gte("start_date", values.debut);
  if (values.fin) query = query.lte("end_date", values.fin);
  if (values.specialite) {
    // Code inconnu : aucun résultat plutôt qu'un filtre ignoré.
    query = query.eq("specialty_id", specialtyId ?? "00000000-0000-0000-0000-000000000000");
  }
  if (values.type_structure) {
    query = query.eq("cabinet_profiles.structure_type", values.type_structure);
  }
  if (values.contrat) query = query.eq("contract_type", values.contrat);
  if (values.type) query = query.eq("replacement_type", values.type);
  if (values.temps === "plein") query = query.eq("full_time", true);
  if (values.temps === "partiel") query = query.eq("full_time", false);
  if (values.hebergement === "1") query = query.eq("accommodation_provided", true);
  if (values.urgent === "1") query = query.eq("urgent", true);

  const tri = values.tri ?? "recent";
  if (tri === "debut") {
    query = query.order("start_date", { ascending: true, nullsFirst: false });
  } else if (tri === "remuneration") {
    query = query.order("compensation_value", {
      ascending: false,
      nullsFirst: false,
    });
  } else {
    query = query.order("published_at", { ascending: false });
  }

  const from = (page - 1) * PAGE_SIZE;
  const [postsRes, appsRes, savedRes] = await Promise.all([
    query.range(from, from + PAGE_SIZE - 1),
    supabase
      .from("applications")
      .select("job_post_id, status")
      .eq("applicant_user_id", profile.id)
      .neq("status", "withdrawn"),
    supabase
      .from("saved_job_posts")
      .select("job_post_id")
      .eq("user_id", profile.id),
  ]);

  if (postsRes.error) {
    return <ErrorState />;
  }

  const posts = (postsRes.data ?? []) as unknown as JobPostCardData[];
  const total = postsRes.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const appliedIds = new Set((appsRes.data ?? []).map((a) => a.job_post_id));
  const savedIds = new Set((savedRes.data ?? []).map((s) => s.job_post_id));

  const activeFilterCount = FILTER_KEYS.filter(
    (k) => k !== "q" && k !== "tri" && values[k],
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Rechercher une annonce
        </h1>
        <p className="text-sm text-muted-foreground">
          Trouvez le remplacement qui correspond à vos disponibilités et à
          votre mobilité.
        </p>
      </div>

      {/* Barre de recherche — conserve les filtres actifs. */}
      <form method="GET" action="/remplacant/annonces" className="flex gap-2">
        {FILTER_KEYS.filter((k) => k !== "q" && values[k]).map((k) => (
          <input key={k} type="hidden" name={k} value={values[k]} />
        ))}
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            name="q"
            defaultValue={values.q}
            placeholder="Titre, ville, mot-clé…"
            aria-label="Rechercher une annonce"
            className="pl-9"
          />
        </div>
        <Button type="submit">Rechercher</Button>
      </form>

      <div className="flex gap-8">
        {/* Filtres desktop */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold">Filtres</h2>
            <JobPostFiltersForm values={values} />
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <MobileJobPostFilters values={values} />
              <p className="text-sm text-muted-foreground">
                {total === 0
                  ? "Aucune annonce"
                  : total === 1
                    ? "1 annonce"
                    : `${total} annonces`}
                {activeFilterCount > 0
                  ? ` · ${activeFilterCount} filtre${activeFilterCount > 1 ? "s" : ""} actif${activeFilterCount > 1 ? "s" : ""}`
                  : null}
              </p>
            </div>
            <JobPostSortSelect value={tri} />
          </div>

          {posts.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Aucune annonce ne correspond à votre recherche"
              description="Essayez d'élargir vos critères ou de réinitialiser les filtres."
              action={
                <Button variant="outline" asChild>
                  <Link href="/remplacant/annonces">
                    Réinitialiser la recherche
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {posts.map((post) => (
                <JobPostCard
                  key={post.id}
                  post={post}
                  applied={appliedIds.has(post.id)}
                  saved={savedIds.has(post.id)}
                />
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <nav
              className="flex items-center justify-between gap-3 pt-2"
              aria-label="Pagination des annonces"
            >
              {page > 1 ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/remplacant/annonces${buildQuery(values, page - 1)}`}>
                    Précédent
                  </Link>
                </Button>
              ) : (
                <span />
              )}
              <p className="text-sm text-muted-foreground">
                Page {page} sur {totalPages}
              </p>
              {page < totalPages ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/remplacant/annonces${buildQuery(values, page + 1)}`}>
                    Suivant
                  </Link>
                </Button>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
