"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  cabinetStep1Schema,
  cabinetStep2Schema,
  cabinetStep3Schema,
  cabinetStep4Schema,
  cabinetStep7Schema,
  type CabinetStep1Input,
  type CabinetStep2Input,
  type CabinetStep3Input,
  type CabinetStep4Input,
  type CabinetStep7Input,
} from "@/lib/validation/onboarding-cabinet";
import {
  computeProfileCompletion,
  requiredDocumentsComplete,
} from "@/lib/business-rules";
import { CABINET_DOCUMENT_TYPES } from "@/lib/data/reference";

type Result = { error?: string; success?: boolean };

async function getCabinetUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Non authentifié." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "cabinet") {
    return { supabase, error: "Réservé aux cabinets." };
  }
  return { supabase, userId: user.id };
}

async function advanceStep(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  step: number,
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_step")
    .eq("id", userId)
    .single();
  if (profile && profile.onboarding_step < step) {
    await supabase
      .from("profiles")
      .update({ onboarding_step: step })
      .eq("id", userId);
  }
  revalidatePath("/onboarding");
}

export async function saveCabinetStep1(
  input: CabinetStep1Input,
): Promise<Result> {
  const parsed = cabinetStep1Schema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };

  const ctx = await getCabinetUser();
  if (ctx.error) return { error: ctx.error };
  const { supabase, userId } = ctx as { supabase: Awaited<ReturnType<typeof createClient>>; userId: string };

  const { error: pErr } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      phone: parsed.data.phone,
    })
    .eq("id", userId);
  if (pErr) return { error: "Enregistrement impossible." };

  const { error } = await supabase.from("cabinet_profiles").upsert(
    {
      user_id: userId,
      manager_role: parsed.data.managerRole,
      manager_email: parsed.data.managerEmail,
    },
    { onConflict: "user_id" },
  );
  if (error) return { error: "Enregistrement impossible." };

  await advanceStep(supabase, userId, 1);
  return { success: true };
}

export async function saveCabinetStep2(
  input: CabinetStep2Input,
): Promise<Result> {
  const parsed = cabinetStep2Schema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };

  const ctx = await getCabinetUser();
  if (ctx.error) return { error: ctx.error };
  const { supabase, userId } = ctx as { supabase: Awaited<ReturnType<typeof createClient>>; userId: string };

  const d = parsed.data;
  const { error } = await supabase.from("cabinet_profiles").upsert(
    {
      user_id: userId,
      name: d.name,
      structure_type: d.structureType,
      siret: d.siret,
      finess: d.finess || null,
      address_line_1: d.addressLine1,
      address_line_2: d.addressLine2 || null,
      postal_code: d.postalCode,
      city: d.city,
      department: d.department,
      region: d.region,
      territory: d.territory,
      phone: d.phone,
      email: d.email,
      website: d.website || null,
    },
    { onConflict: "user_id" },
  );
  if (error) return { error: "Enregistrement impossible." };

  await advanceStep(supabase, userId, 2);
  return { success: true };
}

export async function saveCabinetStep3(
  input: CabinetStep3Input,
): Promise<Result> {
  const parsed = cabinetStep3Schema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };

  const ctx = await getCabinetUser();
  if (ctx.error) return { error: ctx.error };
  const { supabase, userId } = ctx as { supabase: Awaited<ReturnType<typeof createClient>>; userId: string };

  const d = parsed.data;
  const { error } = await supabase.from("cabinet_profiles").upsert(
    {
      user_id: userId,
      description: d.description,
      practitioners_count: d.practitionersCount,
      assistants_count: d.assistantsCount,
      treatment_rooms_count: d.treatmentRoomsCount,
      accessibility: d.accessibility,
      parking: d.parking,
      public_transport: d.publicTransport || null,
      software: d.software || null,
      languages: d.languages,
      environment_type: d.environmentType,
    },
    { onConflict: "user_id" },
  );
  if (error) return { error: "Enregistrement impossible." };

  await advanceStep(supabase, userId, 3);
  return { success: true };
}

