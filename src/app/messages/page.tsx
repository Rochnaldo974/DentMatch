import type { Metadata } from "next";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Messages",
};

type ConversationListItem = {
  id: string;
  otherName: string;
  otherAvatarUrl: string | null;
  jobPostTitle: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export default async function MessagesPage() {
  const profile = await requireUser();
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("conversation_members")
    .select("conversation_id, last_read_at")
    .eq("user_id", profile.id);

  const conversationIds = (memberships ?? []).map((m) => m.conversation_id);

  let items: ConversationListItem[] = [];

  if (conversationIds.length > 0) {
    const [{ data: conversations }, { data: otherMembers }, { data: messages }] =
      await Promise.all([
        supabase
          .from("conversations")
          .select("id, updated_at, job_posts(title)")
          .in("id", conversationIds),
        supabase
          .from("conversation_members")
          .select(
            "conversation_id, user_id, profiles(first_name, last_name, avatar_url)",
          )
          .in("conversation_id", conversationIds)
          .neq("user_id", profile.id),
        supabase
          .from("messages")
          .select("conversation_id, content, created_at, sender_id")
          .in("conversation_id", conversationIds)
          .order("created_at", { ascending: false })
          .limit(500),
      ]);

    const lastReadByConversation = new Map(
      (memberships ?? []).map((m) => [m.conversation_id, m.last_read_at]),
    );
    const otherByConversation = new Map(
      (otherMembers ?? []).map((m) => [m.conversation_id, m]),
    );

    // Agrégation JS : dernier message + compteur de non-lus par conversation.
    const lastMessageByConversation = new Map<
      string,
      { content: string; created_at: string }
    >();
    const unreadByConversation = new Map<string, number>();
    for (const message of messages ?? []) {
      if (!lastMessageByConversation.has(message.conversation_id)) {
        lastMessageByConversation.set(message.conversation_id, {
          content: message.content,
          created_at: message.created_at,
        });
      }
      const lastRead = lastReadByConversation.get(message.conversation_id);
      if (
        message.sender_id !== profile.id &&
        (!lastRead || message.created_at > lastRead)
      ) {
        unreadByConversation.set(
          message.conversation_id,
          (unreadByConversation.get(message.conversation_id) ?? 0) + 1,
        );
      }
    }

    items = (conversations ?? [])
      .map((conversation) => {
        const other = otherByConversation.get(conversation.id);
        const otherProfile = other?.profiles;
        const last = lastMessageByConversation.get(conversation.id) ?? null;
        return {
          id: conversation.id,
          otherName: otherProfile
            ? `${otherProfile.first_name} ${otherProfile.last_name}`.trim()
            : "Interlocuteur",
          otherAvatarUrl: otherProfile?.avatar_url ?? null,
          jobPostTitle: conversation.job_posts?.title ?? null,
          lastMessage: last?.content ?? null,
          lastMessageAt: last?.created_at ?? conversation.updated_at,
          unreadCount: unreadByConversation.get(conversation.id) ?? 0,
        };
      })
      .sort((a, b) =>
        (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""),
      );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Échangez avec vos interlocuteurs autour des annonces et des
          remplacements.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="Aucune conversation"
          description="Les conversations s'ouvrent lorsqu'une candidature est acceptée ou qu'un échange est initié."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const initials =
              item.otherName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part.charAt(0).toUpperCase())
                .join("") || "DM";
            return (
              <li key={item.id}>
                <Link
                  href={`/messages/${item.id}`}
                  className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <Avatar size="lg">
                    {item.otherAvatarUrl ? (
                      <AvatarImage src={item.otherAvatarUrl} alt="" />
                    ) : null}
                    <AvatarFallback className="bg-secondary text-sm font-semibold text-secondary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate text-sm font-semibold">
                        {item.otherName}
                      </p>
                      {item.lastMessageAt ? (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.lastMessageAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      ) : null}
                    </div>
                    {item.jobPostTitle ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {item.jobPostTitle}
                      </p>
                    ) : null}
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="line-clamp-1 text-sm text-muted-foreground">
                        {item.lastMessage ?? "Aucun message pour le moment"}
                      </p>
                      {item.unreadCount > 0 ? (
                        <span
                          className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
                          aria-label={`${item.unreadCount} message(s) non lu(s)`}
                        >
                          {item.unreadCount > 9 ? "9+" : item.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
