"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  replacementStep1Schema,
  replacementStep2Schema,
  qualifiedDentistStep3Schema,
  studentStep3Schema,
  residentStep3Schema,
  replacementStep4Schema,
  replacementStep5Schema,
  replacementStep7Schema,
  replacementStep9Schema,
  availabilitySchema,
  type ReplacementStep1Input,
  type ReplacementStep2Input,
  type QualifiedDentistStep3Input,
  type StudentStep3Input,
  type ResidentStep3Input,
  type ReplacementStep4Input,
  type ReplacementStep5Input,
  type ReplacementStep7Input,
  type AvailabilityInput,
} from "@/lib/validation/onboarding-remplacant";
import {
  computeProfileCompletion,
  requiredDocumentsComplete,
} from "@/lib/business-rules";
import {
  documentTypesForStatus,
  type ProfessionalStatus,
} from "@/lib/data/reference";
import { z } from "zod";

type Result = { error?: string; success?: boolean };

async function getReplacementUser() {
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

  if (profile?.role !== "replacement_dentist") {
    return { supabase, error: "Réservé aux remplaçants." };
  }
  return { supabase, userId: user.id };
}

type Ctx = { supabase: Awaited<ReturnType<typeof createClient>>; userId: string };

async function advanceStep(ctx: Ctx, step: number) {
  const { data: profile } = await ctx.supabase
    .from("profiles")
    .select("onboarding_step")
    .eq("id", ctx.userId)
    .single();
  if (profile && profile.onboarding_step < step) {
    await ctx.supabase
      .from("profiles")
      .update({ onboarding_step: step })
      .eq("id", ctx.userId);
  }
  revalidatePath("/onboarding");
}

export async function saveReplacementStep1(
  input: ReplacementStep1Input,
): Promise<Result> {
  const parsed = replacementStep1Schema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };

  const ctx = await getReplacementUser();
  if (ctx.error) return { error: ctx.error };
  const c = ctx as Ctx;

  const { error } = await c.supabase.from("replacement_profiles").upsert(
    { user_id: c.userId, professional_status: parsed.data.professionalStatus },
    { onConflict: "user_id" },
  );
  if (error) return { error: "Enregistrement impossible." };

  await advanceStep(c, 1);
  return { success: true };
}

export async function saveReplacementStep2(
  input: ReplacementStep2Input,
): Promise<Result> {
  const parsed = replacementStep2Schema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };

  const ctx = await getReplacementUser();
  if (ctx.error) return { error: ctx.error };
  const c = ctx as Ctx;
  const d = parsed.data;

  const { error: pErr } = await c.supabase
    .from("profiles")
    .update({
      first_name: d.firstName,
      last_name: d.lastName,
      phone: d.phone,
    })
    .eq("id", c.userId);
  if (pErr) return { error: "Enregistrement impossible." };

  const { error } = await c.supabase.from("replacement_profiles").upsert(
    {
      user_id: c.userId,
      birth_date: d.birthDate,
      professional_email: d.professionalEmail,
      address_line: d.addressLine,
      postal_code: d.postalCode,
      city: d.city,
      territory: d.territory,
      bio: d.bio,
    },
    { onConflict: "user_id" },
  );
  if (error) return { error: "Enregistrement impossible." };

  await advanceStep(c, 2);
  return { success: true };
}

