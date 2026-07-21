"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { updatePlacementChecklist } from "@/app/actions/applications";
import { PLACEMENT_CHECKLIST_ITEMS } from "@/lib/data/reference";

/**
 * Checklist administrative indicative d'un remplacement, côté cabinet.
 * Chaque case est enregistrée immédiatement (état complet envoyé au serveur).
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
    const previous = items;
    const next = { ...items, [key]: value };
    setItems(next);
    startTransition(async () => {
      const result = await updatePlacementChecklist(placementId, next);
      if (result.error) {
        setItems(previous);
        toast.error(result.error);
      } else {
        toast.success("Checklist mise à jour.");
      }
    });
  }

  const doneCount = PLACEMENT_CHECKLIST_ITEMS.filter(
    (i) => items[i.value],
  ).length;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">
        Checklist administrative — {doneCount}/{PLACEMENT_CHECKLIST_ITEMS.length}
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
      <p className="text-xs text-muted-foreground">
        Checklist indicative — ne constitue pas une validation officielle.
      </p>
    </div>
  );
}
