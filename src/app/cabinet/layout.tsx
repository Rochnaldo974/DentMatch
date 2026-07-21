import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function CabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("cabinet");

  return (
    <DashboardShell
      profile={profile}
      profileHref="/cabinet/profil"
    >
      {children}
    </DashboardShell>
  );
}
