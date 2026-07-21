"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sanitizeFileName } from "@/lib/business-rules";
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  DEMO_MODE,
  PRIVATE_DOCUMENTS_BUCKET,
} from "@/lib/constants";
import { DOCUMENT_TYPE_LABELS } from "@/lib/data/reference";

type Result = { error?: string; success?: boolean };

/** Téléversement réel d'un document professionnel (bucket privé). */
export async function uploadDocument(formData: FormData): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const file = formData.get("file") as File | null;
  const documentType = formData.get("documentType") as string | null;
  const ownerType = formData.get("ownerType") as string | null;

  if (!file || !documentType || !ownerType) {
    return { error: "Fichier ou type de document manquant." };
  }
  if (!["cabinet", "replacement_dentist"].includes(ownerType)) {
    return { error: "Type de propriétaire invalide." };
  }
  if (!(documentType in DOCUMENT_TYPE_LABELS)) {
    return { error: "Type de document inconnu." };
  }
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return { error: "Fichier trop volumineux (10 Mo maximum)." };
  }
  if (
    !(ALLOWED_DOCUMENT_MIME_TYPES as readonly string[]).includes(file.type)
  ) {
    return { error: "Format non accepté (PDF, JPG, PNG ou WebP)." };
  }

  const cleanName = sanitizeFileName(file.name || "document");
  const storagePath = `${user.id}/${documentType}/${Date.now()}-${cleanName}`;

  const { error: uploadError } = await supabase.storage
    .from(PRIVATE_DOCUMENTS_BUCKET)
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    return { error: "Le téléversement a échoué. Réessayez." };
  }

  // Remplace un éventuel document existant du même type.
  const { data: existing } = await supabase
    .from("documents")
    .select("id, storage_path")
    .eq("owner_user_id", user.id)
    .eq("document_type", documentType)
    .maybeSingle();

  if (existing?.storage_path) {
    await supabase.storage
      .from(PRIVATE_DOCUMENTS_BUCKET)
      .remove([existing.storage_path]);
  }

  const { error: dbError } = await supabase.from("documents").upsert(
    {
      owner_user_id: user.id,
      owner_type: ownerType,
      document_type: documentType,
      storage_path: storagePath,
      original_name: cleanName,
      mime_type: file.type,
      size_bytes: file.size,
      status: "uploaded",
      is_simulated: false,
      rejection_reason: null,
      verified_at: null,
      verified_by: null,
    },
    { onConflict: "owner_user_id,document_type" },
  );

  if (dbError) {
    await supabase.storage.from(PRIVATE_DOCUMENTS_BUCKET).remove([storagePath]);
    return { error: "Enregistrement impossible. Réessayez." };
  }

  revalidatePath("/onboarding");
  return { success: true };
}

/**
 * « Simuler un document valide » — mode démonstration uniquement (règle 9).
 * Aucun fichier n'est créé : un simple enregistrement marqué is_simulated.
 */
export async function simulateDocument(params: {
  documentType: string;
  ownerType: "cabinet" | "replacement_dentist";
}): Promise<Result> {
  if (!DEMO_MODE) {
    return {
      error: "La simulation de documents n'est disponible qu'en mode démonstration.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  if (!(params.documentType in DOCUMENT_TYPE_LABELS)) {
    return { error: "Type de document inconnu." };
  }

  const { data: existing } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("owner_user_id", user.id)
    .eq("document_type", params.documentType)
    .maybeSingle();

  if (existing?.storage_path) {
    await supabase.storage
      .from(PRIVATE_DOCUMENTS_BUCKET)
      .remove([existing.storage_path]);
  }

  const { error } = await supabase.from("documents").upsert(
    {
      owner_user_id: user.id,
      owner_type: params.ownerType,
      document_type: params.documentType,
      storage_path: null,
      original_name: "document-demo.pdf",
      mime_type: "application/pdf",
      size_bytes: 0,
      status: "verified",
      is_simulated: true,
      rejection_reason: null,
      verified_at: new Date().toISOString(),
    },
    { onConflict: "owner_user_id,document_type" },
  );

  if (error) return { error: "La simulation a échoué. Réessayez." };

  revalidatePath("/onboarding");
  return { success: true };
}

export async function deleteDocument(documentId: string): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: doc } = await supabase
    .from("documents")
    .select("id, storage_path, owner_user_id")
    .eq("id", documentId)
    .single();

  if (!doc || doc.owner_user_id !== user.id) {
    return { error: "Document introuvable." };
  }

  if (doc.storage_path) {
    await supabase.storage
      .from(PRIVATE_DOCUMENTS_BUCKET)
      .remove([doc.storage_path]);
  }

  const { error } = await supabase.from("documents").delete().eq("id", doc.id);
  if (error) return { error: "Suppression impossible." };

  revalidatePath("/onboarding");
  return { success: true };
}

/** URL signée temporaire (10 minutes) pour télécharger son propre document. */
export async function getDocumentDownloadUrl(
  documentId: string,
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: doc } = await supabase
    .from("documents")
    .select("storage_path, is_simulated")
    .eq("id", documentId)
    .single();

  if (!doc) return { error: "Document introuvable." };
  if (doc.is_simulated || !doc.storage_path) {
    return { error: "Ce document est simulé : aucun fichier n'existe." };
  }

  const { data, error } = await supabase.storage
    .from(PRIVATE_DOCUMENTS_BUCKET)
    .createSignedUrl(doc.storage_path, 600);

  if (error || !data) return { error: "Impossible de générer le lien." };
  return { url: data.signedUrl };
}
