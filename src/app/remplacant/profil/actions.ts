"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  basicInfoSchema,
  bioSchema,
  type BasicInfoInput,
  type BioInput,
} from "@/app/remplacant/profil/schemas";

type Result = { error?: string; success?: boolean };

async function getReplacementUserId(): Promise<
  | { supabase: Awaited<ReturnType<typeof createClient>>; userId: string }
  | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "replacement_dentist") {
    return { error: "Réservé aux remplaçants." };
  }
  return { supabase, userId: user.id };
}

/** Mise à jour de l'identité (prénom, nom, téléphone). */
export async function updateBasicInfo(input: BasicInfoInput): Promise<Result> {
  const parsed = basicInfoSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const ctx = await getReplacementUserId();
  if ("error" in ctx) return { error: ctx.error };

  const { error } = await ctx.supabase
    .from("profiles")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      phone: parsed.data.phone,
    })
    .eq("id", ctx.userId);

  if (error) return { error: "Enregistrement impossible." };

  revalidatePath("/remplacant/profil");
  return { success: true };
}

/** Mise à jour de la présentation (bio). */
export async function updateBio(input: BioInput): Promise<Result> {
  const parsed = bioSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const ctx = await getReplacementUserId();
  if ("error" in ctx) return { error: ctx.error };

  const { error } = await ctx.supabase.from("replacement_profiles").upsert(
    { user_id: ctx.userId, bio: parsed.data.bio },
    { onConflict: "user_id" },
  );

  if (error) return { error: "Enregistrement impossible." };

  revalidatePath("/remplacant/profil");
  return { success: true };
}
