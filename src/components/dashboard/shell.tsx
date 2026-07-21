import Link from "next/link";
import { LogoMark } from "@/components/shared/logo";
import { Logo } from "@/components/shared/logo";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { MobileDashboardNav } from "@/components/dashboard/mobile-nav";
import { NotificationMenu } from "@/components/dashboard/notification-menu";
import { UserMenu } from "@/components/dashboard/user-menu";
import { APP_NAME, DEMO_MODE, DEMO_DISCLAIMER } from "@/lib/constants";
import type { Profile } from "@/lib/auth";

/**
 * Coque commune des espaces connectés : sidebar bleu nuit, tiroir mobile,
 * barre supérieure translucide avec notifications et menu utilisateur.
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
      {/* Sidebar desktop — bleu nuit, signature de l'espace connecté */}
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col bg-sidebar lg:flex">
        <div className="flex h-16 items-center px-5">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-display"
            aria-label={`${APP_NAME} — accueil`}
          >
            <LogoMark className="size-8" />
            <span className="text-lg font-semibold tracking-tight text-white">
              {APP_NAME}
            </span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav role={profile.role} />
        </div>
        <div className="border-t border-sidebar-border px-5 py-4">
          <p className="text-xs text-sidebar-foreground/60">
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
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