export async function saveReplacementStep3(
  status: ProfessionalStatus,
  input: QualifiedDentistStep3Input | StudentStep3Input | ResidentStep3Input,
): Promise<Result> {
  const ctx = await getReplacementUser();
  if (ctx.error) return { error: ctx.error };
  const c = ctx as Ctx;

  if (status === "qualified_dentist") {
    const parsed = qualifiedDentistStep3Schema.safeParse(input);
    if (!parsed.success)
      return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
    const d = parsed.data;
    const { error } = await c.supabase.from("replacement_profiles").upsert(
      {
        user_id: c.userId,
        rpps_number: d.rppsNumber,
        ordinal_number: d.ordinalNumber || null,
        ordinal_department: d.ordinalDepartment,
        graduation_year: d.graduationYear,
        university: d.university,
        current_practice_mode: d.currentPracticeMode,
        has_cps: d.hasCps,
        cps_last_digits: d.cpsLastDigits || null,
        rcp_insurer: d.rcpInsurer,
        rcp_expiration_date: d.rcpExpirationDate,
      },
      { onConflict: "user_id" },
    );
    if (error) return { error: "Enregistrement impossible." };
  } else if (status === "student") {
    const parsed = studentStep3Schema.safeParse(input);
    if (!parsed.success)
      return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
    const d = parsed.data;
    const { error } = await c.supabase.from("replacement_profiles").upsert(
      {
        user_id: c.userId,
        university: d.university,
        student_year: d.studentYear,
        fifth_year_validated: d.fifthYearValidated,
        has_csct: d.hasCsct,
        csct_date: d.csctDate,
        hospital_status: d.hospitalStatus,
        hospital_name: d.hospitalName || null,
        license_expiration_date: d.licenseExpirationDate,
      },
      { onConflict: "user_id" },
    );
    if (error) return { error: "Enregistrement impossible." };
  } else {
    const parsed = residentStep3Schema.safeParse(input);
    if (!parsed.success)
      return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
    const d = parsed.data;
    const { error } = await c.supabase.from("replacement_profiles").upsert(
      {
        user_id: c.userId,
        university: d.university,
        resident_specialty: d.residentSpecialty,
        internship_year: d.internshipYear,
        fifth_year_validated: d.fifthYearValidated,
        has_csct: d.hasCsct,
        attachment_institution: d.attachmentInstitution,
        has_exercise_authorization: d.hasExerciseAuthorization,
        license_expiration_date: d.licenseExpirationDate,
      },
      { onConflict: "user_id" },
    );
    if (error) return { error: "Enregistrement impossible." };
  }

  await advanceStep(c, 3);
  return { success: true };
}

export async function saveReplacementStep4(
  input: ReplacementStep4Input,
): Promise<Result> {
  const parsed = replacementStep4Schema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };

  const ctx = await getReplacementUser();
  if (ctx.error) return { error: ctx.error };
  const c = ctx as Ctx;
  const d = parsed.data;

  // Règle 11 : un étudiant ne peut pas déclarer une compétence spécialisée ;
  // un interne uniquement celle de sa spécialité.
  const { data: rp } = await c.supabase
    .from("replacement_profiles")
    .select("professional_status, resident_specialty")
    .eq("user_id", c.userId)
    .single();

  const { data: specs } = await c.supabase
    .from("specialties")
    .select("id, code, is_specialized")
    .in("code", d.specialties);

  const invalid = (specs ?? []).find((s) => {
    if (!s.is_specialized) return false;
    if (rp?.professional_status === "student") return true;
    if (
      rp?.professional_status === "resident" &&
      s.code !== rp.resident_specialty
    )
      return true;
    return false;
  });
  if (invalid) {
    return {
      error:
        rp?.professional_status === "student"
          ? "Un étudiant autorisé à remplacer ne peut pas déclarer une compétence de spécialiste."
          : "Un interne ne peut déclarer que la spécialité correspondant à son internat.",
    };
  }

  await c.supabase.from("profile_specialties").delete().eq("user_id", c.userId);
  if (specs && specs.length > 0) {
    const { error } = await c.supabase.from("profile_specialties").insert(
      specs.map((s) => ({ user_id: c.userId, specialty_id: s.id })),
    );
    if (error) return { error: "Enregistrement impossible." };
  }

  const { error } = await c.supabase.from("replacement_profiles").upsert(
    {
      user_id: c.userId,
      experience_years: d.experienceYears,
      mastered_procedures: d.masteredProcedures || null,
      excluded_procedures: d.excludedProcedures || null,
      software_used: d.softwareUsed,
      languages: d.languages,
    },
    { onConflict: "user_id" },
  );
  if (error) return { error: "Enregistrement impossible." };

  await advanceStep(c, 4);
  return { success: true };
}

