"use client";

import { useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import {
  PlacementCard,
  type CabinetPlacementItem,
} from "@/components/cabinet/placement-card";

export type PlacementGroup = "a-venir" | "en-cours" | "termines" | "annules";

const TABS: {
  value: PlacementGroup;
  label: string;
  emptyTitle: string;
  emptyDescription: string;
}[] = [
  {
    value: "a-venir",
    label: "À venir",
    emptyTitle: "Aucun remplacement à venir",
    emptyDescription:
      "Acceptez une candidature pour planifier un remplacement.",
  },
  {
    value: "en-cours",
    label: "En cours",
    emptyTitle: "Aucun remplacement en cours",
    emptyDescription:
      "Les remplacements confirmés dont les dates sont en cours apparaîtront ici.",
  },
  {
    value: "termines",
    label: "Terminés",
    emptyTitle: "Aucun remplacement terminé",
    emptyDescription:
      "Les remplacements que vous marquez comme terminés apparaîtront ici.",
  },
  {
    value: "annules",
    label: "Annulés",
    emptyTitle: "Aucun remplacement annulé",
    emptyDescription: "Les remplacements annulés apparaîtront ici.",
  },
];

/** Liste des remplacements du cabinet, groupés par onglets. */
export function PlacementList({
  placements,
}: {
  placements: (CabinetPlacementItem & { group: PlacementGroup })[];
}) {
  const [tab, setTab] = useState<PlacementGroup>(() => {
    const firstNonEmpty = TABS.find((t) =>
      placements.some((p) => p.group === t.value),
    );
    return firstNonEmpty?.value ?? "a-venir";
  });

  const activeTab = TABS.find((t) => t.value === tab) ?? TABS[0];
  const filtered = useMemo(
    () => placements.filter((p) => p.group === tab),
    [placements, tab],
  );

  if (placements.length === 0) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title="Aucun remplacement pour le moment"
        description="Acceptez une candidature pour créer votre premier remplacement."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as PlacementGroup)}>
        <TabsList className="h-auto w-full flex-wrap justify-start sm:w-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              <span className="ml-1 tabular-nums text-muted-foreground">
                {placements.filter((p) => p.group === t.value).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={activeTab.emptyTitle}
          description={activeTab.emptyDescription}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((placement) => (
            <PlacementCard key={placement.id} placement={placement} />
          ))}
        </div>
      )}
    </div>
  );
}
