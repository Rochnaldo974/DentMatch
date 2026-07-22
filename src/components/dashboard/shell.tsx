import { Logo } from "@/components/shared/logo";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { MobileDashboardNav } from "@/components/dashboard/mobile-nav";
import { NotificationMenu } from "@/components/dashboard/notification-menu";
import { UserMenu } from "@/components/dashboard/user-menu";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { createClient } from "@/lib/supabase/server";
import { APP_NAME, DEMO_MODE, DEMO_DISCLAIMER } from "@/lib/constants";
import {
  PROFESSIONAL_STATUS_LABELS,
  type ProfessionalStatus,
} from "@/lib/data/reference";
import type { Profile } from "@/lib/auth";

/** Cartouche d'identité affiché en tête de sidebar (façon bloc-titre). */
async function IdentityCartouche({ profile }: { profile: Profile }) {
  const supabase = await createClient();
  let eyebrow = "Administration";
  let title = `${profile.first_name} ${profile.last_name}`.trim() || APP_NAME;
  let subtitle: string | null = null;

  if (profile.role === "cabinet") {
    const { data: cabinet } = await supabase
      .from("cabinet_profiles")
      .select("name, city")
      .eq("user_id", profile.id)
      .maybeSingle();
    eyebrow = "Cabinet";
    title = cabinet?.name || title;
    subtitle = cabinet?.city ?? null;
  } else if (profile.role === "replacement_dentist") {
    const { data: rp } = await supabase
      .from("replacement_profiles")
      .select("professional_status")
      .eq("user_id", profile.id)
      .maybeSingle();
    eyebrow = "Remplaçant(e)";
    subtitle = rp?.professional_status
      ? PROFESSIONAL_STATUS_LABELS[rp.professional_status as ProfessionalStatus]
      : null;
  }

  return (
    <div className="mx-3 mb-3 rounded-xl border border-border/70 bg-card/80 px-3.5 py-3 shadow-xs">
      <p className="eyebrow mb-1.5">{eyebrow}</p>
      <p className="truncate text-sm font-semibold">{title}</p>
      {subtitle ? (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
      <div className="mt-2">
        <VerificationBadge status={profile.verification_status} short />
      </div>
    </div>
  );
}

/**
 * Coque commune des espaces connectés : sidebar claire en verre dépoli avec
 * cartouche d'identité, tiroir mobile, barre supérieure translucide.
 * La navigation est dérivée du rôle côté client (les composants d'icônes
 * ne peuvent pas être passés du serveur au client).
 */
export function DashboardShell({
  profile,
  profileHref,
  children,
}: {
  profile: Profile;
  profileHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh w-full">
      {/* Sidebar desktop — claire, givrée, accent turquoise */}
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-border/60 bg-white/45 backdrop-blur-xl lg:flex">
        <div className="px-5 py-5">
          <Logo />
        </div>
        <IdentityCartouche profile={profile} />
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <SidebarNav role={profile.role} />
        </div>
        <div className="border-t border-border/60 px-5 py-4">
          <p className="text-xs text-muted-foreground">
            {APP_NAME} — MVP de démonstration
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barre supérieure translucide */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2">
            <MobileDashboardNav role={profile.role} />
            <div className="lg:hidden">
              <Logo />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <NotificationMenu userId={profile.id} role={profile.role} />
            <UserMenu
              firstName={profile.first_name}
              lastName={profile.last_name}
              avatarUrl={profile.avatar_url}
              profileHref={profileHref}
            />
          </div>
        </header>

        {DEMO_MODE ? (
          <div className="border-b border-warning/30 bg-warning-soft px-4 py-2 text-center text-xs text-warning-foreground sm:px-6">
            {DEMO_DISCLAIMER}
          </div>
        ) : null}

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="animate-rise mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
