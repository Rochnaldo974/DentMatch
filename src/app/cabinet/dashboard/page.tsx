import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarCheck,
  CalendarClock,
  Inbox,
  Megaphone,
  MessageSquare,
  Plus,
  UserCheck,
  Users,
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
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ApplicationStatusBadge } from "@/components/shared/status-badge";
import { ProfileCompletion } from "@/components/shared/profile-completion";

export const metadata = { title: "Vue d'ensemble" };

function StatCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
    </Link>
  );
}

export default async function CabinetDashboardPage() {
  const profile = await requireRole("cabinet");
  const supabase = await createClient();

  const { data: cabinet } = await supabase
    .from("cabinet_profiles")
    .select("id, name, profile_completion")
    .eq("user_id", profile.id)
    .single();

  if (!cabinet) {
    return (
      <ErrorState
        title="Profil cabinet introuvable"
        description="Terminez votre onboarding pour accéder à votre espace."
        action={
          <Button asChild>
            <Link href="/onboarding">Reprendre l&apos;onboarding</Link>
          </Button>
        }
      />
    );
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [activePostsRes, applicationsRes, placementsRes, nextPlacementRes] =
    await Promise.all([
      supabase
        .from("job_posts")
        .select("id, title, city, start_date, urgent")
        .eq("cabinet_id", cabinet.id)
        .eq("status", "published")
        .order("start_date", { ascending: true }),
      supabase
        .from("applications")
        .select(
          "id, status, submitted_at, job_posts!inner(id, title, cabinet_id), applicant:profiles!applications_applicant_user_id_fkey(first_name, last_name)",
        )
        .eq("job_posts.cabinet_id", cabinet.id)
        .order("submitted_at", { ascending: false }),
      supabase
        .from("placements")
        .select("id", { count: "exact", head: true })
        .eq("cabinet_id", cabinet.id)
        .eq("status", "confirmed"),
      supabase
        .from("placements")
        .select(
          "id, start_date, end_date, job_posts(title), replacement:profiles!placements_replacement_user_id_fkey(first_name, last_name)",
        )
        .eq("cabinet_id", cabinet.id)
        .eq("status", "confirmed")
        .gte("start_date", today)
        .order("start_date", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

  const activePosts = activePostsRes.data ?? [];
  const applications = applicationsRes.data ?? [];
  const toProcess = applications.filter((a) =>
    ["submitted", "viewed"].includes(a.status),
  );
  const confirmedCount = placementsRes.count ?? 0;
  const nextPlacement = nextPlacementRes.data;
  const lastApplications = applications.slice(0, 5);
  const upcomingPosts = activePosts.filter(
    (p) => p.start_date && p.start_date >= today && p.start_date <= in14Days,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Bonjour, {profile.first_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Voici l&apos;activité de {cabinet.name || "votre cabinet"}.
          </p>
        </div>
        <Button asChild>
          <Link href="/cabinet/annonces/nouvelle">
            <Plus aria-hidden />
            Publier une annonce
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Annonces actives"
          value={activePosts.length}
          icon={Megaphone}
          href="/cabinet/annonces"
        />
        <StatCard
          label="Candidatures reçues"
          value={applications.length}
          icon={Users}
          href="/cabinet/candidatures"
        />
        <StatCard
          label="À traiter"
          value={toProcess.length}
          icon={Inbox}
          href="/cabinet/candidatures"
        />
        <StatCard
          label="Remplacements confirmés"
          value={confirmedCount}
          icon={CalendarCheck}
          href="/cabinet/remplacements"
        />
      </div>

      {cabinet.profile_completion < 100 ? (
        <Card>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <ProfileCompletion
              value={cabinet.profile_completion}
              label="Complétion du profil du cabinet"
              className="flex-1"
            />
            <Button variant="outline" size="sm" asChild>
              <Link href="/cabinet/profil">Compléter</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {nextPlacement ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCheck className="size-4 text-primary" aria-hidden />
              Prochain remplacement
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">
                {nextPlacement.replacement?.first_name}{" "}
                {nextPlacement.replacement?.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {nextPlacement.job_posts?.title}
                {nextPlacement.start_date
                  ? ` — du ${format(new Date(nextPlacement.start_date), "d MMMM yyyy", { locale: fr })}`
                  : null}
                {nextPlacement.end_date
                  ? ` au ${format(new Date(nextPlacement.end_date), "d MMMM yyyy", { locale: fr })}`
                  : null}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/cabinet/remplacements">Voir le remplacement</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dernières candidatures</CardTitle>
          </CardHeader>
          <CardContent>
            {lastApplications.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Aucune candidature reçue"
                description="Les candidatures à vos annonces publiées apparaîtront ici."
                className="py-10"
              />
            ) : (
              <ul className="divide-y">
                {lastApplications.map((app) => (
                  <li key={app.id} className="py-3 first:pt-0 last:pb-0">
                    <Link
                      href="/cabinet/candidatures"
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {app.applicant?.first_name} {app.applicant?.last_name}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {app.job_posts.title} —{" "}
                          {formatDistanceToNow(new Date(app.submitted_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </p>
                      </div>
                      <ApplicationStatusBadge status={app.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="size-4 text-primary" aria-hidden />
                Annonces démarrant sous 14 jours
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingPosts.length === 0 ? (
                <EmptyState
                  icon={CalendarClock}
                  title="Aucune échéance proche"
                  description="Aucune annonce active ne démarre dans les 14 prochains jours."
                  className="py-10"
                />
              ) : (
                <ul className="divide-y">
                  {upcomingPosts.map((post) => (
                    <li key={post.id} className="py-3 first:pt-0 last:pb-0">
                      <Link
                        href={`/cabinet/annonces/${post.id}`}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{post.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {post.city ? `${post.city} — ` : null}
                            {post.start_date
                              ? `début le ${format(new Date(post.start_date), "d MMMM yyyy", { locale: fr })}`
                              : null}
                          </p>
                        </div>
                        {post.urgent ? (
                          <Badge className="bg-warning-soft text-warning-foreground border-warning/40" variant="outline">
                            Urgent
                          </Badge>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
                  <MessageSquare
                    className="size-5 text-secondary-foreground"
                    aria-hidden
                  />
                </div>
                <div>
                  <p className="font-medium">Messages</p>
                  <p className="text-sm text-muted-foreground">
                    Échangez avec vos candidats et remplaçants.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/messages">Ouvrir</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
