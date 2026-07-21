import type { Json } from "@/types/database";
import type { UserRole } from "@/lib/data/reference";

/**
 * Destination d'une notification : chaque notification mène à l'écran concerné
 * (candidature précise, conversation, documents…), selon le rôle du lecteur.
 */
export function notificationHref(
  type: string,
  metadata: Json,
  role: UserRole,
): string {
  const meta = (metadata ?? {}) as Record<string, string | undefined>;
  const isCabinet = role === "cabinet";

  switch (type) {
    case "new_application":
      return meta.application_id
        ? `/cabinet/candidatures?candidature=${meta.application_id}`
        : "/cabinet/candidatures";
    case "application_viewed":
    case "application_accepted":
    case "application_rejected":
      return meta.application_id
        ? `/remplacant/candidatures?candidature=${meta.application_id}`
        : "/remplacant/candidatures";
    case "new_message":
      return meta.conversation_id
        ? `/messages/${meta.conversation_id}`
        : "/messages";
    case "document_rejected":
      return isCabinet ? "/cabinet/documents" : "/remplacant/documents";
    case "profile_verified":
      return isCabinet ? "/cabinet/profil" : "/remplacant/profil";
    case "placement_upcoming":
      return isCabinet ? "/cabinet/remplacements" : "/remplacant/remplacements";
    case "job_post_expiring":
      return meta.job_post_id
        ? `/cabinet/annonces/${meta.job_post_id}`
        : "/cabinet/annonces";
    case "job_post_match":
      return meta.job_post_id
        ? `/remplacant/annonces/${meta.job_post_id}`
        : "/remplacant/annonces";
    default:
      return "/notifications";
  }
}
