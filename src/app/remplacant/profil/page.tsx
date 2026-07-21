import Link from "next/link";
import { Car, Eye, GraduationCap, MapPin, Stethoscope } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorState } from "@/components/shared/error-state";
import { ProfileCompletion } from "@/components/shared/profile-completion";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { IdentityForm, BioForm } from "@/app/remplacant/profil/profile-forms";
import {
  VisibilityForm,
  type VisibilitySettings,
} from "@/app/remplacant/profil/visibility-form";
import { PROFESSIONAL_STATUS_LABELS } from "@/lib/data/reference";

export const metadata = { title: "Mon profil" };

/** RPPS masqué : seuls les 4 derniers caractères restent lisibles. */
function maskRpps(rpps: string): string {
  if (rpps.length <= 4) return rpps;
  return `••• •••• ${rpps.slice(-4)}`;
}

function ReadRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}

export default async function ReplacementProfilePage() {
  const profile = await requireRole("replacement_dentist");
  const supabase = await createClient();

  const [rpRes, specialtiesRes, mobilityRes] = await Promise.all([
    supabase
      .from("replacement_profiles")
      .select("*")
      .eq("user_id", profile.id)
      .maybeSingle(),
    supabase
      .from("profile_specialties")
      .select("specialties(code, label)")
      .eq("user_id", profile.id),
    supabase
      .from("mobility_areas")
      .select("area_type, area_value")
      .eq("user_id", profile.id),
  ]);

  if (rpRes.error) {
    return <ErrorState />;
  }

  const rp = rpRes.data;
  const specialties = (specialtiesRes.data ?? [])
    .map((s) => s.specialties)
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const mobilityAreas = mobilityRes.data ?? [];

  const rawVisibility =
    rp?.public_visibility && typeof rp.public_visibility === "object" && !Array.isArray(rp.public_visibility)
      ? (rp.public_visibility as Record<string, unknown>)
      : {};
  const visibility: VisibilitySettings = {
    photo: rawVisibility.photo !== false,
    city: rawVisibility.city !== false,
    mobility: rawVisibility.mobility !== false,
    skills: rawVisibility.skills !== false,
    experience: rawVisibility.experience !== false,
    availability: rawVisibility.availability !== false,
    languages: rawVisibility.languages !== false,
    bio: rawVisibility.bio !== false,
  };

  const initials =
    `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase() ||
    "?";

  const mobilityDetails: string[] = [];
  if (rp?.mobility_radius_km != null) {
    mobilityDetails.push(`Rayon de ${rp.mobility_radius_km} km`);
  }
  if (rp?.national_mobility) mobilityDetails.push("Mobilité nationale");
  if (rp?.has_vehicle) mobilityDetails.push("Véhicule personnel");
  if (rp?.has_driving_license) mobilityDetails.push("Permis de conduire");
  if (rp?.needs_accommodation) mobilityDetails.push("Hébergement souhaité");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mon profil</h1>
          <p className="text-sm text-muted-foreground">
            Vos informations déclarées, visibles par les cabinets selon vos
            réglages.
          </p>
        </div>
        <VerificationBadge status={profile.verification_status} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <ProfileCompletion
            value={rp?.profile_completion ?? 0}
            className="flex-1"
          />
          <Button variant="outline" size="sm" asChild>
            <Link href="/remplacant/documents">Gérer mes documents</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identité</CardTitle>
            <CardDescription>
              Ces informations sont utilisées dans vos échanges avec les
              cabinets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar className="size-14">
                {profile.avatar_url ? (
                  <AvatarImage
                    src={profile.avatar_url}
                    alt={`Photo de ${profile.first_name} ${profile.last_name}`}
                  />
                ) : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {profile.first_name} {profile.last_name}
                </p>
                {rp?.professional_status ? (
                  <p className="text-sm text-muted-foreground">
                    {PROFESSIONAL_STATUS_LABELS[rp.professional_status]}
                  </p>
                ) : null}
              </div>
            </div>
            <IdentityForm
              defaultValues={{
                firstName: profile.first_name,
                lastName: profile.last_name,
                phone: profile.phone ?? "",
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Présentation</CardTitle>
            <CardDescription>
              Quelques lignes pour vous présenter aux cabinets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BioForm defaultBio={rp?.bio ?? ""} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="size-4 text-primary" aria-hidden />
              Informations professionnelles
            </CardTitle>
            <CardDescription>
              Informations déclarées lors de votre inscription — non
              modifiables ici.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <ReadRow
              label="Statut"
              value={
                rp?.professional_status
                  ? PROFESSIONAL_STATUS_LABELS[rp.professional_status]
                  : "—"
              }
            />
            <ReadRow label="Université" value={rp?.university ?? "—"} />
            {rp?.rpps_number ? (
              <ReadRow label="Numéro RPPS" value={maskRpps(rp.rpps_number)} />
            ) : null}
            {rp?.graduation_year ? (
              <ReadRow label="Année de diplôme" value={rp.graduation_year} />
            ) : null}
            {rp?.experience_years != null ? (
              <ReadRow
                label="Expérience"
                value={`${rp.experience_years} an${rp.experience_years > 1 ? "s" : ""}`}
              />
            ) : null}
            {rp?.languages && rp.languages.length > 0 ? (
              <ReadRow label="Langues" value={rp.languages.join(", ")} />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="size-4 text-primary" aria-hidden />
              Compétences
            </CardTitle>
          </CardHeader>
          <CardContent>
            {specialties.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune compétence déclarée.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {specialties.map((s) => (
                  <Badge key={s.code} variant="secondary">
                    {s.label}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="size-4 text-primary" aria-hidden />
              Mobilité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mobilityDetails.length > 0 ? (
              <ul className="space-y-1.5 text-sm">
                {mobilityDetails.map((detail) => (
                  <li key={detail} className="flex items-center gap-2">
                    <Car
                      className="size-3.5 text-muted-foreground"
                      aria-hidden="true"
                    />
                    {detail}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune information de mobilité déclarée.
              </p>
            )}
            {mobilityAreas.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {mobilityAreas.map((area) => (
                  <Badge key={`${area.area_type}-${area.area_value}`} variant="outline">
                    {area.area_value}
                  </Badge>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="size-4 text-primary" aria-hidden />
              Visibilité publique
            </CardTitle>
            <CardDescription>
              Choisissez les informations visibles par les cabinets sur votre
              profil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VisibilityForm initialSettings={visibility} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
