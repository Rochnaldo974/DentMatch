import type { Metadata } from "next";
import { BellOff } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/shell";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { NotificationItem } from "@/components/notifications/notification-item";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const profile = await requireUser();
  const profileHref =
    profile.role === "cabinet"
      ? "/cabinet/profil"
      : profile.role === "admin"
        ? "/admin"
        : "/remplacant/profil";

  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, metadata, title, body, created_at, read_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const items = notifications ?? [];
  const hasUnread = items.some((n) => n.read_at === null);

  return (
    <DashboardShell profile={profile} profileHref={profileHref}>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Notifications"
          title="Notifications"
          description="Suivez l'activité de votre compte."
          action={hasUnread ? <MarkAllReadButton /> : undefined}
        />

        {items.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title="Aucune notification"
            description="Vous serez notifié ici des candidatures, messages et mises à jour de vos remplacements."
          />
        ) : (
          <ul className="space-y-3">
            {items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                role={profile.role}
              />
            ))}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}
