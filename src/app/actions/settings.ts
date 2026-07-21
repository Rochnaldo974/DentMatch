"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sanitizeFileName } from "@/lib/business-rules";
import {
  ALLOWED_PHOTO_MIME_TYPES,
  MAX_PHOTO_SIZE_BYTES,
  PUBLIC_MEDIA_BUCKET,
} from "@/lib/constants";

type Result = { error?: string; success?: boolean; url?: string };

export async function updateNotificationPreferences(input: {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  marketingEmails: boolean;
}): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase.from("user_preferences").upsert(
    {
      user_id: user.id,
      email_notifications: Boolean(input.emailNotifications),
      in_app_notifications: Boolean(input.inAppNotifications),
      marketing_emails: Boolean(input.marketingEmails),
    },
    { onConflict: "user_id" },
  );

  if (error) return { error: "Enregistrement impossible." };
  revalidatePath("/parametres");
  return { success: true };
}

/** Export des données (préparé pour le MVP : renvoie un JSON des données du compte). */
export async function exportMyData(): Promise<{ error?: string; data?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const [profile, cabinet, replacement, documents, applications, preferences] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("cabinet_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("replacement_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("documents").select("document_type, original_name, status, is_simulated, created_at").eq("owner_user_id", user.id),
      supabase.from("applications").select("*").eq("applicant_user_id", user.id),
      supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

  return {
    data: JSON.stringify(
      {
        exported_at: new Date().toISOString(),
        profile: profile.data,
        cabinet_profile: cabinet.data,
        replacement_profile: replacement.data,
        documents: documents.data,
        applications: applications.data,
        preferences: preferences.data,
      },
      null,
      2,
    ),
  };
}

/**
 * Suppression définitive du compte (confirmation renforcée côté UI).
 * Passe par la fonction SQL delete_own_account (security definer).
 */
export async function deleteMyAccount(confirmation: string): Promise<Result | never> {
  if (confirmation !== "SUPPRIMER") {
    return { error: "Saisissez SUPPRIMER pour confirmer." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase.rpc("delete_own_account");
  if (error) return { error: "La suppression a échoué. Contactez le support." };

  await supabase.auth.signOut();
  redirect("/");
}

/** Téléversement d'une photo publique (avatar ou photo de cabinet). */
export async function uploadPublicPhoto(formData: FormData): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const file = formData.get("file") as File | null;
  const kind = formData.get("kind") as string | null; // "avatar" | photo_type cabinet

  if (!file || !kind) return { error: "Fichier manquant." };
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return { error: "Image trop volumineuse (5 Mo maximum)." };
  }
  if (!(ALLOWED_PHOTO_MIME_TYPES as readonly string[]).includes(file.type)) {
    return { error: "Format non accepté (JPG, PNG ou WebP)." };
  }

  const cleanName = sanitizeFileName(file.name || "photo");
  const storagePath = `${user.id}/${kind}/${Date.now()}-${cleanName}`;

  const { error: uploadError } = await supabase.storage
    .from(PUBLIC_MEDIA_BUCKET)
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) return { error: "Le téléversement a échoué." };

  const {
    data: { publicUrl },
  } = supabase.storage.from(PUBLIC_MEDIA_BUCKET).getPublicUrl(storagePath);

  if (kind === "avatar") {
    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);
  } else {
    const { data: cabinet } = await supabase
      .from("cabinet_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (cabinet) {
      await supabase.from("cabinet_photos").insert({
        cabinet_id: cabinet.id,
        photo_type: kind,
        storage_path: storagePath,
      });
    }
  }

  revalidatePath("/onboarding");
  revalidatePath("/parametres");
  return { success: true, url: publicUrl };
}

export async function deleteCabinetPhoto(photoId: string): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: photo } = await supabase
    .from("cabinet_photos")
    .select("id, storage_path, cabinet_id, cabinet_profiles!inner(user_id)")
    .eq("id", photoId)
    .single();

  if (!photo || photo.cabinet_profiles.user_id !== user.id) {
    return { error: "Photo introuvable." };
  }

  await supabase.storage.from(PUBLIC_MEDIA_BUCKET).remove([photo.storage_path]);
  await supabase.from("cabinet_photos").delete().eq("id", photoId);

  revalidatePath("/onboarding");
  return { success: true };
}
