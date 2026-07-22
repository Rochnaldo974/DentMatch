"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Camera, Loader2, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { saveReplacementStep2 } from "@/app/actions/onboarding-remplacant";
import { uploadPublicPhoto } from "@/app/actions/settings";
import {
  replacementStep2Schema,
  type ReplacementStep2Input,
} from "@/lib/validation/onboarding-remplacant";
import { REUNION_COMMUNES, TERRITORIES } from "@/lib/data/reference";
import { DEFAULT_TERRITORY } from "@/lib/constants";
import type { ReplacementOnboardingData } from "@/components/onboarding/types";
import { StepFooter, StepHeader } from "./step-shell";

export function StepIdentite({
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
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    data.profile.avatar_url,
  );
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const rp = data.replacement;

  const form = useForm<ReplacementStep2Input>({
    resolver: zodResolver(replacementStep2Schema),
    defaultValues: {
      firstName: data.profile.first_name ?? "",
      lastName: data.profile.last_name ?? "",
      birthDate: rp?.birth_date ?? "",
      phone: data.profile.phone ?? "",
      professionalEmail: rp?.professional_email ?? "",
      addressLine: rp?.address_line ?? "",
      postalCode: rp?.postal_code ?? "",
      city: rp?.city ?? "",
      // Marché de lancement : La Réunion par défaut.
      territory: rp?.territory || DEFAULT_TERRITORY,
      bio: rp?.bio ?? "",
    },
  });

  const territory = form.watch("territory");
  const isReunion = territory === DEFAULT_TERRITORY;

  const initials =
    `${data.profile.first_name?.[0] ?? ""}${data.profile.last_name?.[0] ?? ""}`.toUpperCase() ||
    "?";

  function handlePhoto(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("kind", "avatar");
    setUploading(true);
    uploadPublicPhoto(formData)
      .then((result) => {
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.url) setPhotoUrl(result.url);
        toast.success("Photo de profil mise à jour.");
        router.refresh();
      })
      .finally(() => setUploading(false));
  }

  function onSubmit(values: ReplacementStep2Input) {
    startTransition(async () => {
      const result = await saveReplacementStep2(values);
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
          title="Informations personnelles"
          description="Ces informations servent à créer votre profil de remplaçant."
        />

        {/* Photo de profil (facultative) */}
        <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
          <Avatar className="size-16">
            <AvatarImage src={photoUrl ?? undefined} alt="Photo de profil" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1.5">
            <p className="text-sm font-medium">Photo de profil (facultative)</p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG ou WebP — 5 Mo maximum.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              aria-label="Téléverser une photo de profil"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhoto(file);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Camera className="size-4" aria-hidden="true" />
              )}
              {photoUrl ? "Changer la photo" : "Ajouter une photo"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input autoComplete="given-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input autoComplete="family-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de naissance</FormLabel>
                <FormControl>
                  <Input type="date" autoComplete="bday" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    autoComplete="tel"
                    placeholder="06 12 34 56 78"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="professionalEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email professionnel</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.fr"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="addressLine"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input autoComplete="street-address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code postal</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    maxLength={5}
                    autoComplete="postal-code"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Ville</FormLabel>
                {isReunion ? (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez une commune" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REUNION_COMMUNES.map((commune) => (
                        <SelectItem key={commune} value={commune}>
                          {commune}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <FormControl>
                    <Input autoComplete="address-level2" {...field} />
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="territory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Territoire</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  // La ville passe en liste de communes : on efface une
                  // saisie libre qui n'y figurerait pas.
                  if (
                    value === DEFAULT_TERRITORY &&
                    !(REUNION_COMMUNES as readonly string[]).includes(
                      form.getValues("city"),
                    )
                  ) {
                    form.setValue("city", "");
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisissez un territoire" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TERRITORIES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Courte présentation</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Présentez votre parcours et ce que vous recherchez…"
                  {...field}
                />
              </FormControl>
              <FormDescription>30 caractères minimum.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Alert>
          <ShieldCheck aria-hidden="true" />
          <AlertDescription>
            Votre date de naissance et votre adresse complète ne sont jamais
            affichées publiquement.
          </AlertDescription>
        </Alert>

        <StepFooter onBack={onBack} pending={isPending} />
      </form>
    </Form>
  );
}
