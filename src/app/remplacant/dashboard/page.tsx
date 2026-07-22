import Link from "next/link";
import {
  AlertTriangle,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  FileWarning,
  Megaphone,
  Search,
  Send,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ProfileCompletion } from "@/components/shared/profile-completion";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { requiredDocumentsComplete } from "@/lib/business-rules";
import {
  AVAILABILITY_TYPES,
  WORKING_DAYS,
  documentTypesForStatus,
  type ProfessionalStatus,
} from "@/lib/data/reference";
import {
  formatDateFr,
  formatDateRange,
  labelFor,
} from "@/components/job-posts/format";

export const metadata = { title: "Vue d'ensemble" };

/** Libellé lisible d'une disponibilité. */
function availabilityLabel(a: {
  type: string;
  start_date: string | null;
  end_date: string | null;
  recurring_days: string[];
}): string {
  if (a.type === "recurrent") {
    const days = a.recurring_days
      .map((d) => labelFor(WORKING_DAYS, d) ?? d)
      .join(", ");
    return days ? `Chaque ${days.toLowerCase()}` : "Jours récurrents";
  }
  return (
    formatDateRange(a.start_date, a.end_date) ??
    labelFor(AVAILABILITY_TYPES, a.type) ??
    "Disponibilité"
  );
}