export async function saveReplacementStep5(
  input: ReplacementStep5Input,
): Promise<Result> {
  const parsed = replacementStep5Schema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };

  const ctx = await getReplacementUser();
  if (ctx.error) return { error: ctx.error };
  const c = ctx as Ctx;
  const d = parsed.data;

  await c.supabase.from("mobility_areas").delete().eq("user_id", c.userId);
  const areas = [
    ...d.regions.map((v) => ({ area_type: "region", area_value: v })),
    ...d.departments.map((v) => ({ area_type: "department", area_value: v })),
    ...d.overseasTerritories.map((v) => ({
      area_type: "territory",
      area_value: v,
    })),
  ];
  if (areas.length > 0) {
    const { error } = await c.supabase
      .from("mobility_areas")
      .insert(areas.map((a) => ({ ...a, user_id: c.userId })));
    if (error) return { error: "Enregistrement impossible." };
  }

  const { error } = await c.supabase.from("replacement_profiles").upsert(
    {
      user_id: c.userId,
      mobility_radius_km: d.mobilityRadiusKm,
      national_mobility: d.nationalMobility,
      has_vehicle: d.hasVehicle,
      has_driving_license: d.hasDrivingLicense,
      needs_accommodation: d.needsAccommodation,
      accepts_travel_with_accommodation: d.acceptsTravelWithAccommodation,
      max_travel_duration: d.maxTravelDuration || null,
    },
    { onConflict: "user_id" },
  );
  if (error) return { error: "Enregistrement impossible." };

  await advanceStep(c, 5);
  return { success: true };
}

/** Ajout d'une disponibilité (étape 6 et page Disponibilités). */
export async function addAvailability(
  input: AvailabilityInput,
): Promise<Result> {
  const parsed = availabilitySchema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Disponibilité invalide" };

  const ctx = await getReplacementUser();
  if (ctx.error) return { error: ctx.error };
  const c = ctx as Ctx;
  const d = parsed.data;

  const { error } = await c.supabase.from("availabilities").insert({
    user_id: c.userId,
    type: d.type,
    start_date: d.startDate || null,
    end_date: d.type === "plage" ? d.endDate || null : d.startDate || null,
    recurring_days: d.recurringDays,
    notes: d.notes || null,
  });
  if (error) return { error: "Enregistrement impossible." };

  revalidatePath("/onboarding");
  revalidatePath("/remplacant/disponibilites");
  return { success: true };
}

export async function deleteAvailability(id: string): Promise<Result> {
  const ctx = await getReplacementUser();
  if (ctx.error) return { error: ctx.error };
  const c = ctx as Ctx;

  const { error } = await c.supabase
    .from("availabilities")
    .delete()
    .eq("id", id)
    .eq("user_id", c.userId);
  if (error) return { error: "Suppression impossible." };

  revalidatePath("/onboarding");
  revalidatePath("/remplacant/disponibilites");
  return { success: true };
}

const step6Schema = z.object({
  availabilityPreferences: z.array(z.string()),
});

export async function saveReplacementStep6(input: {
  availabilityPreferences: string[];
}): Promise<Result> {
  const parsed = step6Schema.safeParse(input);
  if (!parsed.success) return { error: "Formulaire invalide" };

  const ctx = await getReplacementUser();
  if (ctx.error) return { error: ctx.error };
  const c = ctx as Ctx;

  const { error } = await c.supabase.from("replacement_profiles").upsert(
    {
      user_id: c.userId,
      availability_preferences: parsed.data.availabilityPreferences,
    },
    { onConflict: "user_id" },
  );
  if (error) return { error: "Enregistrement impossible." };

  await advanceStep(c, 6);
  return { success: true };
}

