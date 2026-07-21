"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarCheck, Megaphone, SendHorizonal } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markConversationRead } from "@/app/actions/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  conversation_id: string;
  content: string;
  created_at: string;
  sender_id: string;
};

export function ConversationPanel({
  conversationId,
  currentUserId,
  otherMember,
  jobPostTitle,
  jobPostHref,
  placementHref,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  otherMember: { name: string; avatarUrl: string | null };
  jobPostTitle: string | null;
  jobPostHref: string | null;
  placementHref: string | null;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // Défilement en bas au montage et à chaque nouveau message.
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Temps réel : nouveaux messages de la conversation.
  useEffect(() => {
    markConversationRead(conversationId);

    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            // Remplace le message optimiste correspondant s'il existe.
            const optimisticIndex = prev.findIndex(
              (m) =>
                m.id.startsWith("temp-") &&
                m.sender_id === incoming.sender_id &&
                m.content === incoming.content,
            );
            if (optimisticIndex !== -1) {
              const next = [...prev];
              next[optimisticIndex] = incoming;
              return next;
            }
            return [...prev, incoming];
          });
          markConversationRead(conversationId);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function handleSend() {
    const content = draft.trim();
    if (!content || content.length > MAX_MESSAGE_LENGTH || sending) return;

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      content,
      created_at: new Date().toISOString(),
      sender_id: currentUserId,
    };

    setSending(true);
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");

    const result = await sendMessage(conversationId, content);
    setSending(false);

    if (result.error) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(content);
      toast.error(result.error);
    }
  }

  const initials =
    otherMember.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "DM";

  return (
    <div className="flex h-[calc(100svh-12rem)] min-h-[420px] flex-col overflow-hidden rounded-xl border bg-card">
      {/* En-tête */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          asChild
        >
          <Link href="/messages" aria-label="Retour aux conversations">
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <Avatar>
          {otherMember.avatarUrl ? (
            <AvatarImage src={otherMember.avatarUrl} alt="" />
          ) : null}
          <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{otherMember.name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            {jobPostTitle ? (
              jobPostHref ? (
                <Link
                  href={jobPostHref}
                  className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <Badge
                    variant="secondary"
                    className="max-w-56 gap-1 hover:bg-secondary/80"
                  >
                    <Megaphone className="size-3" aria-hidden="true" />
                    <span className="truncate">{jobPostTitle}</span>
                  </Badge>
                </Link>
              ) : (
                <Badge variant="secondary" className="max-w-56 gap-1">
                  <Megaphone className="size-3" aria-hidden="true" />
                  <span className="truncate">{jobPostTitle}</span>
                </Badge>
              )
            ) : null}
            {placementHref ? (
              <Link
                href={placementHref}
                className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Badge variant="outline" className="gap-1 hover:bg-muted">
                  <CalendarCheck className="size-3" aria-hidden="true" />
                  Remplacement
                </Badge>
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Écrivez le premier message.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message, index) => {
              const isMine = message.sender_id === currentUserId;
              const previous = index > 0 ? messages[index - 1] : null;
              const showDateSeparator =
                !previous ||
                !isSameDay(
                  new Date(previous.created_at),
                  new Date(message.created_at),
                );
              return (
                <div key={message.id} className="flex flex-col gap-3">
                  {showDateSeparator ? (
                    <p className="py-1 text-center text-xs font-medium text-muted-foreground">
                      {format(new Date(message.created_at), "EEEE d MMMM", {
                        locale: fr,
                      })}
                    </p>
                  ) : null}
                  <div
                    className={cn(
                      "flex max-w-[80%] flex-col gap-0.5 sm:max-w-[65%]",
                      isMine ? "items-end self-end" : "items-start self-start",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2 text-sm break-words whitespace-pre-wrap",
                        isMine
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-muted",
                      )}
                    >
                      {message.content}
                    </div>
                    <span className="px-1 text-[11px] text-muted-foreground">
                      {format(new Date(message.created_at), "HH:mm", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Saisie */}
      <div className="border-t px-4 py-3">
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder="Écrivez votre message…"
              aria-label="Votre message"
              className="max-h-36 min-h-9 resize-none py-2"
            />
            {draft.length >= MAX_MESSAGE_LENGTH - 200 ? (
              <p
                className={cn(
                  "mt-1 text-right text-xs",
                  draft.length >= MAX_MESSAGE_LENGTH
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {draft.length}/{MAX_MESSAGE_LENGTH}
              </p>
            ) : null}
          </div>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={
              sending ||
              draft.trim().length === 0 ||
              draft.length > MAX_MESSAGE_LENGTH
            }
            aria-label="Envoyer"
          >
            <SendHorizonal className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
