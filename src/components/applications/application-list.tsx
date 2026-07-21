"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ApplicationCard,
  type CabinetApplicationItem,
} from "@/components/applications/application-card";
import type { ApplicationStatus } from "@/lib/data/reference";

const TABS: {
  value: string;
  label: string;
  statuses: ApplicationStatus[];
  emptyTitle: string;
  emptyDescription: string;
}[] = [
  {
    value: "nouvelles",
    label: "Nouvelles",
    statuses: ["submitted"],
    emptyTitle: "Aucune nouvelle candidature",
    emptyDescription:
      "Les candidatures que vous n'avez pas encore consultées apparaîtront ici.",
  },
  {
    value: "en-cours",
    label: "En cours",
    statuses: ["viewed", "shortlisted"],
    emptyTitle: "Aucune candidature en cours",
    emptyDescription:
      "Les candidatures consultées ou présélectionnées apparaîtront ici.",
  },
  {
    value: "acceptees",
    label: "Acceptées",
    statuses: ["accepted"],
    emptyTitle: "Aucune candidature acceptée",
    emptyDescription:
      "Acceptez une candidature pour créer un remplacement et ouvrir une conversation.",
  },
  {
    value: "refusees",
    label: "Refusées",
    statuses: ["rejected"],
    emptyTitle: "Aucune candidature refusée",
    emptyDescription: "Les candidatures que vous refusez apparaîtront ici.",
  },
  {
    value: "retirees",
    label: "Retirées",
    statuses: ["withdrawn"],
    emptyTitle: "Aucune candidature retirée",
    emptyDescription:
      "Les candidatures retirées par les remplaçants apparaîtront ici.",
  },
];

/** Liste des candidatures du cabinet, filtrée par onglets de statut. */
export function ApplicationList({
  applications,
  initialTab,
  highlightId,
}: {
  applications: CabinetApplicationItem[];
  initialTab?: string;
  highlightId?: string;
}) {
  const [tab, setTab] = useState(
    TABS.some((t) => t.value === initialTab) ? (initialTab as string) : "nouvelles",
  );

  // Candidature ciblée par une notification : défilement jusqu'à la carte.
  useEffect(() => {
    if (!highlightId) return;
    const el = document.getElementById(`candidature-${highlightId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId]);

  const activeTab = TABS.find((t) => t.value === tab) ?? TABS[0];
  const filtered = useMemo(
    () => applications.filter((a) => activeTab.statuses.includes(a.status)),
    [applications, activeTab],
  );

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Aucune candidature reçue"
        description="Publiez une annonce pour recevoir des candidatures de remplaçants."
      />
    );
  }

  const countFor = (statuses: ApplicationStatus[]) =>
    applications.filter((a) => statuses.includes(a.status)).length;

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto w-full flex-wrap justify-start sm:w-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              <span className="ml-1 tabular-nums text-muted-foreground">
                {countFor(t.statuses)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={activeTab.emptyTitle}
          description={activeTab.emptyDescription}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <div
              key={app.id}
              id={`candidature-${app.id}`}
              className={cn(
                app.id === highlightId &&
                  "rounded-xl ring-2 ring-primary/50 ring-offset-2 ring-offset-background",
              )}
            >
              <ApplicationCard app={app} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
