import { requireUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireUser();
  const profileHref =
    profile.role === "cabinet"
      ? "/cabinet/profil"
      : profile.role === "admin"
        ? "/admin"
        : "/remplacant/profil";

  return (
    <DashboardShell profile={profile} profileHref={profileHref}>
      {children}
    </DashboardShell>
  );
}
