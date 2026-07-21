"use server";

import { createClient } from "@/lib/supabase/server";
import { PRIVATE_DOCUMENTS_BUCKET } from "@/lib/constants";

/**
 * Génère une URL signée (10 min) pour qu'un administrateur consulte
 * un document du bucket privé.
 */
export async function adminGetDocumentUrl(
  documentId: string,
): Promise<{ url?: string; error?: string }> {
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

  if (profile?.role !== "admin") {
    return { error: "Réservé aux administrateurs." };
  }

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
