"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Copy,
  Eye,
  MapPin,
  Megaphone,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { JobPostStatusBadge } from "@/components/shared/status-badge";
import {
  changeJobPostStatus,
  deleteJobPost,
  duplicateJobPost,
} from "@/app/actions/job-posts";
import type { Enums } from "@/types/database";

type JobPostListItem = {
  id: string;
  title: string;
  city: string | null;
  start_date: string | null;
  end_date: string | null;
  status: Enums<"job_post_status">;
  urgent: boolean;
  created_at: string;
  published_at: string | null;
};

const FILTERS = [
  { value: "toutes", label: "Toutes" },
  { value: "published", label: "Publiées" },
  { value: "draft", label: "Brouillons" },
  { value: "filled", label: "Pourvues" },
  { value: "archived", label: "Archivées" },
] as const;

function formatDate(date: string | null) {
  return date ? format(new Date(date), "d MMM yyyy", { locale: fr }) : null;
}

function JobPostCard({
  post,
  applicationCount,
}: {
  post: JobPostListItem;
  applicationCount: number;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const runAction = (
    action: () => Promise<{ error?: string; success?: boolean }>,
    successMessage: string,
  ) => {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(successMessage);
        router.refresh();
      }
    });
  };

  return (
    <article className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/cabinet/annonces/${post.id}`}
              className="truncate font-semibold underline-offset-4 hover:underline"
            >
              {post.title}
            </Link>
            <JobPostStatusBadge status={post.status} />
            {post.urgent ? (
              <Badge
                variant="outline"
                className="border-warning/40 bg-warning-soft font-medium text-warning-foreground"
              >
                Urgent
              </Badge>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            {post.city ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden />
                {post.city}
              </span>
            ) : null}
            {post.start_date ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" aria-hidden />
                Du {formatDate(post.start_date)}
                {post.end_date ? ` au ${formatDate(post.end_date)}` : null}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" aria-hidden />
              {applicationCount}{" "}
              {applicationCount > 1 ? "candidatures" : "candidature"}
            </span>
            {post.published_at ? (
              <span>Publiée le {formatDate(post.published_at)}</span>
            ) : (
              <span>Créée le {formatDate(post.created_at)}</span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions pour l'annonce « ${post.title} »`}
            >
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/cabinet/annonces/${post.id}`}>
                <Eye aria-hidden />
                Voir
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/cabinet/annonces/${post.id}/modifier`}>
                <Pencil aria-hidden />
                Modifier
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                runAction(
                  () => duplicateJobPost(post.id),
                  "Annonce dupliquée en brouillon.",
                )
              }
            >
              <Copy aria-hidden />
              Dupliquer
            </DropdownMenuItem>
            {post.status === "published" ? (
              <DropdownMenuItem
                onSelect={() =>
                  runAction(
                    () => changeJobPostStatus(post.id, "filled"),
                    "Annonce marquée comme pourvue.",
                  )
                }
              >
                <CheckCircle2 aria-hidden />
                Marquer pourvue
              </DropdownMenuItem>
            ) : null}
            {post.status !== "archived" ? (
              <DropdownMenuItem
                onSelect={() =>
                  runAction(
                    () => changeJobPostStatus(post.id, "archived"),
                    post.status === "published"
                      ? "Annonce fermée et archivée."
                      : "Annonce archivée.",
                  )
                }
              >
                <Archive aria-hidden />
                {post.status === "published" ? "Fermer" : "Archiver"}
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <ConfirmDialog
              trigger={
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 aria-hidden />
                  Supprimer
                </DropdownMenuItem>
              }
              title="Supprimer cette annonce ?"
              description={`L'annonce « ${post.title} » et ses candidatures associées seront définitivement supprimées. Cette action est irréversible.`}
              confirmLabel="Supprimer"
              destructive
              onConfirm={() =>
                runAction(() => deleteJobPost(post.id), "Annonce supprimée.")
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

export function JobPostList({
  posts,
  applicationCounts,
}: {
  posts: JobPostListItem[];
  applicationCounts: Record<string, number>;
}) {
  const [filter, setFilter] = useState<string>("toutes");

  const filtered = useMemo(
    () =>
      filter === "toutes" ? posts : posts.filter((p) => p.status === filter),
    [posts, filter],
  );

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title="Aucune annonce pour le moment"
        description="Publiez votre première annonce pour recevoir des candidatures de remplaçants."
        action={
          <Button asChild>
            <Link href="/cabinet/annonces/nouvelle">
              <Plus aria-hidden />
              Publier une annonce
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="h-auto w-full flex-wrap justify-start sm:w-auto">
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Aucune annonce dans cette catégorie"
          description="Changez de filtre ou publiez une nouvelle annonce."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((post) => (
            <JobPostCard
              key={post.id}
              post={post}
              applicationCount={applicationCounts[post.id] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