export async function saveCabinetStep4(
  input: CabinetStep4Input,
): Promise<Result> {
  const parsed = cabinetStep4Schema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };

  const ctx = await getCabinetUser();
  if (ctx.error) return { error: ctx.error };
  const { supabase, userId } = ctx as { supabase: Awaited<ReturnType<typeof createClient>>; userId: string };

  // Spécialités du cabinet (relation profile_specialties).
  const { data: specs } = await supabase
    .from("specialties")
    .select("id, code")
    .in("code", parsed.data.specialties);

  await supabase.from("profile_specialties").delete().eq("user_id", userId);
  if (specs && specs.length > 0) {
    const { error } = await supabase.from("profile_specialties").insert(
      specs.map((s) => ({ user_id: userId, specialty_id: s.id })),
    );
    if (error) return { error: "Enregistrement impossible." };
  }

  // Équipements.
  const { data: cabinet } = await supabase
    .from("cabinet_profiles")
    .select("id")
    .eq("user_id", userId)
    .single();
  if (!cabinet) return { error: "Complétez d'abord les étapes précédentes." };

  await supabase.from("cabinet_equipment").delete().eq("cabinet_id", cabinet.id);
  if (parsed.data.equipment.length > 0) {
    const { error } = await supabase.from("cabinet_equipment").insert(
      parsed.data.equipment.map((code) => ({
        cabinet_id: cabinet.id,
        equipment_code: code,
      })),
    );
    if (error) return { error: "Enregistrement impossible." };
  }

  await advanceStep(supabase, userId, 4);
  return { success: true };
}

/** Étape 5 (photos) et 6 (documents) : simples validations de passage. */
export async function completeCabinetStep(step: 5 | 6): Promise<Result> {
  const ctx = await getCabinetUser();
  if (ctx.error) return { error: ctx.error };
  const { supabase, userId } = ctx as { supabase: Awaited<ReturnType<typeof createClient>>; userId: string };
  await advanceStep(supabase, userId, step);
  return { success: true };
}

export async function saveCabinetStep7(
  input: CabinetStep7Input,
): Promise<Result> {
  const parsed = cabinetStep7Schema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };

  const ctx = await getCabinetUser();
  if (ctx.error) return { error: ctx.error };
  const { supabase, userId } = ctx as { supabase: Awaited<ReturnType<typeof createClient>>; userId: string };

  const d = parsed.data;
  const { error } = await supabase.from("cabinet_profiles").upsert(
    {
      user_id: userId,
      replacement_types_sought: d.replacementTypesSought,
      search_radius_km: d.searchRadiusKm,
      replacement_frequency: d.replacementFrequency || null,
    },
    { onConflict: "user_id" },
  );
  if (error) return { error: "Enregistrement impossible." };

  await supabase.from("user_preferences").upsert(
    {
      user_id: userId,
      email_notifications: d.emailNotifications,
      in_app_notifications: d.inAppNotifications,
    },
    { onConflict: "user_id" },
  );

  await advanceStep(supabase, userId, 7);
  return { success: true };
}

/** Fin de l'onboarding cabinet : calcule la complétion et le badge de test. */
export async function finishCabinetOnboarding(): Promise<Result> {
  const ctx = await getCabinetUser();
  if (ctx.error) return { error: ctx.error };
  const { supabase, userId } = ctx as { supabase: Awaited<ReturnType<typeof createClient>>; userId: string };

  const { data: cabinet } = await supabase
    .from("cabinet_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!cabinet || !cabinet.name || !cabinet.siret) {
    return { error: "Complétez les informations du cabinet avant de terminer." };
  }

  const completion = computeProfileCompletion([
    cabinet.name,
    cabinet.structure_type,
    cabinet.siret,
    cabinet.description,
    cabinet.address_line_1,
    cabinet.postal_code,
    cabinet.city,
    cabinet.territory,
    cabinet.phone,
    cabinet.email,
    cabinet.practitioners_count,
    cabinet.treatment_rooms_count,
    cabinet.software,
    cabinet.languages,
    cabinet.environment_type,
  ]);

  await supabase
    .from("cabinet_profiles")
    .update({ profile_completion: completion })
    .eq("user_id", userId);

  const { data: documents } = await supabase
    .from("documents")
    .select("document_type, status")
    .eq("owner_user_id", userId);

  const docsComplete = requiredDocumentsComplete(
    CABINET_DOCUMENT_TYPES,
    documents ?? [],
  );

  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_completed: true,
      verification_status: docsComplete ? "verified" : "pending",
    })
    .eq("id", userId);

  if (error) return { error: "Finalisation impossible." };

  if (docsComplete) {
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "profile_verified",
      title: "Profil test vérifié",
      body: "Tous vos documents obligatoires sont fournis. Votre profil de test est vérifié.",
    });
  }

  await supabase.rpc("log_audit_event", {
    p_event_type: "onboarding_completed",
    p_entity_type: "profile",
    p_entity_id: userId,
    p_metadata: { role: "cabinet", completion },
  });

  revalidatePath("/onboarding");
  return { success: true };
}
