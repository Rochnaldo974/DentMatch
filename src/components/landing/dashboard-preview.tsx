import {
  BadgeCheck,
  Bell,
  CalendarDays,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Timer,
  Users,
} from "lucide-react";
import { LogoMark } from "@/components/shared/logo";
import { APP_NAME } from "@/lib/constants";

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: "Tableau de bord", active: false },
  { icon: FileText, label: "Mes annonces", active: true },
  { icon: Users, label: "Candidatures", active: false },
  { icon: MessageSquare, label: "Messages", active: false },
] as const;

const CANDIDATES = [
  { initials: "SM", name: "Dr Sarah M.", experience: "5 ans d'expérience" },
  { initials: "TL", name: "Dr Thomas L.", experience: "3 ans d'expérience" },
] as const;

function MiniVerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-verified/25 bg-verified-soft px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
      <BadgeCheck className="size-3" />
      Profil vérifié
    </span>
  );
}

/**
 * Aperçu fictif du dashboard cabinet — preuve produit du hero.
 * Purement illustratif : données fictives, masqué des lecteurs d'écran.
 */
export function DashboardPreview() {
  return (
    <div aria-hidden="true" className="relative select-none">
      {/* Cadre double bordure : liseré translucide + surface carte */}
      <div className="rounded-3xl border bg-white/60 p-1.5 shadow-[var(--shadow-float)]">
        <div className="overflow-hidden rounded-2xl border bg-card">
          {/* Barre supérieure */}
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <div className="flex items-center gap-2">
              <LogoMark className="size-5" />
              <span className="text-xs font-semibold text-foreground">
                Espace cabinet
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Bell className="size-3.5 text-muted-foreground" />
              <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
                CV
              </span>
            </div>
          </div>

          <div className="flex">
            {/* Mini-sidebar bleu nuit — rappel du vrai produit */}
            <div className="hidden w-36 shrink-0 flex-col gap-0.5 bg-sidebar p-2 sm:flex">
              {SIDEBAR_ITEMS.map((item) => (
                <span
                  key={item.label}
                  className={
                    item.active
                      ? "flex items-center gap-2 rounded-md bg-sidebar-accent px-2 py-1.5 text-[11px] font-medium text-white"
                      : "flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] text-sidebar-foreground"
                  }
                >
                  <item.icon
                    className={
                      item.active ? "size-3.5 text-sidebar-primary" : "size-3.5"
                    }
                  />
                  {item.label}
                </span>
              ))}
            </div>

            {/* Zone principale */}
            <div className="min-w-0 flex-1 space-y-3 p-3.5 sm:p-4">
              {/* Carte d'annonce */}
              <div className="rounded-xl border bg-background/60 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">
                      Remplacement omnipratique — Lyon 6e
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <CalendarDays className="size-3" />
                      Du 17 au 29 août 2026
                    </p>
                  </div>
                  <span className="rounded-full border border-warning/40 bg-warning-soft px-1.5 py-0.5 text-[10px] font-medium text-warning-foreground">
                    Urgent
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t pt-2.5">
                  <span className="text-[11px] font-medium text-primary">
                    4 candidatures
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Publiée il y a 2 jours
                  </span>
                </div>
              </div>

              {/* Mini-cartes candidats */}
              <div className="grid gap-2 sm:grid-cols-2">
                {CANDIDATES.map((candidate) => (
                  <div
                    key={candidate.name}
                    className="rounded-xl border bg-background/60 p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                        {candidate.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-foreground">
                          {candidate.name}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {candidate.experience}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <MiniVerifiedBadge />
                    </div>
                  </div>
                ))}
              </div>

              {/* Indicateur */}
              <div className="flex items-center gap-2 rounded-xl border bg-background/60 px-3 py-2">
                <Timer className="size-3.5 text-verified" />
                <span className="text-[11px] text-muted-foreground">
                  Réponse moyenne :{" "}
                  <span className="font-semibold text-foreground">4 h</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badge flottant — profil vérifié */}
      <div className="glass absolute -top-4 right-2 flex animate-float items-center gap-2 rounded-full px-3.5 py-2 sm:-right-4">
        <BadgeCheck className="size-4 text-verified" />
        <span className="text-xs font-medium text-foreground">
          Profil vérifié par {APP_NAME}
        </span>
      </div>

      {/* Badge flottant — nouvelle candidature */}
      <div className="glass absolute -bottom-4 left-2 flex animate-float-delayed items-center gap-2 rounded-2xl px-3.5 py-2 sm:-left-4">
        <span className="flex size-7 items-center justify-center rounded-full bg-verified-soft">
          <Bell className="size-3.5 text-accent-foreground" />
        </span>
        <div>
          <p className="text-xs font-medium text-foreground">
            Nouvelle candidature reçue
          </p>
          <p className="text-[10px] text-muted-foreground">Il y a 2 minutes</p>
        </div>
      </div>
    </div>
  );
}
