import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificationPreferencesForm } from "@/components/settings/notification-preferences-form";
import { ExportDataButton } from "@/components/settings/export-data-button";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";
import { LEGAL_DISCLAIMER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Paramètres",
};

export default async function ParametresPage() {
  const profile = await requireUser();
  const profileHref =
    profile.role === "cabinet"
      ? "/cabinet/profil"
      : profile.role === "admin"
        ? "/admin"
        : "/remplacant/profil";

  const supabase = await createClient();
  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("email_notifications, in_app_notifications, marketing_emails")
    .eq("user_id", profile.id)
    .maybeSingle();

  return (
    <DashboardShell profile={profile} profileHref={profileHref}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos préférences, vos données et votre compte.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Choisissez comment vous souhaitez être informé.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationPreferencesForm
              initialValues={{
                emailNotifications: preferences?.email_notifications ?? true,
                inAppNotifications: preferences?.in_app_notifications ?? true,
                marketingEmails: preferences?.marketing_emails ?? false,
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>
              Modifiez le mot de passe utilisé pour vous connecter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/parametres/mot-de-passe">
                <KeyRound aria-hidden="true" />
                Changer mon mot de passe
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mes données (RGPD)</CardTitle>
            <CardDescription>
              Téléchargez une copie des données associées à votre compte
              (profil, candidatures, préférences…) au format JSON.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExportDataButton />
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Zone dangereuse</CardTitle>
            <CardDescription>
              La suppression de votre compte est définitive : profil, annonces,
              candidatures, messages et documents seront supprimés et ne
              pourront pas être récupérés.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteAccountDialog />
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">{LEGAL_DISCLAIMER}</p>
      </div>
    </DashboardShell>
  );
}
