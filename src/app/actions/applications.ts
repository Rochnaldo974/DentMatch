"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  applicationSchema,
  type ApplicationInput,
} from "@/lib/validation/application";
import { canApply, canWithdrawApplication } from "@/lib/business-rules";
import type { ProfessionalStatus } from "@/lib/data/reference";

type Result = { error?: string; success?: boolean };

/** Candidature à une annonce (règles 2, 3, 4, 11, 12 revérifiées côté serveur). */
export async function applyToJobPost(
  jobPostId: string,
  input: ApplicationInput,
): Promise<Result> {
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "replacement_dentist") {
    return { error: "Réservé aux remplaçants." };
  }

  const { data: rp } = await supabase
    .from("replacement_profiles")
    .select("professional_status, resident_specialty")
    .eq("user_id", user.id)
    .single();

  const { data: post } = await supabase
    .from("job_posts")
    .select("id, status, application_deadline, specialty_id, specialties!job_posts_specialty_id_fkey(code, is_specialized)")
    .eq("id", jobPostId)
    .single();

  if (!post) return { error: "Annonce introuvable." };

  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("job_post_id", jobPostId)
    .eq("applicant_user_id", user.id)
    .maybeSingle();

  const check = canApply({
    onboardingCompleted: profile.onboarding_completed,
    alreadyApplied: Boolean(existing),
    post: {
      status: post.status,
      applicationDeadline: post.application_deadline,
      specialtyCode: post.specialties?.code ?? null,
      specialtyIsSpecialized: post.specialties?.is_specialized,
    },
    professionalStatus: (rp?.professional_status ??
      "qualified_dentist") as ProfessionalStatus,
    residentSpecialty: rp?.resident_specialty,
  });

  if (!check.allowed) {
    return { error: check.reason ?? "Candidature impossible." };
  }

  const { error } = await supabase.from("applications").insert({
    job_post_id: jobPostId,
    applicant_user_id: user.id,
    message: parsed.data.message,
    confirmed_availability: parsed.data.confirmedAvailability,
    expected_compensation: parsed.data.expectedCompensation || null,
    note: parsed.data.note || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Vous avez déjà candidaté à cette annonce." };
    }
    return { error: "Impossible d'envoyer la candidature." };
  }

  await supabase.rpc("log_audit_event", {
    p_event_type: "application_submitted",
    p_entity_type: "job_post",
    p_entity_id: jobPostId,
    p_metadata: {},
  });

  revalidatePath("/remplacant/candidatures");
  revalidatePath(`/remplacant/annonces/${jobPostId}`);
  return { success: true };
}

/** Retrait d'une candidature non acceptée (règle 7). */
export async function withdrawApplication(
  applicationId: string,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: app } = await supabase
    .from("applications")
    .select("id, status, applicant_user_id")
    .eq("id", applicationId)
    .single();

  if (!app || app.applicant_user_id !== user.id) {
    return { error: "Candidature introuvable." };
  }
  if (!canWithdrawApplication(app.status)) {
    return { error: "Cette candidature ne peut plus être retirée." };
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: "withdrawn", withdrawn_at: new Date().toISOString() })
    .eq("id", applicationId);

  if (error) return { error: "Retrait impossible." };

  revalidatePath("/remplacant/candidatures");
  return { success: true };
}

/** Marquer une candidature comme consultée (côté cabinet). */
export async function markApplicationViewed(
  applicationId: string,
): Promise<Result> {
  const supabase = await createClient();
  const { data: app } = await supabase
    .from("applications")
    .select("id, status")
    .eq("id", applicationId)
    .single();

  if (!app) return { error: "Candidature introuvable." };
  if (app.status !== "submitted") return { success: true };

  await supabase
    .from("applications")
    .update({ status: "viewed", viewed_at: new Date().toISOString() })
    .eq("id", applicationId);

  revalidatePath("/cabinet/candidatures");
  return { success: true };
}

