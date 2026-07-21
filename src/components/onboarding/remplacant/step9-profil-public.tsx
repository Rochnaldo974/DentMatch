"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MapPin, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { VerificationBadge } from "@/components/shared/verification-badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { saveReplacementStep9 } from "@/app/actions/onboarding-remplacant";
import { replacementStep9Schema } from "@/lib/validation/onboarding-remplacant";
import { PROFESSIONAL_STATUS_LABELS } from "@/lib/data/reference";
import type { ReplacementOnboardingData } from "@/components/onboarding/types";
import { StepFooter, StepHeader } from "./step-shell";

type VisibilityValues = {
  photo: boolean;
  city: boolean;
  mobility: boolean;
  skills: boolean;
  experience: boolean;
  availability: boolean;
  languages: boolean;
  bio: boolean;
};

const VISIBILITY_FIELDS: {
  name: keyof VisibilityValues;
  label: string;
  description: string;
}[] = [
  {
    name: "photo",
    label: "Photo de profil",
    description: "Afficher votre photo sur votre profil public.",
  },
  {
    name: "city",
    label: "Ville de résidence",
    description: "Afficher votre ville (jamais votre adresse complète).",
  },
  {
    name: "mobility",
    label: "Mobilité",
    description: "Afficher vos zones et conditions de mobilité.",
  },
  {
    name: "skills",
    label: "Compétences",
    description: "Afficher vos spécialités et actes maîtrisés.",
  },
  {
    name: "experience",
    label: "Expérience",
    description: "Afficher vos années d’expérience et votre parcours.",
  },
  {
    name: "availability",
    label: "Disponibilités",
    description: "Afficher vos créneaux de disponibilité.",
  },
  {
    name: "languages",
    label: "Langues parlées",
    description: "Afficher les langues que vous parlez.",
  },
  {
    name: "bio",
    label: "Présentation",
    description: "Afficher votre courte présentation.",
  },
];

export function StepProfilPublic({
  data,
  onBack,
  onNext,
}: {
  data: ReplacementOnboardingData;
  onBack: () => void;
  onNext: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const stored = (data.replacement?.public_visibility ?? {}) as Partial<
    Record<keyof VisibilityValues, boolean>
  >;

  // Les valeurs par défaut du schéma rendent z.input différent de z.output :
  // on aligne le resolver sur les valeurs du formulaire (pattern du projet).
  const form = useForm<VisibilityValues>({
    resolver: zodResolver(
      replacementStep9Schema,
    ) as unknown as Resolver<VisibilityValues>,
    defaultValues: {
      photo: stored.photo ?? true,
      city: stored.city ?? true,
      mobility: stored.mobility ?? true,
      skills: stored.skills ?? true,
      experience: stored.experience ?? true,
      availability: stored.availability ?? true,
      languages: stored.languages ?? true,
      bio: stored.bio ?? true,
    },
  });

  const showPhoto = form.watch("photo");
  const showCity = form.watch("city");

  const firstName = data.profile.first_name ?? "";
  const lastName = data.profile.last_name ?? "";
  const initials =
    `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";
  const publicName =
    [firstName, lastName ? `${lastName[0]}.` : ""].filter(Boolean).join(" ") ||
    "Votre nom";
  const status = data.replacement?.professional_status ?? "qualified_dentist";

  function onSubmit(values: VisibilityValues) {
    startTransition(async () => {
      const result = await saveReplacementStep9(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
      onNext();
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        <StepHeader
          title="Profil public"
          description="Choisissez les informations visibles par les cabinets sur votre profil."
        />

        <Alert>
          <ShieldCheck aria-hidden="true" />
          <AlertDescription>
            Vos documents, identifiants professionnels, date de naissance et
            adresse ne sont jamais visibles publiquement.
          </AlertDescription>
        </Alert>

        {/* Aperçu de la carte publique */}
        <div className="space-y-2.5 rounded-xl border bg-muted/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Aperçu de votre carte publique
          </p>
          <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <Avatar className="size-12">
              {showPhoto && data.profile.avatar_url ? (
                <AvatarImage
                  src={data.profile.avatar_url}
                  alt="Photo de profil"
                />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{publicName}</p>
              <p className="text-xs text-muted-foreground">
                {PROFESSIONAL_STATUS_LABELS[status]}
              </p>
              {showCity && data.replacement?.city ? (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" aria-hidden="true" />
                  {data.replacement.city}
                </p>
              ) : null}
            </div>
            <VerificationBadge
              status={data.profile.verification_status}
              short
            />
          </div>
        </div>

        <div className="space-y-3">
          {VISIBILITY_FIELDS.map((f) => (
            <FormField
              key={f.name}
              control={form.control}
              name={f.name}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-card px-4 py-3">
                  <div className="space-y-0.5 pr-4">
                    <FormLabel>{f.label}</FormLabel>
                    <FormDescription>{f.description}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
        </div>

        <StepFooter onBack={onBack} pending={isPending} />
      </form>
    </Form>
  );
}
