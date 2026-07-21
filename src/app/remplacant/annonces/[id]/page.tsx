import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertCircle,
  Building2,
  CalendarClock,
  CalendarDays,
  Clock,
  Home,
  Info,
  Languages,
  MapPin,
  Monitor,
  Wallet,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { JobPostStatusBadge } from "@/components/shared/status-badge";
import { ApplyDialog } from "@/components/job-posts/apply-dialog";
import { SaveJobPostButton } from "@/components/job-posts/save-button";
import {
  formatCompensation,
  formatDateFr,
  formatDateRange,
  labelFor,
  publicMediaUrl,
} from "@/components/job-posts/format";
import { canApply } from "@/lib/business-rules";
import {
  CONTRACT_TYPES,
  ENVIRONMENT_TYPES,
  EQUIPMENT,
  EXPERIENCE_LEVELS,
  REPLACEMENT_TYPES,
  STRUCTURE_TYPES,
  WORKING_DAYS,
  type ProfessionalStatus,
} from "@/lib/data/reference";
import { DEMO_MODE } from "@/lib/constants";

export const metadata = { title: "Détail de l'annonce" };

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium">{children}</div>
      </div>
    </div>
  );
}

export default async function JobPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireRole("replacement_dentist");
  const { id } = await params;
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: post } = await supabase
    .from("job_posts")
    .select("*, cabinet_profiles(*), specialties!job_posts_specialty_id_fkey(code, label, is_specialized)")
    .eq("id", id)
    .maybeSingle();

  if (!post) notFound();

  const cabinet = post.cabinet_profiles;

  const [photosRes, applicationRes, rpRes, savedRes] = await Promise.all([
    cabinet
      ? supabase
          .from("cabinet_photos")
          .select("id, storage_path, photo_type")
          .eq("cabinet_id", cabinet.id)
          .neq("photo_type", "logo")
          .order("display_order", { ascending: true })
      : Promise.resolve({ data: [] }),
    supabase
      .from("applications")
      .select("id, status")
      .eq("job_post_id", post.id)
      .eq("applicant_user_id", profile.id)
      .neq("status", "withdrawn")
      .maybeSingle(),
    supabase
      .from("replacement_profiles")
      .select("professional_status, resident_specialty")
      .eq("user_id", profile.id)
      .maybeSingle(),
    supabase
      .from("saved_job_posts")
      .select("job_post_id")
      .eq("user_id", profile.id)
      .eq("job_post_id", post.id)
      .maybeSingle(),
  ]);

  const photos = photosRes.data ?? [];
  const alreadyApplied = Boolean(applicationRes.data);
  const rp = rpRes.data;
  const saved = Boolean(savedRes.data);

  const applyCheck = canApply({
    onboardingCompleted: profile.onboarding_completed,
    alreadyApplied,
    post: {
      status: post.status,
      applicationDeadline: post.application_deadline,
      specialtyCode: post.specialties?.code ?? null,
      specialtyIsSpecialized: post.specialties?.is_specialized,
    },
    professionalStatus: (rp?.professional_status ??
      "qualified_dentist") as ProfessionalStatus,
    residentSpecialty: rp?.resident_specialty,
    today,
  });

  const dates = formatDateRange(post.start_date, post.end_date);
  const compensation = formatCompensation(post);
  const workingDays = post.working_days
    .map((d) => labelFor(WORKING_DAYS, d) ?? d)
    .join(", ");
  const equipmentLabels = post.equipment.map(
    (e) => labelFor(EQUIPMENT, e) ?? e,
  );
  const contractLabel = labelFor(CONTRACT_TYPES, post.contract_type);
  const replacementTypeLabel = labelFor(REPLACEMENT_TYPES, post.replacement_type);
  const experienceLabel = labelFor(EXPERIENCE_LEVELS, post.experience_required);
  const structureLabel = labelFor(STRUCTURE_TYPES, cabinet?.structure_type);
  const environmentLabel = labelFor(ENVIRONMENT_TYPES, cabinet?.environment_type);

  return (
    <div className="space-y-6">
      <Link
        href="/remplacant/annonces"
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← Retour aux annonces
      </Link>

      {post.status !== "published" ? (
        <div className="flex items-center gap-2.5 rounded-lg border border-warning/40 bg-warning-soft px-4 py-3 text-sm text-warning-foreground">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          Cette annonce n&apos;accepte plus de candidatures.
        </div>
      ) : null}

      {DEMO_MODE ? (
        <div className="flex items-center gap-2.5 rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 text-xs text-warning-foreground">
          <Info className="size-4 shrink-0" aria-hidden="true" />
          Mode démonstration : les documents simulés permettent de tester le
          parcours mais ne constituent pas une vérification réelle.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <JobPostStatusBadge status={post.status} />
              {post.urgent ? (
                <Badge
                  variant="outline"
                  className="border-destructive/25 bg-destructive/10 font-medium text-destructive"
                >
                  Urgent
                </Badge>
              ) : null}
              {post.specialties ? (
                <Badge variant="secondary">{post.specialties.label}</Badge>
              ) : null}
              {contractLabel ? (
                <Badge variant="outline">{contractLabel}</Badge>
              ) : null}
              {replacementTypeLabel ? (
                <Badge variant="outline">{replacementTypeLabel}</Badge>
              ) : null}
              {experienceLabel ? (
                <Badge variant="outline">{experienceLabel}</Badge>
              ) : null}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {post.title}
            </h1>
            {cabinet ? (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="size-4 shrink-0" aria-hidden="true" />
                {cabinet.name}
                {structureLabel ? ` · ${structureLabel}` : null}
              </p>
            ) : null}
          </div>

          {post.description ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{post.description}</p>
              </CardContent>
            </Card>
          ) : null}

          {post.expected_procedures ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actes attendus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {post.expected_procedures}
                </p>
              </CardContent>
            </Card>
          ) : null}

          {post.practical_info ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Informations pratiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {post.practical_info}
                </p>
              </CardContent>
            </Card>
          ) : null}

          {photos.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Photos du cabinet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((photo) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={photo.id}
                      src={publicMediaUrl(photo.storage_path)}
                      alt={`Photo du cabinet ${cabinet?.name ?? ""}`.trim()}
                      className="aspect-[4/3] w-full rounded-lg border object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {equipmentLabels.length > 0 ||
          post.software ||
          post.languages.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Plateau technique et environnement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {equipmentLabels.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {equipmentLabels.map((label) => (
                      <Badge key={label} variant="secondary">
                        {label}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                {post.software ? (
                  <p className="flex items-center gap-2 text-sm">
                    <Monitor
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    Logiciel : <span className="font-medium">{post.software}</span>
                  </p>
                ) : null}
                {post.languages.length > 0 ? (
                  <p className="flex items-center gap-2 text-sm">
                    <Languages
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    Langues :{" "}
                    <span className="font-medium">
                      {post.languages.join(", ")}
                    </span>
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {cabinet?.description ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  À propos de {cabinet.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm whitespace-pre-wrap">
                  {cabinet.description}
                </p>
                {environmentLabel ? (
                  <p className="text-sm text-muted-foreground">
                    Environnement {environmentLabel.toLowerCase()}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Carte latérale */}
        <aside>
          <div className="space-y-4 lg:sticky lg:top-24">
            <Card>
              <CardContent className="space-y-4">
                {dates ? (
                  <DetailRow icon={CalendarDays} label="Dates">
                    {dates}
                  </DetailRow>
                ) : null}
                {post.schedule_text ? (
                  <DetailRow icon={Clock} label="Horaires">
                    {post.schedule_text}
                  </DetailRow>
                ) : null}
                {workingDays ? (
                  <DetailRow icon={CalendarDays} label="Jours travaillés">
                    {workingDays}
                  </DetailRow>
                ) : null}
                {compensation ? (
                  <DetailRow icon={Wallet} label="Rémunération">
                    {compensation}
                  </DetailRow>
                ) : null}
                {post.accommodation_provided || post.travel_covered ? (
                  <DetailRow icon={Home} label="Hébergement et transport">
                    {[
                      post.accommodation_provided ? "Hébergement proposé" : null,
                      post.travel_covered ? "Transport pris en charge" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </DetailRow>
                ) : null}
                {post.application_deadline ? (
                  <DetailRow icon={CalendarClock} label="Date limite de candidature">
                    {formatDateFr(post.application_deadline)}
                  </DetailRow>
                ) : null}

                <Separator />

                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="size-4 text-primary" aria-hidden="true" />
                    {post.city ?? "Ville non précisée"}
                  </p>
                  <p className="mt-1 pl-6 text-xs text-muted-foreground">
                    {[post.department, post.region, post.territory]
                      .filter(Boolean)
                      .join(" · ") || "Localisation non précisée"}
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <ApplyDialog
                    jobPostId={post.id}
                    jobPostTitle={post.title}
                    allowed={applyCheck.allowed}
                    reason={applyCheck.reason}
                    alreadyApplied={alreadyApplied}
                  />
                  <SaveJobPostButton jobPostId={post.id} saved={saved} />
                </div>
              </CardContent>
            </Card>

            {cabinet ? (
              <Card>
                <CardContent className="space-y-1.5">
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    <Building2
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    {cabinet.name}
                  </p>
                  {structureLabel ? (
                    <p className="pl-6 text-sm text-muted-foreground">
                      {structureLabel}
                    </p>
                  ) : null}
                  {post.replaced_practitioner ? (
                    <p className="pl-6 text-sm text-muted-foreground">
                      Praticien remplacé : {post.replaced_practitioner}
                    </p>
                  ) : null}
                  {typeof post.positions_count === "number" &&
                  post.positions_count > 1 ? (
                    <p className="pl-6 text-sm text-muted-foreground">
                      {post.positions_count} postes à pourvoir
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
