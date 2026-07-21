"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { completeCabinetStep } from "@/app/actions/onboarding-cabinet";
import { deleteCabinetPhoto, uploadPublicPhoto } from "@/app/actions/settings";
import { CABINET_PHOTO_TYPES } from "@/lib/data/reference";
import {
  ALLOWED_PHOTO_MIME_TYPES,
  MAX_PHOTO_SIZE_BYTES,
  PUBLIC_MEDIA_BUCKET,
} from "@/lib/constants";
import type { CabinetOnboardingData } from "@/components/onboarding/types";
import type { Tables } from "@/types/database";
import { StepActions } from "./step-actions";

function PhotoSlot({
  type,
  label,
  photo,
}: {
  type: string;
  label: string;
  photo: Tables<"cabinet_photos"> | undefined;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Libère l'URL d'aperçu locale quand elle est remplacée ou démontée.
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const publicUrl = photo
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PUBLIC_MEDIA_BUCKET}/${photo.storage_path}`
    : null;
  const displayedUrl = publicUrl ?? preview;

  const handleFile = (file: File) => {
    if (!(ALLOWED_PHOTO_MIME_TYPES as readonly string[]).includes(file.type)) {
      toast.error("Format non accepté (JPG, PNG ou WebP).");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      toast.error("Image trop volumineuse (5 Mo maximum).");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const formData = new FormData();
    formData.set("file", file);
    formData.set("kind", type);

    startTransition(async () => {
      const result = await uploadPublicPhoto(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Photo « ${label} » ajoutée.`);
        // La transition attend le rafraîchissement : la photo serveur et la
        // fin de l'aperçu local sont committées ensemble.
        router.refresh();
      }
      setPreview(null);
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label={`Ajouter une photo : ${label}`}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFile(file);
          event.target.value = "";
        }}
      />
      {displayedUrl ? (
        <div className="relative overflow-hidden rounded-xl border">
          {/* Aperçu direct : l'URL publique Supabase n'est pas éligible à next/image ici. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayedUrl}
            alt={`Photo du cabinet : ${label}`}
            className="aspect-video w-full object-cover"
          />
          {isPending ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2
                className="size-5 animate-spin text-foreground"
                aria-hidden="true"
              />
            </div>
          ) : null}
          {photo ? (
            <ConfirmDialog
              trigger={
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  className="absolute top-2 right-2 shadow-sm"
                  disabled={isPending}
                  aria-label={`Supprimer la photo « ${label} »`}
                >
                  <Trash2
                    className="size-4 text-destructive"
                    aria-hidden="true"
                  />
                </Button>
              }
              title="Supprimer cette photo ?"
              description={`La photo « ${label} » sera définitivement supprimée.`}
              confirmLabel="Supprimer"
              destructive
              onConfirm={async () => {
                const result = await deleteCabinetPhoto(photo.id);
                if (result.error) toast.error(result.error);
                else {
                  toast.success("Photo supprimée.");
                  router.refresh();
                }
              }}
            />
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="size-5" aria-hidden="true" />
          )}
          Ajouter une photo
        </button>
      )}
    </div>
  );
}

/** Étape 5 — Photos du cabinet (entièrement facultative). */
export function StepPhotos({
  data,
  onBack,
  onDone,
}: {
  data: CabinetOnboardingData;
  onBack: () => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleContinue = () => {
    startTransition(async () => {
      const result = await completeCabinetStep(5);
      if (result.error) {
        toast.error(result.error);
      } else {
        router.refresh();
        onDone();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photos</CardTitle>
        <CardDescription>
          Ajoutez des photos pour donner envie aux remplaçants de découvrir
          votre cabinet. Cette étape est entièrement facultative (JPG, PNG ou
          WebP, 5 Mo maximum par photo).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {CABINET_PHOTO_TYPES.map((photoType) => (
            <PhotoSlot
              key={photoType.value}
              type={photoType.value}
              label={photoType.label}
              photo={data.photos.find(
                (photo) => photo.photo_type === photoType.value,
              )}
            />
          ))}
        </div>
        <StepActions
          onBack={onBack}
          pending={isPending}
          submitLabel="Continuer"
          onNext={handleContinue}
        />
      </CardContent>
    </Card>
  );
}