export default async function ReplacementDashboardPage() {
  const profile = await requireRole("replacement_dentist");
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [recentPostsRes, applicationsRes, placementsRes, rpRes, docsRes, availRes] =
    await Promise.all([
      supabase
        .from("job_posts")
        .select(
          "id, title, city, territory, start_date, end_date, urgent, cabinet_profiles(name), specialties!job_posts_specialty_id_fkey(code, label)",
        )
        .eq("status", "published")
        .or(`application_deadline.is.null,application_deadline.gte.${today}`)
        .order("published_at", { ascending: false })
        .limit(5),
      supabase
        .from("applications")
        .select("id, status")
        .eq("applicant_user_id", profile.id)
        .in("status", ["submitted", "viewed", "shortlisted", "accepted"]),
      supabase
        .from("placements")
        .select("id, start_date, end_date, job_posts(title), cabinet_profiles(name)")
        .eq("replacement_user_id", profile.id)
        .eq("status", "confirmed")
        .gte("start_date", today)
        .order("start_date", { ascending: true }),
      supabase
        .from("replacement_profiles")
        .select("profile_completion, professional_status")
        .eq("user_id", profile.id)
        .maybeSingle(),
      supabase
        .from("documents")
        .select("document_type, status")
        .eq("owner_user_id", profile.id),
      supabase
        .from("availabilities")
        .select("id, type, start_date, end_date, recurring_days, notes")
        .eq("user_id", profile.id)
        .or(`type.eq.recurrent,end_date.gte.${today}`)
        .order("start_date", { ascending: true, nullsFirst: false })
        .limit(3),
    ]);

  if (recentPostsRes.error || applicationsRes.error || placementsRes.error) {
    return <ErrorState />;
  }

  const recentPosts = recentPostsRes.data ?? [];
  const applications = applicationsRes.data ?? [];
  const pendingApplications = applications.filter((a) =>
    ["submitted", "viewed", "shortlisted"].includes(a.status),
  );
  const acceptedApplications = applications.filter(
    (a) => a.status === "accepted",
  );
  const upcomingPlacements = placementsRes.data ?? [];
  const rp = rpRes.data;
  const documents = docsRes.data ?? [];
  const availabilities = availRes.data ?? [];

  const professionalStatus: ProfessionalStatus =
    rp?.professional_status ?? "qualified_dentist";
  const hasRejectedDocument = documents.some((d) => d.status === "rejected");
  const docsComplete = requiredDocumentsComplete(
    documentTypesForStatus(professionalStatus),
    documents,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vue d'ensemble"
        title={`Bonjour, ${profile.first_name}`}
        description="Voici un aperçu de votre activité de remplacement."
        action={
          <Button asChild>
            <Link href="/remplacant/annonces">
              <Search aria-hidden />
              Voir les annonces
            </Link>
          </Button>
        }
      />

      {hasRejectedDocument || !docsComplete ? (
        <Alert variant="destructive" className="border-destructive/40">
          <FileWarning aria-hidden />
          <AlertTitle>
            {hasRejectedDocument
              ? "Un de vos documents a été refusé"
              : "Des documents obligatoires sont manquants"}
          </AlertTitle>
          <AlertDescription>
            <p>
              {hasRejectedDocument
                ? "Remplacez le document refusé pour maintenir votre profil à jour."
                : "Complétez vos documents obligatoires pour finaliser la vérification de votre profil."}
            </p>
            <Link
              href="/remplacant/documents"
              className="font-medium underline underline-offset-4"
            >
              Gérer mes documents
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      <div
        className="animate-rise grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        style={{ "--d": "40ms" } as React.CSSProperties}
      >
        <StatCard
          label="Candidatures en attente"
          value={pendingApplications.length}
          icon={Send}
          tone="amber"
          href="/remplacant/candidatures"
        />
        <StatCard
          label="Acceptées"
          value={acceptedApplications.length}
          icon={CheckCircle2}
          tone="teal"
          href="/remplacant/candidatures"
        />
        <StatCard
          label="Remplacements à venir"
          value={upcomingPlacements.length}
          icon={CalendarCheck}
          tone="primary"
          href="/remplacant/remplacements"
        />
        <StatCard
          label="Créneaux disponibles"
          value={availabilities.length}
          icon={CalendarDays}
          tone="slate"
          href="/remplacant/disponibilites"
        />
      </div>

      <Card
        className="animate-rise"
        style={{ "--d": "100ms" } as React.CSSProperties}
      >
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="eyebrow">Mon profil</p>
              <VerificationBadge status={profile.verification_status} />
            </div>
            <ProfileCompletion value={rp?.profile_completion ?? 0} />
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/remplacant/profil">Voir mon profil</Link>
          </Button>
        </CardContent>
      </Card>

      {upcomingPlacements.length > 0 ? (
        <Card
          className="animate-rise relative overflow-hidden"
          style={{ "--d": "140ms" } as React.CSSProperties}
        >
          <span
            className="absolute inset-x-0 top-0 h-1 bg-primary"
            aria-hidden
          />
          <CardHeader>
            <p className="eyebrow mb-1">Agenda</p>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarCheck className="size-4 text-primary" aria-hidden />
              Prochains remplacements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {upcomingPlacements.slice(0, 3).map((p) => (
                <li key={p.id}>
                  <Link
                    href="/remplacant/remplacements"
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3.5 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {p.job_posts?.title ?? "Remplacement"}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {p.cabinet_profiles?.name}
                      </p>
                    </div>
                    {p.start_date ? (
                      <span className="font-data shrink-0 text-xs text-muted-foreground">
                        à partir du {formatDateFr(p.start_date)}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <div
        className="animate-rise grid gap-6 lg:grid-cols-2"
        style={{ "--d": "180ms" } as React.CSSProperties}
      >
        <Card>
          <CardHeader>
            <p className="eyebrow mb-1">Disponibilités</p>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="size-4 text-primary" aria-hidden />
              Prochains créneaux disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availabilities.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Aucune disponibilité déclarée"
                description="Ajoutez vos créneaux pour aider les cabinets à vous trouver."
                action={
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/remplacant/disponibilites">
                      Ajouter une disponibilité
                    </Link>
                  </Button>
                }
                className="py-10"
              />
            ) : (
              <ul className="divide-y">
                {availabilities.map((a) => (
                  <li key={a.id} className="py-3.5 first:pt-0 last:pb-0">
                    <p className="font-medium">{availabilityLabel(a)}</p>
                    {a.notes ? (
                      <p className="text-sm text-muted-foreground">{a.notes}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="eyebrow mb-1">Opportunités</p>
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="size-4 text-primary" aria-hidden />
              Annonces récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="Aucune annonce publiée"
                description="Les nouvelles annonces publiées par les cabinets apparaîtront ici."
                className="py-10"
              />
            ) : (
              <ul className="divide-y">
                {recentPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/remplacant/annonces/${post.id}`}
                      className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3.5 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{post.title}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {post.cabinet_profiles?.name}
                          {post.city ? ` — ${post.city}` : null}
                          {post.start_date
                            ? ` — début le ${formatDateFr(post.start_date)}`
                            : null}
                        </p>
                      </div>
                      <span className="flex shrink-0 items-center gap-1.5">
                        {post.specialties ? (
                          <Badge
                            variant="secondary"
                            className="hidden sm:inline-flex"
                          >
                            {post.specialties.label}
                          </Badge>
                        ) : null}
                        {post.urgent ? (
                          <Badge
                            variant="outline"
                            className="border-destructive/25 bg-destructive/10 font-medium text-destructive"
                          >
                            Urgent
                          </Badge>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {profile.verification_status === "rejected" ? (
        <Alert variant="destructive" className="border-destructive/40">
          <AlertTriangle aria-hidden />
          <AlertTitle>Vérification refusée</AlertTitle>
          <AlertDescription>
            Vérifiez vos documents et vos informations déclarées, puis
            soumettez-les à nouveau.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
