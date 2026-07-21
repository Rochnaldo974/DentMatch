"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { markNotificationRead } from "@/app/actions/notifications";
import { notificationHref } from "@/lib/notification-links";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tables } from "@/types/database";
import type { UserRole } from "@/lib/data/reference";

type Notification = Tables<"notifications">;

/** Cloche de notifications : compteur non lu + aperçu temps réel. */
export function NotificationMenu({
  userId,
  role,
}: {
  userId: string;
  role: UserRole;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    const supabase = createClient();
    const [{ data }, { count }] = await Promise.all([
      supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .is("read_at", null),
    ]);
    setNotifications(data ?? []);
    setUnreadCount(count ?? 0);
  }, []);

  useEffect(() => {
    // Chargement initial différé : l'appel est asynchrone (pas de setState synchrone).
    const initial = setTimeout(() => void load(), 0);
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => load(),
      )
      .subscribe();
    return () => {
      clearTimeout(initial);
      supabase.removeChannel(channel);
    };
  }, [userId, load]);

  function handleOpen(notification: Notification) {
    if (!notification.read_at) {
      // Marquage lu optimiste, sans bloquer la navigation.
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((list) =>
        list.map((n) =>
          n.id === notification.id
            ? { ...n, read_at: new Date().toISOString() }
            : n,
        ),
      );
      void markNotificationRead(notification.id);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unreadCount > 0
              ? `Notifications — ${unreadCount} non lue(s)`
              : "Notifications"
          }
        >
          <Bell className="size-5" aria-hidden="true" />
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Aucune notification pour le moment.
          </p>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} asChild>
              <Link
                href={notificationHref(n.type, n.metadata, role)}
                onClick={() => handleOpen(n)}
                className="flex flex-col items-start gap-0.5"
              >
                <span className="flex w-full items-center gap-2">
                  {!n.read_at ? (
                    <span
                      className="size-2 shrink-0 rounded-full bg-verified"
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="truncate text-sm font-medium">{n.title}</span>
                </span>
                {n.body ? (
                  <span className="line-clamp-2 text-xs text-muted-foreground">
                    {n.body}
                  </span>
                ) : null}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(n.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="justify-center font-medium">
            Voir toutes les notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
