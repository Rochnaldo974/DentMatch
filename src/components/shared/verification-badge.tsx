import { BadgeCheck, Clock, ShieldQuestion, ShieldX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  VERIFICATION_STATUS_LABELS,
  type VerificationStatus,
} from "@/lib/data/reference";

/**
 * Badge de vérification DentMatch.
 * Ne jamais afficher « vérifié par l'Ordre » — la vérification est interne au produit.
 */
export function VerificationBadge({
  status,
  className,
  short = false,
}: {
  status: VerificationStatus;
  className?: string;
  short?: boolean;
}) {
  const config = {
    verified: {
      icon: BadgeCheck,
      classes: "border-verified/25 bg-verified-soft text-accent-foreground",
      shortLabel: "Profil vérifié",
    },
    pending: {
      icon: Clock,
      classes: "border-warning/40 bg-warning-soft text-warning-foreground",
      shortLabel: "En attente",
    },
    unverified: {
      icon: ShieldQuestion,
      classes: "border-border bg-muted text-muted-foreground",
      shortLabel: "Non vérifié",
    },
    rejected: {
      icon: ShieldX,
      classes: "border-destructive/25 bg-destructive/10 text-destructive",
      shortLabel: "Refusé",
    },
  }[status];

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 font-medium", config.classes, className)}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {short ? config.shortLabel : VERIFICATION_STATUS_LABELS[status]}
    </Badge>
  );
}
