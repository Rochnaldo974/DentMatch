"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  CheckCircle2,
  ChevronDown,
  Copy,
  Pencil,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  changeJobPostStatus,
  duplicateJobPost,
} from "@/app/actions/job-posts";
import type { Enums } from "@/types/database";

/** Actions d'une annonce sur sa page de détail : modifier, dupliquer, statut. */
export function JobPostDetailActions({
  jobPostId,
  status,
}: {
  jobPostId: string;
  status: Enums<"job_post_status">;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const runAction = (
    action: () => Promise<{ error?: string; jobPostId?: string }>,
    successMessage: string,
    onSuccess?: (result: { jobPostId?: string }) => void,
  ) => {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(successMessage);
      if (onSuccess) onSuccess(result);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/cabinet/annonces/${jobPostId}/modifier`}>
          <Pencil aria-hidden />
          Modifier
        </Link>
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() =>
          runAction(
            () => duplicateJobPost(jobPostId),
            "Annonce dupliquée en brouillon.",
            (result) => {
              if (result.jobPostId) {
                router.push(`/cabinet/annonces/${result.jobPostId}/modifier`);
              }
            },
          )
        }
      >
        <Copy aria-hidden />
        Dupliquer
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending}>
            Changer le statut
            <ChevronDown aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {status === "draft" || status === "archived" ? (
            <DropdownMenuItem
              onSelect={() =>
                runAction(
                  () => changeJobPostStatus(jobPostId, "published"),
                  "Annonce publiée.",
                )
              }
            >
              <Send aria-hidden />
              Publier
            </DropdownMenuItem>
          ) : null}
          {status === "published" ? (
            <DropdownMenuItem
              onSelect={() =>
                runAction(
                  () => changeJobPostStatus(jobPostId, "filled"),
                  "Annonce marquée comme pourvue.",
                )
              }
            >
              <CheckCircle2 aria-hidden />
              Marquer pourvue
            </DropdownMenuItem>
          ) : null}
          {status === "filled" ? (
            <DropdownMenuItem
              onSelect={() =>
                runAction(
                  () => changeJobPostStatus(jobPostId, "published"),
                  "Annonce republiée.",
                )
              }
            >
              <Send aria-hidden />
              Republier
            </DropdownMenuItem>
          ) : null}
          {status !== "archived" ? (
            <DropdownMenuItem
              onSelect={() =>
                runAction(
                  () => changeJobPostStatus(jobPostId, "archived"),
                  status === "published"
                    ? "Annonce fermée et archivée."
                    : "Annonce archivée.",
                )
              }
            >
              <Archive aria-hidden />
              {status === "published" ? "Fermer et archiver" : "Archiver"}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
