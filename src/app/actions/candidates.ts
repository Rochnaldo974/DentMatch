"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Result = { error?: string; success?: boolean };

/**
 * Invitation d'un candidat à postuler sur une annonce publiée du cabinet.
 * Déléguée à la fonction SQL sécurisée invite_candidate (déduplication incluse).
 */
export async function inviteCandidateToJobPost(
  jobPostId: string,
  candidateUserId: string,
): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("invite_candidate", {
    p_job_post_id: jobPostId,
    p_candidate_user_id: candidateUserId,
  });

  if (error) {
    const messages: Record<string, string> = {
      ANNONCE_INTROUVABLE: "Annonce introuvable.",
      NON_AUTORISE: "Vous n'êtes pas autorisé à inviter sur cette annonce.",
      ANNONCE_NON_PUBLIEE: "Publiez l'annonce avant d'inviter des candidats.",
      CANDIDAT_INTROUVABLE: "Ce profil n'est plus disponible.",
      DEJA_INVITE: "Ce candidat a déjà été invité sur cette annonce.",
      DEJA_CANDIDAT: "Ce candidat a déjà postulé à cette annonce.",
    };
    const key = Object.keys(messages).find((k) => error.message.includes(k));
    return { error: key ? messages[key] : "L'invitation a échoué." };
  }

  revalidatePath("/cabinet/remplacants");
  return { success: true };
}
