import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ErrorState } from "@/components/shared/error-state";
import { JobPostForm } from "@/components/cabinet/job-post-form";

export const metadata = { title: "Publier une annonce" };

export default async function NewJobPostPage() {
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

      <JobPostForm cabinetCity={cabinet.city} />
    </div>
  );
}