export async function saveReplacementStep7(
  input: ReplacementStep7Input,
): Promise<Result> {
  const parsed = replacementStep7Schema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };

  const ctx = await getReplacementUser();
  if (ctx.error) return { error: ctx.error };
  const c = ctx as Ctx;
  const d = parsed.data;

  const { error } = await c.supabase.from("replacement_profiles").upsert(
    {
      user_id: c.userId,
      replacement_preferences: d.replacementPreferences,
      min_compensation: d.minCompensation || null,
      prefers_retrocession: d.prefersRetrocession,
      prefers_daily_rate: d.prefersDailyRate,
      min_days_count: d.minDaysCount ?? null,
      preferred_environment: d.preferredEnvironment || null,
      desired_equipment: d.desiredEquipment,
    },
    { onConflict: "user_id" },
  );
  if (error) return { error: "Enregistrement impossible." };

  await advanceStep(c, 7);
  return { success: true };
}

/** Étape 8 (documents) : validation de passage. */
export async function completeReplacementStep8(): Promise<Result> {
  const ctx = await getReplacementUser();
  if (ctx.error) return { error: ctx.error };
  const c = ctx as Ctx;
  await advanceStep(c, 8);
  return { success: true };
}

export async function saveReplacementStep9(input: {
  photo: boolean;
  city: boolean;
  mobility: boolean;
  skills: boolean;
  experience: boolean;
  availability: boolean;
  languages: boolean;
  bio: boolean;
}): Promise<Result> {
  const parsed = replacementStep9Schema.safeParse(input);
  if (!parsed.success) return { error: "Formulaire invalide" };

  const ctx = await getReplacementUser();
  if (ctx.error) return { error: ctx.error };
  const c = ctx as Ctx;

  const { error } = await c.supabase.from("replacement_profiles").upsert(
    { user_id: c.userId, public_visibility: parsed.data },
    { onConflict: "user_id" },
  );
  if (error) return { error: "Enregistrement impossible." };

  await advanceStep(c, 9);
  return { success: true };
}

/** Fin de l'onboarding remplaçant. */
export async function finishReplacementOnboarding(): Promise<Result> {
  const ctx = await getReplacementUser();
  if (ctx.error) return { error: ctx.error };
  const c = ctx as Ctx;

  const { data: rp } = await c.supabase
    .from("replacement_profiles")
    .select("*")
    .eq("user_id", c.userId)
    .single();

  if (!rp || !rp.professional_status || !rp.city) {
    return { error: "Complétez votre profil avant de terminer." };
  }

  const completion = computeProfileCompletion([
    rp.professional_status,
    rp.birth_date,
    rp.city,
    rp.territory,
    rp.bio,
    rp.university,
    rp.experience_years,
    rp.languages,
    rp.mobility_radius_km,
    rp.replacement_preferences,
    rp.professional_status === "qualified_dentist" ? rp.rpps_number : "ok",
    rp.professional_status === "student" ? rp.student_year : "ok",
    rp.professional_status === "resident" ? rp.resident_specialty : "ok",
  ]);

  await c.supabase
    .from("replacement_profiles")
    .update({ profile_completion: completion })
    .eq("user_id", c.userId);

  const { data: documents } = await c.supabase
    .from("documents")
    .select("document_type, status")
    .eq("owner_user_id", c.userId);

  const docsComplete = requiredDocumentsComplete(
    documentTypesForStatus(rp.professional_status),
    documents ?? [],
  );

  // La vérification est MANUELLE : les documents fournis placent le profil
  // « en attente », un administrateur DentMatch attribue le badge vérifié.
  const { error } = await c.supabase
    .from("profiles")
    .update({
      onboarding_completed: true,
      verification_status: docsComplete ? "pending" : "unverified",
    })
    .eq("id", c.userId);

  if (error) return { error: "Finalisation impossible." };

  if (docsComplete) {
    await c.supabase.from("notifications").insert({
      user_id: c.userId,
      type: "profile_verified",
      title: "Documents reçus — vérification en cours",
      body: "Tous vos documents obligatoires sont fournis. L'équipe DentMatch les examine : vous serez notifié dès que votre profil sera vérifié.",
    });
  }

  await c.supabase.rpc("log_audit_event", {
    p_event_type: "onboarding_completed",
    p_entity_type: "profile",
    p_entity_id: c.userId,
    p_metadata: { role: "replacement_dentist", completion },
  });

  revalidatePath("/onboarding");
  return { success: true };
}
