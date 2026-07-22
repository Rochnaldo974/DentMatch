import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { JobPostList } from "@/components/cabinet/job-post-list";

export const metadata = { title: "Mes annonces" };

export default async function CabinetJobPostsPage() {
  const profile = await requireRole("cabinet");
  const supabase = await createClient();

  const { data: cabinet } = await supabase
    .from("cabinet_profiles")
    .select("id")
    .eq("user_id", profile.id)
    .single();

  if (!cabinet) {
    return (
      <ErrorState
        title="Profil cabinet introuvable"
        description="Terminez votre onboarding pour gérer vos annonces."
      />
    );
  }

  const { data: posts, error } = await supabase
    .from("job_posts")
    .select(
      "id, title, city, start_date, end_date, status, urgent, created_at, published_at",
    )
    .eq("cabinet_id", cabinet.id)
    .order("created_at", { ascending: false });

  if (error) {
    return <ErrorState />;
  }

  const postIds = (posts ?? []).map((p) => p.id);
  const counts: Record<string, number> = {};
  if (postIds.length > 0) {
    const { data: apps } = await supabase
      .from("applications")
      .select("job_post_id")
      .in("job_post_id", postIds);
    for (const app of apps ?? []) {
      counts[app.job_post_id] = (counts[app.job_post_id] ?? 0) + 1;
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Annonces"
        title="Mes annonces"
        description="Créez, publiez et suivez vos annonces de remplacement."
        action={
          <Button asChild>
            <Link href="/cabinet/annonces/nouvelle">
              <Plus aria-hidden />
              Publier une annonce
            </Link>
          </Button>
        }
      />

      <JobPostList posts={posts ?? []} applicationCounts={counts} />
    </div>
  );
}
