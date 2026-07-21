"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { jobPostSchema, type JobPostInput } from "@/lib/validation/job-post";
import type { TablesInsert } from "@/types/database";

type Result = { error?: string; success?: boolean; jobPostId?: string };

async function getCabinetContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Non authentifié." as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "cabinet") {
    return { supabase, error: "Réservé aux cabinets." as const };
  }
  if (!profile.onboarding_completed) {
    return {
      supabase,
      error: "Terminez votre onboarding avant de publier une annonce." as const,
    };
  }

  const { data: cabinet } = await supabase
    .from("cabinet_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!cabinet) return { supabase, error: "Profil cabinet introuvable." as const };

  return { supabase, user, cabinet };
}

async function jobPostRowFromInput(
  input: JobPostInput,
  cabinet: { id: string; city: string | null; postal_code: string | null; department: string | null; region: string | null; territory: string | null },
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<TablesInsert<"job_posts">> {
  let specialtyId: string | null = null;
  if (input.specialtyCode) {
    const { data: spec } = await supabase
      .from("specialties")
      .select("id")
      .eq("code", input.specialtyCode)
      .single();
    specialtyId = spec?.id ?? null;
  }

  return {
    cabinet_id: cabinet.id,
    created_by: userId,
    title: input.title,
    description: input.description,
    replaced_practitioner: input.replacedPractitioner || null,
    replacement_reason: input.replacementReason,
    contract_type: input.contractType,
    replacement_type: input.replacementType,
    start_date: input.startDate,
    end_date: input.endDate,
    working_days: input.workingDays,
    schedule_text: input.scheduleText || null,
    full_time: input.fullTime,
    specialty_id: specialtyId,
    expected_procedures: input.expectedProcedures || null,
    experience_required: input.experienceRequired || null,
    compensation_type: input.compensationType,
    compensation_value: input.compensationValue ?? null,
    compensation_details: input.compensationDetails || null,
    accommodation_provided: input.accommodationProvided,
    travel_covered: input.travelCovered,
    urgent: input.urgent,
    positions_count: input.positionsCount,
    application_deadline: input.applicationDeadline || null,
    practical_info: input.practicalInfo || null,
    equipment: input.equipment,
    software: input.software || null,
    languages: input.languages,
    city: cabinet.city,
    postal_code: cabinet.postal_code,
    department: cabinet.department,
    region: cabinet.region,
    territory: cabinet.territory,
  };
}

/** Création d'une annonce — en brouillon ou publiée immédiatement. */
export async function createJobPost(
  input: JobPostInput,
  publish: boolean,
): Promise<Result> {
  const parsed = jobPostSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const ctx = await getCabinetContext();
  if ("error" in ctx && ctx.error) return { error: ctx.error };
  const { supabase, user, cabinet } = ctx as Exclude<typeof ctx, { error: string }>;

  const row = await jobPostRowFromInput(parsed.data, cabinet, user!.id, supabase);
  row.status = publish ? "published" : "draft";
  if (publish) row.published_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("job_posts")
    .insert(row)
    .select("id")
    .single();

  if (error || !data) return { error: "Impossible d'enregistrer l'annonce." };

  await supabase.rpc("log_audit_event", {
    p_event_type: publish ? "job_post_published" : "job_post_drafted",
    p_entity_type: "job_post",
    p_entity_id: data.id,
    p_metadata: {},
  });

  revalidatePath("/cabinet/annonces");
  return { success: true, jobPostId: data.id };
}

/** Mise à jour d'une annonce existante (brouillon ou publiée). */
export async function updateJobPost(
  jobPostId: string,
  input: JobPostInput,
  publish: boolean,
): Promise<Result> {
  const parsed = jobPostSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const ctx = await getCabinetContext();
  if ("error" in ctx && ctx.error) return { error: ctx.error };
  const { supabase, user, cabinet } = ctx as Exclude<typeof ctx, { error: string }>;

  const { data: existing } = await supabase
    .from("job_posts")
    .select("id, status, cabinet_id, published_at")
    .eq("id", jobPostId)
    .single();

  if (!existing || existing.cabinet_id !== cabinet.id) {
    return { error: "Annonce introuvable." };
  }

  const row = await jobPostRowFromInput(parsed.data, cabinet, user!.id, supabase);
  if (publish && existing.status === "draft") {
    row.status = "published";
    row.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("job_posts")
    .update(row)
    .eq("id", jobPostId);

  if (error) return { error: "Impossible de mettre à jour l'annonce." };

  revalidatePath("/cabinet/annonces");
  revalidatePath(`/cabinet/annonces/${jobPostId}`);
  return { success: true, jobPostId };
}

/** Changement de statut : fermer, archiver, annuler, republier. */
export async function changeJobPostStatus(
  jobPostId: string,
  status: "published" | "filled" | "archived" | "cancelled" | "expired",
): Promise<Result> {
  const ctx = await getCabinetContext();
  if ("error" in ctx && ctx.error) return { error: ctx.error };
  const { supabase, cabinet } = ctx as Exclude<typeof ctx, { error: string }>;

  const { data: existing } = await supabase
    .from("job_posts")
    .select("id, cabinet_id, status")
    .eq("id", jobPostId)
    .single();

  if (!existing || existing.cabinet_id !== cabinet.id) {
    return { error: "Annonce introuvable." };
  }

  const { error } = await supabase
    .from("job_posts")
    .update({
      status,
      published_at:
        status === "published" ? new Date().toISOString() : undefined,
    })
    .eq("id", jobPostId);

  if (error) return { error: "Changement de statut impossible." };

  await supabase.rpc("log_audit_event", {
    p_event_type: `job_post_${status}`,
    p_entity_type: "job_post",
    p_entity_id: jobPostId,
    p_metadata: { previous_status: existing.status },
  });

  revalidatePath("/cabinet/annonces");
  return { success: true };
}

/** Duplication d'une annonce en brouillon. */
export async function duplicateJobPost(jobPostId: string): Promise<Result> {
  const ctx = await getCabinetContext();
  if ("error" in ctx && ctx.error) return { error: ctx.error };
  const { supabase, user, cabinet } = ctx as Exclude<typeof ctx, { error: string }>;

  const { data: source } = await supabase
    .from("job_posts")
    .select("*")
    .eq("id", jobPostId)
    .single();

  if (!source || source.cabinet_id !== cabinet.id) {
    return { error: "Annonce introuvable." };
  }

  const rest: Record<string, unknown> = { ...source };
  delete rest.id;
  delete rest.created_at;
  delete rest.updated_at;
  delete rest.published_at;
  delete rest.filled_positions_count;

  const copy = {
    ...rest,
    cabinet_id: source.cabinet_id,
    title: `${source.title} (copie)`,
    status: "draft",
    created_by: user!.id,
    published_at: null,
    filled_positions_count: 0,
  } as TablesInsert<"job_posts">;

  const { data, error } = await supabase
    .from("job_posts")
    .insert(copy)
    .select("id")
    .single();

  if (error || !data) return { error: "Duplication impossible." };

  revalidatePath("/cabinet/annonces");
  return { success: true, jobPostId: data.id };
}

/** Suppression définitive (avec confirmation côté UI). */
export async function deleteJobPost(jobPostId: string): Promise<Result> {
  const ctx = await getCabinetContext();
  if ("error" in ctx && ctx.error) return { error: ctx.error };
  const { supabase, cabinet } = ctx as Exclude<typeof ctx, { error: string }>;

  const { data: existing } = await supabase
    .from("job_posts")
    .select("id, cabinet_id")
    .eq("id", jobPostId)
    .single();

  if (!existing || existing.cabinet_id !== cabinet.id) {
    return { error: "Annonce introuvable." };
  }

  const { error } = await supabase.from("job_posts").delete().eq("id", jobPostId);
  if (error) return { error: "Suppression impossible." };

  await supabase.rpc("log_audit_event", {
    p_event_type: "job_post_deleted",
    p_entity_type: "job_post",
    p_entity_id: jobPostId,
    p_metadata: {},
  });

  revalidatePath("/cabinet/annonces");
  return { success: true };
}
