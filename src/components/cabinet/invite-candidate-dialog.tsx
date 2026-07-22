"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FilePlus2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteCandidateToJobPost } from "@/app/actions/candidates";
import { formatDateRange } from "@/components/job-posts/format";

/** Annonce publiée du cabinet, proposée dans le sélecteur d'invitation. */
export type InvitableJobPost = {
  id: string;
  title: string;
  city: string | null;
  start_date: string | null;
  end_date: string | null;
};

/**
 * Bouton « Inviter à candidater » + Dialog.
 * Avec des annonces publiées : choix de l'annonce puis envoi.
 * Sans annonce publiée : flux guidé vers la création d'une annonce qui
 * enverra l'invitation automatiquement à la publication.
 */
export function InviteCandidateDialog({
  candidateUserId,
  candidateFirstName,
  jobPosts,
}: {
  candidateUserId: string;
  candidateFirstName: string;
  jobPosts: InvitableJobPost[];
}) {
  const [open, setOpen] = useState(false);
  const [jobPostId, setJobPostId] = useState<string>(
    jobPosts.length === 1 ? jobPosts[0].id : "",
  );
  const [isPending, startTransition] = useTransition();

  const hasPosts = jobPosts.length > 0;
  const createHref = `/cabinet/annonces/nouvelle?inviter=${candidateUserId}`;

  function handleSubmit() {
    if (!jobPostId) {
      toast.error("Choisissez d'abord une annonce.");
      return;
    }
    startTransition(async () => {
      const result = await inviteCandidateToJobPost(jobPostId, candidateUserId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Invitation envoyée à ${candidateFirstName}.`);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full"
          aria-label={`Inviter ${candidateFirstName} à candidater`}
        >
          <Send className="size-4" aria-hidden="true" />
          Inviter à candidater
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inviter {candidateFirstName} à candidater</DialogTitle>
          <DialogDescription>
            {hasPosts
              ? `Choisissez l'annonce concernée : ${candidateFirstName} recevra une invitation à y candidater.`
              : "Une invitation est toujours rattachée à une annonce publiée — vous n'en avez pas encore."}
          </DialogDescription>
        </DialogHeader>

        {hasPosts ? (
          <>
            <div className="space-y-1.5">
              <Label htmlFor={`invite-annonce-${candidateUserId}`}>
                Annonce
              </Label>
              <Select value={jobPostId} onValueChange={setJobPostId}>
                <SelectTrigger
                  id={`invite-annonce-${candidateUserId}`}
                  className="w-full"
                >
                  <SelectValue placeholder="Sélectionnez une annonce publiée" />
                </SelectTrigger>
                <SelectContent>
                  {jobPosts.map((post) => {
                    const dates = formatDateRange(post.start_date, post.end_date);
                    return (
                      <SelectItem key={post.id} value={post.id}>
                        <span className="flex min-w-0 flex-col items-start text-left">
                          <span className="truncate font-medium">
                            {post.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {[post.city, dates].filter(Boolean).join(" · ") ||
                              "Dates à préciser"}
                          </span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || !jobPostId}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="size-4" aria-hidden="true" />
                )}
                Envoyer l&apos;invitation
              </Button>
            </DialogFooter>

            <p className="text-center text-xs text-muted-foreground">
              …ou{" "}
              <Link
                href={createHref}
                className="font-medium underline underline-offset-4 hover:text-foreground"
              >
                créez une nouvelle annonce pour cette invitation
              </Link>
              .
            </p>
          </>
        ) : (
          <>
            <div className="rounded-xl border border-verified/30 bg-verified-soft/50 p-4 text-sm">
              <p className="font-medium">
                Créez votre annonce en 2 minutes :
              </p>
              <p className="mt-1 text-muted-foreground">
                les dates seront pré-remplies avec la prochaine disponibilité
                de {candidateFirstName}, et l&apos;invitation lui sera envoyée
                automatiquement dès la publication.
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button asChild>
                <Link href={createHref}>
                  <FilePlus2 className="size-4" aria-hidden="true" />
                  Créer mon annonce et inviter {candidateFirstName}
                </Link>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
