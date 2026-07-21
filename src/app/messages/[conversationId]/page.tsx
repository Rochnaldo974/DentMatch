import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ConversationPanel } from "@/components/messaging/conversation-panel";

export const metadata: Metadata = {
  title: "Conversation",
};

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const profile = await requireUser();
  const supabase = await createClient();

  // Vérifie l'appartenance à la conversation.
  const { data: membership } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!membership) notFound();

  const [{ data: conversation }, { data: otherMember }, { data: lastMessages }] =
    await Promise.all([
      supabase
        .from("conversations")
        .select("id, placement_id, job_posts(id, title)")
        .eq("id", conversationId)
        .maybeSingle(),
      supabase
        .from("conversation_members")
        .select("user_id, profiles(first_name, last_name, avatar_url)")
        .eq("conversation_id", conversationId)
        .neq("user_id", profile.id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("messages")
        .select("id, conversation_id, content, created_at, sender_id")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

  if (!conversation) notFound();

  const otherProfile = otherMember?.profiles ?? null;
  const otherName = otherProfile
    ? `${otherProfile.first_name} ${otherProfile.last_name}`.trim()
    : "Interlocuteur";

  const jobPost = conversation.job_posts;
  const jobPostHref =
    jobPost && profile.role === "cabinet"
      ? `/cabinet/annonces/${jobPost.id}`
      : jobPost && profile.role === "replacement_dentist"
        ? `/remplacant/annonces/${jobPost.id}`
        : null;
  const placementHref = conversation.placement_id
    ? profile.role === "cabinet"
      ? "/cabinet/remplacements"
      : profile.role === "replacement_dentist"
        ? "/remplacant/remplacements"
        : null
    : null;

  // Les 100 derniers messages, remis en ordre chronologique.
  const initialMessages = (lastMessages ?? []).slice().reverse();

  return (
    <ConversationPanel
      conversationId={conversationId}
      currentUserId={profile.id}
      otherMember={{ name: otherName, avatarUrl: otherProfile?.avatar_url ?? null }}
      jobPostTitle={jobPost?.title ?? null}
      jobPostHref={jobPostHref}
      placementHref={placementHref}
      initialMessages={initialMessages}
    />
  );
}
