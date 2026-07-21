"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { updatePlacementChecklist } from "@/app/actions/applications";
import { PLACEMENT_CHECKLIST_ITEMS } from "@/lib/data/reference";

/**
 * Checklist administrative indicative d'un remplacement — modifiable
 * par les deux parties (même action serveur que côté cabinet).
 */
export function PlacementChecklist({
  placementId,
  checklist,
  readOnly = false,
}: {
  placementId: string;
  checklist: Record<string, boolean>;
  readOnly?: boolean;
}) {
  const [items, setItems] = useState<Record<string, boolean>>(checklist);
  const [isPending, startTransition] = useTransition();

  function toggle(key: string, value: boolean) {
    const next = { ...items, [key]: value };
    setItems(next);
    startTransition(async () => {
      const result = await updatePlacementChecklist(placementId, next);
      if (result.error) {
        setItems(items);
        toast.error(result.error);
      }
    });
  }

  const doneCount = PLACEMENT_CHECKLIST_ITEMS.filter(
    (i) => items[i.value],
  ).length;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Checklist indicative — {doneCount}/{PLACEMENT_CHECKLIST_ITEMS.length}{" "}
        étapes cochées. Elle ne remplace pas vos démarches réglementaires.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {PLACEMENT_CHECKLIST_ITEMS.map((item) => (
          <li key={item.value}>
            <label className="flex items-start gap-2.5 text-sm">
              <Checkbox
                checked={Boolean(items[item.value])}
                disabled={readOnly || isPending}
                onCheckedChange={(checked) =>
                  toggle(item.value, checked === true)
                }
                aria-label={item.label}
              />
              <span className="leading-snug">{item.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
