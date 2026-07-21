import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  APPLICATION_STATUS_LABELS,
  DOCUMENT_STATUS_LABELS,
  JOB_POST_STATUS_LABELS,
  PLACEMENT_STATUS_LABELS,
  type ApplicationStatus,
  type DocumentStatus,
  type JobPostStatus,
  type PlacementStatus,
} from "@/lib/data/reference";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  info: "border-primary/20 bg-secondary text-secondary-foreground",
  success: "border-verified/25 bg-verified-soft text-accent-foreground",
  warning: "border-warning/40 bg-warning-soft text-warning-foreground",
  danger: "border-destructive/25 bg-destructive/10 text-destructive",
};

const JOB_POST_TONES: Record<JobPostStatus, Tone> = {
  draft: "neutral",
  published: "info",
  filled: "success",
  expired: "warning",
  archived: "neutral",
  cancelled: "danger",
  suspended: "danger",
};

const APPLICATION_TONES: Record<ApplicationStatus, Tone> = {
  submitted: "info",
  viewed: "neutral",
  shortlisted: "warning",
  accepted: "success",
  rejected: "danger",
  withdrawn: "neutral",
};

const DOCUMENT_TONES: Record<DocumentStatus, Tone> = {
  missing: "neutral",
  uploaded: "info",
  pending: "warning",
  verified: "success",
  rejected: "danger",
};

const PLACEMENT_TONES: Record<PlacementStatus, Tone> = {
  confirmed: "success",
  completed: "neutral",
  cancelled: "danger",
};

function BaseBadge({
  label,
  tone,
  className,
}: {
  label: string;
  tone: Tone;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", TONE_CLASSES[tone], className)}
    >
      {label}
    </Badge>
  );
}

export function JobPostStatusBadge({
  status,
  className,
}: {
  status: JobPostStatus;
  className?: string;
}) {
  return (
    <BaseBadge
      label={JOB_POST_STATUS_LABELS[status]}
      tone={JOB_POST_TONES[status]}
      className={className}
    />
  );
}

export function ApplicationStatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  return (
    <BaseBadge
      label={APPLICATION_STATUS_LABELS[status]}
      tone={APPLICATION_TONES[status]}
      className={className}
    />
  );
}

export function DocumentStatusBadge({
  status,
  className,
}: {
  status: DocumentStatus;
  className?: string;
}) {
  return (
    <BaseBadge
      label={DOCUMENT_STATUS_LABELS[status]}
      tone={DOCUMENT_TONES[status]}
      className={className}
    />
  );
}

export function PlacementStatusBadge({
  status,
  className,
}: {
  status: PlacementStatus;
  className?: string;
}) {
  return (
    <BaseBadge
      label={PLACEMENT_STATUS_LABELS[status]}
      tone={PLACEMENT_TONES[status]}
      className={className}
    />
  );
}

/** Badge « Document simulé » — toujours explicite (règle 10). */
export function SimulatedBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-warning/40 bg-warning-soft font-medium text-warning-foreground",
        className,
      )}
    >
      Document simulé
    </Badge>
  );
}
