"use client";

import { useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { markNotificationRead } from "@/app/actions/notifications";
import { notificationHref } from "@/lib/notification-links";
import type { Tables } from "@/types/database";
import type { UserRole } from "@/lib/data/reference";

export function NotificationItem({
  notification,
  role,
}: {
  notification: Pick<
    Tables<"notifications">,
    "id" | "type" | "metadata" | "title" | "body" | "created_at" | "read_at"
  >;
  role: UserRole;
}) {
  const [isPending, startTransition] = useTransition();
  const unread = notification.read_at === null;
  const href = notificationHref(notification.type, notification.metadata, role);

  function handleMarkRead() {
    startTransition(async () => {
      const result = await markNotificationRead(notification.id);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors duration-150 hover:border-primary/40",
        unread && "border-primary/30",
      )}
    >
      <span
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          unread ? "bg-primary" : "bg-transparent",
        )}
        aria-hidden="true"
      />
      {/* Le clic ouvre l'écran concerné et marque la notification comme lue. */}
      <Link
        href={href}
        onClick={() => {
          if (unread) void markNotificationRead(notification.id);
        }}
        className="min-w-0 flex-1 space-y-0.5"
      >
        <p className={cn("text-sm", unread ? "font-semibold" : "font-medium")}>
          {notification.title}
        </p>
        {notification.body ? (
          <p className="text-sm text-muted-foreground">{notification.body}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
            locale: fr,
          })}
        </p>
      </Link>
      {unread ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkRead}
            disabled={isPending}
            className="hidden shrink-0 sm:inline-flex"
          >
            <Check aria-hidden="true" />
            Marquer comme lu
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleMarkRead}
            disabled={isPending}
            aria-label="Marquer comme lu"
            title="Marquer comme lu"
            className="shrink-0 sm:hidden"
          >
            <Check aria-hidden="true" />
          </Button>
        </>
      ) : null}
    </li>
  );
}
