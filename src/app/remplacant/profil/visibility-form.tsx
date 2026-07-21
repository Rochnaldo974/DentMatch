"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { saveReplacementStep9 } from "@/app/actions/onboarding-remplacant";

export type VisibilitySettings = {
  photo: boolean;
  city: boolean;
  mobility: boolean;
  skills: boolean;
  experience: boolean;
  availability: boolean;
  languages: boolean;
  bio: boolean;
};

const FIELDS: { key: keyof VisibilitySettings; label: string }[] = [
  { key: "photo", label: "Photo de profil" },
  { key: "city", label: "Ville de résidence" },
  { key: "mobility", label: "Zones de mobilité" },
  { key: "skills", label: "Compétences" },
  { key: "experience", label: "Expérience" },
  { key: "availability", label: "Disponibilités" },
  { key: "languages", label: "Langues" },
  { key: "bio", label: "Présentation" },
];

/** Réglages de visibilité du profil public (enregistrés à chaque changement). */
export function VisibilityForm({
  initialSettings,
}: {
  initialSettings: VisibilitySettings;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [isPending, startTransition] = useTransition();

  function toggle(key: keyof VisibilitySettings, value: boolean) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    startTransition(async () => {
      const result = await saveReplacementStep9(next);
      if (result.error) {
        setSettings(settings);
        toast.error(result.error);
        return;
      }
      toast.success("Visibilité mise à jour.");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {FIELDS.map((field) => (
        <div
          key={field.key}
          className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
        >
          <Label
            htmlFor={`visibility-${field.key}`}
            className="text-sm font-normal"
          >
            {field.label}
          </Label>
          <Switch
            id={`visibility-${field.key}`}
            checked={settings[field.key]}
            disabled={isPending}
            onCheckedChange={(checked) => toggle(field.key, checked === true)}
          />
        </div>
      ))}
    </div>
  );
}
