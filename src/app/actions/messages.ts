"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { messageSchema } from "@/lib/validation/application";

type Result = { error?: string; success?: boolean };

/** Envoi d'un message (RLS : seul un membre de la conversation peut insérer). */
export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<Result> {
  const parsed = messageSchema.safeParse({ content });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Message invalide" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: parsed.data.content,
  });

  if (error) return { error: "Impossible d'envoyer le message." };
  return { success: true };
}

/** Marque la conversation comme lue pour l'utilisateur courant. */
export async function markConversationRead(
  conversationId: string,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id);

  revalidatePath("/messages");
  return { success: true };
}
