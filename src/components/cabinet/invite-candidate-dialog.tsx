"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
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
 * Bouton « Inviter à candidater » + Dialog de choix de l'annonce.
 * Désactivé lorsque le cabinet n'a aucune annonce publiée.
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

  const disabled = jobPosts.length === 0;

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

  if (disabled) {
    return (
      <Button
        className="w-full"
        disabled
        aria-label={`Inviter ${candidateFirstName} à candidater (publiez d'abord une annonce)`}
      >
        <Send className="size-4" aria-hidden="true" />
        Inviter à candidater
      </Button>
    );
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
            Choisissez l&apos;annonce concernée : {candidateFirstName} recevra
            une invitation à y candidater.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor={`invite-annonce-${candidateUserId}`}>Annonce</Label>
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
                      <span className="truncate font-medium">{post.title}</span>
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
      </DialogContent>
    </Dialog>
  );
}