/** Refus manuel d'une candidature. */
export async function rejectApplication(
  applicationId: string,
): Promise<Result> {
  const supabase = await createClient();
  const { data: app } = await supabase
    .from("applications")
    .select("id, status")
    .eq("id", applicationId)
    .single();

  if (!app) return { error: "Candidature introuvable." };
  if (!["submitted", "viewed", "shortlisted"].includes(app.status)) {
    return { error: "Cette candidature ne peut plus être refusée." };
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: "rejected", rejected_at: new Date().toISOString() })
    .eq("id", applicationId);

  if (error) return { error: "Refus impossible." };

  const sb = await createClient();
  await sb.rpc("log_audit_event", {
    p_event_type: "application_rejected",
    p_entity_type: "application",
    p_entity_id: applicationId,
    p_metadata: {},
  });

  revalidatePath("/cabinet/candidatures");
  return { success: true };
}

/**
 * Acceptation d'une candidature — déléguée à la fonction SQL transactionnelle
 * accept_application (règles 5, 6, 8, 16, 17, 18).
 */
export async function acceptApplication(
  applicationId: string,
  markFilled: boolean,
): Promise<Result & { conversationId?: string; placementId?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_application", {
    p_application_id: applicationId,
    p_mark_filled: markFilled,
  });

  if (error) {
    const messages: Record<string, string> = {
      CANDIDATURE_INTROUVABLE: "Candidature introuvable.",
      ANNONCE_INTROUVABLE: "Annonce introuvable.",
      NON_AUTORISE: "Vous n'êtes pas autorisé à accepter cette candidature.",
      CANDIDATURE_NON_ACCEPTABLE: "Cette candidature ne peut plus être acceptée.",
      ANNONCE_INDISPONIBLE: "Cette annonce n'est plus disponible.",
      ANNONCE_DEJA_POURVUE: "Toutes les places de cette annonce sont pourvues.",
    };
    const key = Object.keys(messages).find((k) => error.message.includes(k));
    return { error: key ? messages[key] : "L'acceptation a échoué." };
  }

  const result = data as { placement_id?: string; conversation_id?: string };

  revalidatePath("/cabinet/candidatures");
  revalidatePath("/cabinet/remplacements");
  revalidatePath("/messages");
  return {
    success: true,
    placementId: result?.placement_id,
    conversationId: result?.conversation_id,
  };
}

/** Ouvre (ou récupère) la conversation liée à une candidature puis y redirige. */
export async function openApplicationConversation(
  applicationId: string,
): Promise<never | Result> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "get_or_create_application_conversation",
    { p_application_id: applicationId },
  );

  if (error || !data) {
    return { error: "Impossible d'ouvrir la conversation." };
  }
  redirect(`/messages/${data}`);
}

/** Mise à jour de la checklist administrative d'un remplacement. */
export async function updatePlacementChecklist(
  placementId: string,
  checklist: Record<string, boolean>,
): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("placements")
    .update({ administrative_checklist: checklist })
    .eq("id", placementId);

  if (error) return { error: "Mise à jour impossible." };

  revalidatePath("/cabinet/remplacements");
  revalidatePath("/remplacant/remplacements");
  return { success: true };
}

/** Enregistrer / retirer une annonce des favoris. */
export async function toggleSavedJobPost(jobPostId: string): Promise<Result & { saved?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: existing } = await supabase
    .from("saved_job_posts")
    .select("job_post_id")
    .eq("user_id", user.id)
    .eq("job_post_id", jobPostId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("saved_job_posts")
      .delete()
      .eq("user_id", user.id)
      .eq("job_post_id", jobPostId);
    revalidatePath("/remplacant/annonces");
    return { success: true, saved: false };
  }

  const { error } = await supabase
    .from("saved_job_posts")
    .insert({ user_id: user.id, job_post_id: jobPostId });
  if (error) return { error: "Impossible d'enregistrer l'annonce." };

  revalidatePath("/remplacant/annonces");
  return { success: true, saved: true };
}
