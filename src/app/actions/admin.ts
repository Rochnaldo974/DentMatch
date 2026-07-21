"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Result = { error?: string; success?: boolean };

async function requireAdminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Non authentifié." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { supabase, error: "Réservé aux administrateurs." };
  }
  return { supabase, userId: user.id };
}

export async function adminVerifyDocument(documentId: string): Promise<Result> {
  const ctx = await requireAdminClient();
  if (ctx.error) return { error: ctx.error };

  const { error } = await ctx.supabase
    .from("documents")
    .update({
      status: "verified",
      verified_at: new Date().toISOString(),
      verified_by: ctx.userId,
      rejection_reason: null,
    })
    .eq("id", documentId);

  if (error) return { error: "Validation impossible." };

  await ctx.supabase.rpc("log_audit_event", {
    p_event_type: "document_verified",
    p_entity_type: "document",
    p_entity_id: documentId,
    p_metadata: {},
  });

  revalidatePath("/admin/documents");
  return { success: true };
}

export async function adminRejectDocument(
  documentId: string,
  reason: string,
): Promise<Result> {
  if (!reason.trim()) return { error: "Le motif de refus est requis." };

  const ctx = await requireAdminClient();
  if (ctx.error) return { error: ctx.error };

  const { error } = await ctx.supabase
    .from("documents")
    .update({
      status: "rejected",
      rejection_reason: reason.trim().slice(0, 500),
      verified_at: null,
      verified_by: ctx.userId,
    })
    .eq("id", documentId);

  if (error) return { error: "Refus impossible." };

  await ctx.supabase.rpc("log_audit_event", {
    p_event_type: "document_rejected",
    p_entity_type: "document",
    p_entity_id: documentId,
    p_metadata: { reason: reason.trim().slice(0, 500) },
  });

  revalidatePath("/admin/documents");
  return { success: true };
}

export async function adminSuspendJobPost(jobPostId: string): Promise<Result> {
  const ctx = await requireAdminClient();
  if (ctx.error) return { error: ctx.error };

  const { error } = await ctx.supabase
    .from("job_posts")
    .update({ status: "suspended" })
    .eq("id", jobPostId);

  if (error) return { error: "Suspension impossible." };

  await ctx.supabase.rpc("log_audit_event", {
    p_event_type: "job_post_suspended",
    p_entity_type: "job_post",
    p_entity_id: jobPostId,
    p_metadata: {},
  });

  revalidatePath("/admin/annonces");
  return { success: true };
}

export async function adminSetProfileVerification(
  userId: string,
  status: "verified" | "rejected" | "pending",
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (ctx.error) return { error: ctx.error };

  const { error } = await ctx.supabase
    .from("profiles")
    .update({ verification_status: status })
    .eq("id", userId);

  if (error) return { error: "Mise à jour impossible." };

  if (status === "verified") {
    await ctx.supabase.from("notifications").insert({
      user_id: userId,
      type: "profile_verified",
      title: "Profil vérifié par DentMatch",
      body: "Votre profil a été vérifié. Le badge « Profil vérifié » est maintenant visible.",
    });
  }

  await ctx.supabase.rpc("log_audit_event", {
    p_event_type: `profile_verification_${status}`,
    p_entity_type: "profile",
    p_entity_id: userId,
    p_metadata: {},
  });

  revalidatePath("/admin/utilisateurs");
  return { success: true };
}
