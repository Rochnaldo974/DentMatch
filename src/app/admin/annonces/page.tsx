import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { JobPostStatusBadge } from "@/components/shared/status-badge";
import { SuspendJobPostButton } from "@/components/admin/suspend-job-post-button";

export const metadata: Metadata = {
  title: "Annonces",
};

function formatDateFr(date: string | null) {
  return date ? format(new Date(date), "d MMM yyyy", { locale: fr }) : "—";
}

function formatPeriod(startDate: string | null, endDate: string | null) {
  if (!startDate && !endDate) return "—";
  return `${formatDateFr(startDate)} → ${formatDateFr(endDate)}`;
}

export default async function AdminJobPostsPage() {
  const supabase = await createClient();

  const { data: jobPosts } = await supabase
    .from("job_posts")
    .select(
      "id, title, city, start_date, end_date, status, published_at, created_at, cabinet_profiles(name)",
    )
    .order("created_at", { ascending: false })
    .limit(300);

  const posts = jobPosts ?? [];

  // Nombre de candidatures par annonce : une requête puis agrégation JS.
  const applicationCountByPost = new Map<string, number>();
  if (posts.length > 0) {
    const { data: applications } = await supabase
      .from("applications")
      .select("job_post_id")
      .in(
        "job_post_id",
        posts.map((post) => post.id),
      );
    for (const application of applications ?? []) {
      applicationCountByPost.set(
        application.job_post_id,
        (applicationCountByPost.get(application.job_post_id) ?? 0) + 1,
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Annonces</h1>
        <p className="text-sm text-muted-foreground">
          Toutes les annonces de la plateforme, pour la modération.
        </p>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Aucune annonce"
          description="Les annonces créées par les cabinets apparaîtront ici."
        />
      ) : (
        <>
          {/* Desktop : table */}
          <div className="hidden rounded-xl border bg-card lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Titre</TableHead>
                  <TableHead>Cabinet</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Candidatures</TableHead>
                  <TableHead>Publiée le</TableHead>
                  <TableHead className="px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="max-w-56 truncate px-4 font-medium">
                      {post.title}
                    </TableCell>
                    <TableCell className="max-w-44 truncate">
                      {post.cabinet_profiles?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {post.city ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatPeriod(post.start_date, post.end_date)}
                    </TableCell>
                    <TableCell>
                      <JobPostStatusBadge status={post.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {applicationCountByPost.get(post.id) ?? 0}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDateFr(post.published_at)}
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      {post.status === "published" ? (
                        <SuspendJobPostButton
                          jobPostId={post.id}
                          jobPostTitle={post.title}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile : cartes */}
          <ul className="space-y-3 lg:hidden">
            {posts.map((post) => (
              <li key={post.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {post.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {post.cabinet_profiles?.name ?? "—"}
                      {post.city ? ` · ${post.city}` : ""}
                    </p>
                  </div>
                  <JobPostStatusBadge status={post.status} className="shrink-0" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Période : {formatPeriod(post.start_date, post.end_date)}
                  {" · "}
                  {applicationCountByPost.get(post.id) ?? 0} candidature(s)
                  {post.published_at
                    ? ` · Publiée le ${formatDateFr(post.published_at)}`
                    : ""}
                </p>
                {post.status === "published" ? (
                  <div className="mt-3 flex justify-end">
                    <SuspendJobPostButton
                      jobPostId={post.id}
                      jobPostTitle={post.title}
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
