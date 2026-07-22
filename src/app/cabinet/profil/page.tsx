import { Images } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileCompletion } from "@/components/shared/profile-completion";
import { ProfileAdminForm } from "@/components/cabinet/profile-admin-form";
import { ProfilePresentationForm } from "@/components/cabinet/profile-presentation-form";
import { labelFor, publicMediaUrl } from "@/components/job-posts/format";
import { CABINET_PHOTO_TYPES } from "@/lib/data/reference";

export const metadata = { title: "Profil du cabinet" };

export default async function CabinetProfilePage() {
  const profile = await requireRole("cabinet");
  const supabase = await createClient();

  const { data: cabinet } = await supabase
    .from("cabinet_profiles")
    .select("*")
    .eq("user_id", profile.id)
    .single();

  if (!cabinet) {
    return (
      <ErrorState
        title="Profil cabinet introuvable"
        description="Terminez votre onboarding pour compléter votre profil."
      />
    );
  }

  const { data: photos } = await supabase
    .from("cabinet_photos")
    .select("id, photo_type, storage_path, display_order")
    .eq("cabinet_id", cabinet.id)
    .order("display_order", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Profil"
        title="Profil du cabinet"
        description="Ces informations sont visibles par les remplaçants sur vos annonces."
      />

      <Card>
        <CardContent>
          <ProfileCompletion
            value={cabinet.profile_completion}
            label="Complétion du profil du cabinet"
          />
        </CardContent>
      </Card>

      <ProfileAdminForm cabinet={cabinet} />

      <ProfilePresentationForm cabinet={cabinet} />

      <Card>
        <CardHeader>
          <CardTitle>Photos du cabinet</CardTitle>
          <CardDescription>
            Les photos ajoutées lors de l&apos;onboarding sont affichées aux
            remplaçants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!photos || photos.length === 0 ? (
            <EmptyState
              icon={Images}
              title="Aucune photo"
              description="Aucune photo n'a été ajoutée pour votre cabinet."
              className="py-10"
            />
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo) => (
                <li key={photo.id} className="space-y-1.5">
                  <div className="aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
                    {/* Aperçu direct : l'URL publique Supabase n'est pas éligible à next/image ici. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={publicMediaUrl(photo.storage_path)}
                      alt={
                        labelFor(CABINET_PHOTO_TYPES, photo.photo_type) ??
                        "Photo du cabinet"
                      }
                      className="size-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {labelFor(CABINET_PHOTO_TYPES, photo.photo_type) ?? "Photo"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
