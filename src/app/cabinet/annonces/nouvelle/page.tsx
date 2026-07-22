import { CalendarDays } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ErrorState } from "@/components/shared/error-state";
import { JobPostForm } from "@/components/cabinet/job-post-form";

export const metadata = { title: "Publier une annonce" };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function NewJobPostPage({
  searchParams,
}: {
  searchParams: Promise<{ debut?: string; fin?: string }>;
}) {
  const { debut, fin } = await searchParams;
  const profile = await requireRole("cabinet");
  const supabase = await createClient();

  const { data: cabinet } = await supabase
    .from("cabinet_profiles")
    .select("id, city")
    .eq("user_id", profile.id)
    .single();

  if (!cabinet) {
    return (
      <ErrorState
        title="Profil cabinet introuvable"
        description="Terminez votre onboarding pour publier une annonce."
      />
    );
  }

  // Dates transmises par la recherche de remplaçant (pré-remplissage).
  const startDate = debut && DATE_RE.test(debut) ? debut : undefined;
  const endDate = fin && DATE_RE.test(fin) ? fin : undefined;
  const prefilled = Boolean(startDate || endDate);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Publier une annonce
        </h1>
        <p className="text-sm text-muted-foreground">
          Décrivez votre besoin de remplacement. Vous pouvez enregistrer un
          brouillon et publier plus tard.
        </p>
      </div>

      {prefilled ? (
        <Alert className="border-primary/25 bg-primary/5">
          <CalendarDays className="size-4" aria-hidden="true" />
          <AlertDescription>
            Dates pré-remplies depuis votre recherche de remplaçant —
            modifiables à tout moment.
          </AlertDescription>
        </Alert>
      ) : null}

      <JobPostForm
        cabinetCity={cabinet.city}
        defaultValues={
          prefilled
            ? {
                ...(startDate ? { startDate } : {}),
                ...(endDate ? { endDate } : {}),
              }
            : undefined
        }
      />
    </div>
  );
}
