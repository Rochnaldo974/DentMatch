"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateNotificationPreferences } from "@/app/actions/settings";

type Preferences = {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  marketingEmails: boolean;
};

const FIELDS: {
  key: keyof Preferences;
  label: string;
  description: string;
}[] = [
  {
    key: "emailNotifications",
    label: "Notifications par email",
    description:
      "Recevez un email pour les candidatures, messages et remplacements.",
  },
  {
    key: "inAppNotifications",
    label: "Notifications dans l'application",
    description: "Affichez les notifications dans votre espace connecté.",
  },
  {
    key: "marketingEmails",
    label: "Emails d'information",
    description: "Nouveautés et conseils, quelques emails par mois au plus.",
  },
];

export function NotificationPreferencesForm({
  initialValues,
}: {
  initialValues: Preferences;
}) {
  const [values, setValues] = useState<Preferences>(initialValues);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateNotificationPreferences(values);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Préférences enregistrées.");
    });
  }

  return (
    <div className="space-y-5">
      {FIELDS.map(({ key, label, description }) => (
        <div key={key} className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor={`pref-${key}`}>{label}</Label>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Switch
            id={`pref-${key}`}
            checked={values[key]}
            onCheckedChange={(checked) =>
              setValues((prev) => ({ ...prev, [key]: checked }))
            }
          />
        </div>
      ))}

      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </div>
  );
}
