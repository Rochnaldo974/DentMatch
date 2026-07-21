"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Briefcase,
  CalendarDays,
  Languages,
  MapPin,
  MessageSquare,
  UserRound,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ApplicationStatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { AcceptDialog } from "@/components/applications/accept-dialog";
import {
  markApplicationViewed,
  openApplicationConversation,
  rejectApplication,
} from "@/app/actions/applications";
import {
  PROFESSIONAL_STATUS_LABELS,
  type ApplicationStatus,
  type JobPostStatus,
  type ProfessionalStatus,
  type VerificationStatus,
} from "@/lib/data/reference";

/** Données d'une candidature côté cabinet (jamais de RPPS, date de naissance ni adresse). */
export type CabinetApplicationItem = {
  id: string;
  status: ApplicationStatus;
  submittedAt: string;
  message: string | null;
  expectedCompensation: string | null;
  applicant: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    verificationStatus: VerificationStatus;
    phone: string | null;
  };
  replacementProfile: {
    professionalStatus: ProfessionalStatus | null;
    city: string | null;
    experienceYears: number | null;
    languages: string[];
    bio: string | null;
  } | null;
  jobPost: {
    id: string;
    title: string;
    city: string | null;
    startDate: string | null;
    endDate: string | null;
    status: JobPostStatus;
    positionsCount: number;
    filledPositionsCount: number;
  };
};

function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
}

function datesFr(start: string | null, end: string | null): string | null {
  const fmt = (d: string) => format(new Date(d), "d MMMM yyyy", { locale: fr });
  if (start && end) return `Du ${fmt(start)} au ${fmt(end)}`;
  if (start) return `À partir du ${fmt(start)}`;
  return null;
}

function experienceLabel(years: number | null): string | null {
  if (years === null) return null;
  if (years === 0) return "Débutant";
  return `${years} an${years > 1 ? "s" : ""} d'expérience`;
}

/** Carte d'une candidature reçue par le cabinet. */
export function ApplicationCard({ app }: { app: CabinetApplicationItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [profileOpen, setProfileOpen] = useState(false);

  const fullName = `${app.applicant.firstName} ${app.applicant.lastName}`.trim();
  const rp = app.replacementProfile;
  const statusLabel = rp?.professionalStatus
    ? PROFESSIONAL_STATUS_LABELS[rp.professionalStatus]
    : null;
  const jobDatesFr = datesFr(app.jobPost.startDate, app.jobPost.endDate);
  const canDecide = ["submitted", "viewed", "shortlisted"].includes(app.status);

  function handleProfileOpenChange(open: boolean) {
    setProfileOpen(open);
    if (open && app.status === "submitted") {
      startTransition(async () => {
        const result = await markApplicationViewed(app.id);
        if (!result.error) router.refresh();
      });
    }
  }

  function handleOpenConversation() {
    startTransition(async () => {
      const result = await openApplicationConversation(app.id);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <article className="rounded-xl border bg-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar className="size-11">
            {app.applicant.avatarUrl ? (
              <AvatarImage src={app.applicant.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback>
              {initials(app.applicant.firstName, app.applicant.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold leading-snug">{fullName}</h3>
              <VerificationBadge
                status={app.applicant.verificationStatus}
                short
              />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {statusLabel ? <span>{statusLabel}</span> : null}
              {experienceLabel(rp?.experienceYears ?? null) ? (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="size-3.5" aria-hidden />
                  {experienceLabel(rp?.experienceYears ?? null)}
                </span>
              ) : null}
              {rp?.city ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden />
                  {rp.city}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
          <ApplicationStatusBadge status={app.status} />
          <p className="text-xs text-muted-foreground">
            Reçue{" "}
            {formatDistanceToNow(new Date(app.submittedAt), {
              addSuffix: true,
              locale: fr,
            })}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <CalendarDays className="size-3.5" aria-hidden />
          Annonce concernée
        </p>
        <Link
          href={`/cabinet/annonces/${app.jobPost.id}`}
          className="mt-0.5 block font-medium underline-offset-4 hover:underline"
        >
          {app.jobPost.title}
        </Link>
        <p className="text-muted-foreground">
          {app.jobPost.city ? `${app.jobPost.city} — ` : null}
          {jobDatesFr}
        </p>
      </div>

      {app.message ? (
        <p className="mt-3 line-clamp-3 text-sm whitespace-pre-line text-muted-foreground">
          {app.message}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
        {canDecide ? (
          <AcceptDialog
            applicationId={app.id}
            applicationStatus={app.status}
            candidateName={fullName}
            jobTitle={app.jobPost.title}
            jobDatesFr={jobDatesFr}
            postStatus={app.jobPost.status}
            positionsCount={app.jobPost.positionsCount}
            filledPositionsCount={app.jobPost.filledPositionsCount}
          />
        ) : null}

        <Dialog open={profileOpen} onOpenChange={handleProfileOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <UserRound aria-hidden />
              Voir le profil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85svh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-2">
                {fullName}
                <VerificationBadge
                  status={app.applicant.verificationStatus}
                  short
                />
              </DialogTitle>
              <DialogDescription>
                Informations déclarées par le candidat.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Statut</p>
                  <p>{statusLabel ?? "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expérience</p>
                  <p>
                    {experienceLabel(rp?.experienceYears ?? null) ??
                      "Non renseignée"}
                  </p>
                </div>
                {rp?.city ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Ville</p>
                    <p>{rp.city}</p>
                  </div>
                ) : null}
                {rp?.languages && rp.languages.length > 0 ? (
                  <div>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Languages className="size-3" aria-hidden />
                      Langues
                    </p>
                    <p>{rp.languages.join(", ")}</p>
                  </div>
                ) : null}
              </div>
              {rp?.bio ? (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Présentation
                    </p>
                    <p className="mt-1 whitespace-pre-line">{rp.bio}</p>
                  </div>
                </>
              ) : null}
              {app.message ? (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Message de candidature
                    </p>
                    <p className="mt-1 whitespace-pre-line">{app.message}</p>
                  </div>
                </>
              ) : null}
              {app.expectedCompensation ? (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Rémunération souhaitée
                  </p>
                  <p className="mt-1">{app.expectedCompensation}</p>
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={handleOpenConversation}
        >
          <MessageSquare aria-hidden />
          Envoyer un message
        </Button>

        {canDecide ? (
          <ConfirmDialog
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <XCircle aria-hidden />
                Refuser
              </Button>
            }
            title="Refuser cette candidature ?"
            description={`La candidature de ${fullName} sera refusée. Le candidat en sera informé.`}
            confirmLabel="Refuser"
            destructive
            onConfirm={async () => {
              const result = await rejectApplication(app.id);
              if (result.error) {
                toast.error(result.error);
              } else {
                toast.success("Candidature refusée.");
                router.refresh();
              }
            }}
          />
        ) : null}
      </div>
    </article>
  );
}
