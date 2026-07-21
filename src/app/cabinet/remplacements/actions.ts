"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Result = { error?: string; success?: boolean };

/** Récupère un placement appartenant au cabinet de l'utilisateur connecté. */
async function getOwnedPlacement(placementId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Non authentifié." as const };

  const { data: cabinet } = await supabase
    .from("cabinet_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!cabinet) return { supabase, error: "Profil cabinet introuvable." as const };

  const { data: placement } = await supabase
    .from("placements")
    .select("id, status, cabinet_id")
    .eq("id", placementId)
    .single();

  if (!placement || placement.cabinet_id !== cabinet.id) {
    return { supabase, error: "Remplacement introuvable." as const };
  }

  return { supabase, placement };
}

/** Marque un remplacement comme terminé. */
export async function completePlacement(placementId: string): Promise<Result> {
  const ctx = await getOwnedPlacement(placementId);
  if ("error" in ctx && ctx.error) return { error: ctx.error };
  const { supabase, placement } = ctx as Exclude<typeof ctx, { error: string }>;

  if (placement!.status !== "confirmed") {
    return { error: "Seul un remplacement confirmé peut être marqué terminé." };
  }

  const { error } = await supabase
    .from("placements")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", placementId);

  if (error) return { error: "Mise à jour impossible." };

  await supabase.rpc("log_audit_event", {
    p_event_type: "placement_completed",
    p_entity_type: "placement",
    p_entity_id: placementId,
    p_metadata: {},
  });

  revalidatePath("/cabinet/remplacements");
  revalidatePath("/remplacant/remplacements");
  return { success: true };
}

/** Annule un remplacement confirmé. */
export async function cancelPlacement(placementId: string): Promise<Result> {
  const ctx = await getOwnedPlacement(placementId);
  if ("error" in ctx && ctx.error) return { error: ctx.error };
  const { supabase, placement } = ctx as Exclude<typeof ctx, { error: string }>;

  if (placement!.status !== "confirmed") {
    return { error: "Seul un remplacement confirmé peut être annulé." };
  }

  const { error } = await supabase
    .from("placements")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", placementId);

  if (error) return { error: "Annulation impossible." };

  await supabase.rpc("log_audit_event", {
    p_event_type: "placement_cancelled",
    p_entity_type: "placement",
    p_entity_id: placementId,
    p_metadata: {},
  });

  revalidatePath("/cabinet/remplacements");
  revalidatePath("/remplacant/remplacements");
  return { success: true };
}
