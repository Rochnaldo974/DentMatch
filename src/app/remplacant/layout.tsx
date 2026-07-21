import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function RemplacantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("replacement_dentist");

  return (
    <DashboardShell
      profile={profile}
      profileHref="/remplacant/profil"
    >
      {children}
    </DashboardShell>
  );
}
