import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { JobPostStatusBadge } from "@/components/shared/status-badge";
import { JobPostForm } from "@/components/cabinet/job-post-form";
import type { JobPostInput } from "@/lib/validation/job-post";

export const metadata = { title: "Modifier l'annonce" };

export default async function EditJobPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireRole("cabinet");
  const supabase = await createClient();

  const { data: cabinet } = await supabase
    .from("cabinet_profiles")
    .select("id, city")
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
    .select("*, specialties!job_posts_specialty_id_fkey(code)")
    .eq("id", id)
    .eq("cabinet_id", cabinet.id)
    .maybeSingle();

  if (!post) notFound();

  const defaultValues: Partial<JobPostInput> = {
    title: post.title,
    replacedPractitioner: post.replaced_practitioner ?? "",
    replacementReason: post.replacement_reason ?? "",
    contractType:
      post.contract_type === "salarie" ? "salarie" : "liberal",
    replacementType: post.replacement_type ?? "",
    startDate: post.start_date ?? "",
    endDate: post.end_date ?? "",
    workingDays: post.working_days,
    scheduleText: post.schedule_text ?? "",
    fullTime: post.full_time ?? true,
    specialtyCode: post.specialties?.code ?? "",
    expectedProcedures: post.expected_procedures ?? "",
    experienceRequired: post.experience_required ?? "",
    compensationType: post.compensation_type ?? "",
    compensationValue: post.compensation_value ?? undefined,
    compensationDetails: post.compensation_details ?? "",
    accommodationProvided: post.accommodation_provided,
    travelCovered: post.travel_covered,
    urgent: post.urgent,
    positionsCount: post.positions_count,
    applicationDeadline: post.application_deadline ?? "",
    description: post.description ?? "",
    practicalInfo: post.practical_info ?? "",
    equipment: post.equipment,
    software: post.software ?? "",
    languages: post.languages,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link href={`/cabinet/annonces/${post.id}`}>
            <ArrowLeft aria-hidden />
            Retour à l&apos;annonce
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Modifier l&apos;annonce
          </h1>
          <p className="text-sm text-muted-foreground">{post.title}</p>
        </div>
        <JobPostStatusBadge status={post.status} />
      </div>

      <JobPostForm
        defaultValues={defaultValues}
        jobPostId={post.id}
        cabinetCity={cabinet.city}
      />
    </div>
  );
}
