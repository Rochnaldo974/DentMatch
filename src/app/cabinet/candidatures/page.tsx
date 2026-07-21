import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ErrorState } from "@/components/shared/error-state";
import { ApplicationList } from "@/components/applications/application-list";
import type { CabinetApplicationItem } from "@/components/applications/application-card";

export const metadata = { title: "Candidatures" };

/** Onglet contenant chaque statut de candidature. */
const TAB_FOR_STATUS: Record<string, string> = {
  submitted: "nouvelles",
  viewed: "en-cours",
  shortlisted: "en-cours",
  accepted: "acceptees",
  rejected: "refusees",
  withdrawn: "retirees",
};

export default async function CabinetApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ onglet?: string; candidature?: string }>;
}) {
  const { onglet, candidature } = await searchParams;
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
        description="Terminez votre onboarding pour consulter vos candidatures."
      />
    );
  }

  const { data: rows, error } = await supabase
    .from("applications")
    .select(
      `id, status, submitted_at, message, expected_compensation, applicant_user_id,
       job_posts!inner(id, title, city, start_date, end_date, status, positions_count, filled_positions_count, cabinet_id),
       applicant:profiles!applications_applicant_user_id_fkey(first_name, last_name, avatar_url, verification_status, phone)`,
    )
    .eq("job_posts.cabinet_id", cabinet.id)
    .order("submitted_at", { ascending: false });

  if (error) {
    return <ErrorState />;
  }

  // Profils remplaçants des candidats (informations publiques uniquement —
  // jamais de RPPS, date de naissance ni adresse).
  const applicantIds = [...new Set((rows ?? []).map((r) => r.applicant_user_id))];
  const { data: replacementProfiles } = applicantIds.length
    ? await supabase
        .from("replacement_profiles")
        .select("user_id, professional_status, city, experience_years, languages, bio")
        .in("user_id", applicantIds)
    : { data: [] };

  const rpByUser = new Map(
    (replacementProfiles ?? []).map((rp) => [rp.user_id, rp]),
  );

  const applications: CabinetApplicationItem[] = (rows ?? []).map((row) => {
    const rp = rpByUser.get(row.applicant_user_id);
    return {
      id: row.id,
      status: row.status,
      submittedAt: row.submitted_at,
      message: row.message,
      expectedCompensation: row.expected_compensation,
      applicant: {
        firstName: row.applicant?.first_name ?? "",
        lastName: row.applicant?.last_name ?? "",
        avatarUrl: row.applicant?.avatar_url ?? null,
        verificationStatus: row.applicant?.verification_status ?? "unverified",
        phone: row.applicant?.phone ?? null,
      },
      replacementProfile: rp
        ? {
            professionalStatus: rp.professional_status,
            city: rp.city,
            experienceYears: rp.experience_years,
            languages: rp.languages,
            bio: rp.bio,
          }
        : null,
      jobPost: {
        id: row.job_posts.id,
        title: row.job_posts.title,
        city: row.job_posts.city,
        startDate: row.job_posts.start_date,
        endDate: row.job_posts.end_date,
        status: row.job_posts.status,
        positionsCount: row.job_posts.positions_count,
        filledPositionsCount: row.job_posts.filled_positions_count,
      },
    };
  });

  // Notification « nouvelle candidature » : ouvrir l'onglet de la candidature
  // ciblée et la mettre en évidence.
  const highlighted = candidature
    ? applications.find((a) => a.id === candidature)
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Candidatures</h1>
        <p className="text-sm text-muted-foreground">
          Consultez et traitez les candidatures reçues sur vos annonces.
        </p>
      </div>

      <ApplicationList
        applications={applications}
        initialTab={
          highlighted
            ? TAB_FOR_STATUS[highlighted.status] ?? onglet
            : onglet
        }
        highlightId={highlighted?.id}
      />
    </div>
  );
}
