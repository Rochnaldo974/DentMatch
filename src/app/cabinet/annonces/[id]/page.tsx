import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  CalendarDays,
  Car,
  Clock,
  Euro,
  Languages,
  MapPin,
  Stethoscope,
  Users,
  Wrench,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import {
  ApplicationStatusBadge,
  JobPostStatusBadge,
} from "@/components/shared/status-badge";
import { JobPostDetailActions } from "@/components/cabinet/job-post-detail-actions";
import {
  formatCompensation,
  formatDateFr,
  formatDateRange,
  labelFor,
} from "@/components/job-posts/format";
import {
  COMPENSATION_TYPES,
  CONTRACT_TYPES,
  EQUIPMENT,
  EXPERIENCE_LEVELS,
  REPLACEMENT_REASONS,
  REPLACEMENT_TYPES,
  WORKING_DAYS,
} from "@/lib/data/reference";

export const metadata = { title: "Détail de l'annonce" };

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}

export default async function JobPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireRole("cabinet");
  const supabase = await createClient();

  const { data: cabinet } = await supabase
    .from("cabinet_profiles")
    .select("id")
    .eq("user_id", profile.id)
    .single();

  if (!cabinet) {
    return (
      <ErrorState
        title="Profil cabinet introuvable"
        description="Terminez votre onboarding pour gérer vos annonces."
      />
    );
  }

  const { data: post } = await supabase
    .from("job_posts")
    .select("*, specialties!job_posts_specialty_id_fkey(code, label)")
    .eq("id", id)
    .eq("cabinet_id", cabinet.id)
    .maybeSingle();

  if (!post) notFound();

  const { data: applications } = await supabase
    .from("applications")
    .select(
      "id, status, submitted_at, applicant:profiles!applications_applicant_user_id_fkey(first_name, last_name)",
    )
    .eq("job_post_id", post.id)
    .order("submitted_at", { ascending: false });

  const workingDaysLabel = post.working_days
    .map((d) => labelFor(WORKING_DAYS, d))
    .filter(Boolean)
    .join(", ");
  const equipmentLabels = post.equipment
    .map((e) => labelFor(EQUIPMENT, e) ?? e)
    .join(", ");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link href="/cabinet/annonces">
            <ArrowLeft aria-hidden />
            Retour aux annonces
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {post.title}
            </h1>
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
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {post.city ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden />
                {post.city}
              </span>
            ) : null}
            {post.start_date ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" aria-hidden />
                {formatDateRange(post.start_date, post.end_date)}
              </span>
            ) : null}
            {post.published_at ? (
              <span>Publiée le {formatDateFr(post.published_at)}</span>
            ) : (
              <span>Créée le {formatDateFr(post.created_at)}</span>
            )}
          </div>
        </div>
        <JobPostDetailActions jobPostId={post.id} status={post.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Le remplacement</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <InfoRow
            icon={Building2}
            label="Motif"
            value={labelFor(REPLACEMENT_REASONS, post.replacement_reason) ?? "—"}
          />
          <InfoRow
            icon={Clock}
            label="Type de remplacement"
            value={labelFor(REPLACEMENT_TYPES, post.replacement_type) ?? "—"}
          />
          <InfoRow
            icon={Stethoscope}
            label="Statut proposé"
            value={labelFor(CONTRACT_TYPES, post.contract_type) ?? "—"}
          />
          <InfoRow
            icon={Users}
            label="Postes"
            value={`${post.filled_positions_count}/${post.positions_count} pourvu${post.positions_count > 1 ? "s" : ""}`}
          />
          {post.replaced_practitioner ? (
            <InfoRow
              icon={Stethoscope}
              label="Praticien remplacé"
              value={post.replaced_practitioner}
            />
          ) : null}
          <InfoRow
            icon={Clock}
            label="Temps de travail"
            value={post.full_time ? "Temps plein" : "Temps partiel"}
          />
          {workingDaysLabel ? (
            <InfoRow
              icon={CalendarDays}
              label="Jours travaillés"
              value={workingDaysLabel}
            />
          ) : null}
          {post.schedule_text ? (
            <InfoRow icon={Clock} label="Horaires" value={post.schedule_text} />
          ) : null}
          {post.application_deadline ? (
            <InfoRow
              icon={CalendarDays}
              label="Candidatures jusqu'au"
              value={formatDateFr(post.application_deadline)}
            />
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Profil recherché et rémunération
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow
              icon={Stethoscope}
              label="Spécialité"
              value={post.specialties?.label ?? "Aucune spécialité exigée"}
            />
            <InfoRow
              icon={Users}
              label="Expérience souhaitée"
              value={
                labelFor(EXPERIENCE_LEVELS, post.experience_required) ??
                "Indifférent"
              }
            />
            <InfoRow
              icon={Euro}
              label="Rémunération"
              value={
                formatCompensation(post) ??
                labelFor(COMPENSATION_TYPES, post.compensation_type) ??
                "—"
              }
            />
            {post.compensation_details ? (
              <InfoRow
                icon={Euro}
                label="Précisions"
                value={post.compensation_details}
              />
            ) : null}
          </div>
          {post.expected_procedures ? (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground">Actes attendus</p>
                <p className="mt-1 text-sm whitespace-pre-line">
                  {post.expected_procedures}
                </p>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conditions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <InfoRow
            icon={BedDouble}
            label="Hébergement"
            value={post.accommodation_provided ? "Proposé" : "Non proposé"}
          />
          <InfoRow
            icon={Car}
            label="Transport"
            value={post.travel_covered ? "Pris en charge" : "Non pris en charge"}
          />
          {equipmentLabels ? (
            <InfoRow icon={Wrench} label="Équipements" value={equipmentLabels} />
          ) : null}
          {post.software ? (
            <InfoRow icon={Wrench} label="Logiciel" value={post.software} />
          ) : null}
          {post.languages.length > 0 ? (
            <InfoRow
              icon={Languages}
              label="Langues"
              value={post.languages.join(", ")}
            />
          ) : null}
          {post.practical_info ? (
            <InfoRow
              icon={Building2}
              label="Informations pratiques"
              value={post.practical_info}
            />
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-line">
            {post.description || "Aucune description."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Candidatures reçues ({applications?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!applications || applications.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Aucune candidature pour cette annonce"
              description="Les candidatures des remplaçants apparaîtront ici dès réception."
              className="py-10"
            />
          ) : (
            <ul className="divide-y">
              {applications.map((app) => (
                <li key={app.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href="/cabinet/candidatures"
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {app.applicant?.first_name} {app.applicant?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Reçue le {formatDateFr(app.submitted_at)}
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
    </div>
  );
}
