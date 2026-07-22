import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Send } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  ApplicationCard,
  type ApplicationCardData,
} from "@/components/remplacant/application-card";
import { formatDateRange } from "@/components/job-posts/format";
import type { ApplicationStatus } from "@/lib/data/reference";

export const metadata = { title: "Mes candidatures" };

const TABS: { value: string; label: string; statuses: ApplicationStatus[] }[] = [
  {
    value: "toutes",
    label: "Toutes",
    statuses: ["submitted", "viewed", "shortlisted", "accepted", "rejected", "withdrawn"],
  },
  { value: "envoyees", label: "Envoyées", statuses: ["submitted"] },
  { value: "consultees", label: "Consultées", statuses: ["viewed", "shortlisted"] },
  { value: "acceptees", label: "Acceptées", statuses: ["accepted"] },
  { value: "refusees", label: "Refusées", statuses: ["rejected"] },
  { value: "retirees", label: "Retirées", statuses: ["withdrawn"] },
];

const TAB_FOR_STATUS: Record<string, string> = {
  submitted: "envoyees",
  viewed: "consultees",
  shortlisted: "consultees",
  accepted: "acceptees",
  rejected: "refusees",
  withdrawn: "retirees",
};

export default async function ReplacementApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ candidature?: string }>;
}) {
  const { candidature } = await searchParams;
  const profile = await requireRole("replacement_dentist");
  const supabase = await createClient();

  const { data: applications, error } = await supabase
    .from("applications")
    .select(
      "id, status, submitted_at, message, job_posts(id, title, city, start_date, end_date, cabinet_profiles(name))",
    )
    .eq("applicant_user_id", profile.id)
    .order("submitted_at", { ascending: false });

  if (error) {
    return <ErrorState />;
  }

  const cards: ApplicationCardData[] = (applications ?? []).map((app) => ({
    id: app.id,
    status: app.status,
    submittedAtFr: formatDistanceToNow(new Date(app.submitted_at), {
      addSuffix: true,
      locale: fr,
    }),
    message: app.message,
    jobPostId: app.job_posts?.id ?? "",
    jobTitle: app.job_posts?.title ?? "Annonce supprimée",
    cabinetName: app.job_posts?.cabinet_profiles?.name ?? null,
    city: app.job_posts?.city ?? null,
    datesFr: formatDateRange(
      app.job_posts?.start_date,
      app.job_posts?.end_date,
    ),
  }));

  const searchCta = (
    <Button asChild>
      <Link href="/remplacant/annonces">
        <Send aria-hidden />
        Rechercher une annonce
      </Link>
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Candidatures"
        title="Mes candidatures"
        description="Suivez l'avancement de vos candidatures et échangez avec les cabinets."
      />

      {cards.length === 0 ? (
        <EmptyState
          icon={Send}
          title="Aucune candidature envoyée"
          description="Parcourez les annonces publiées et candidatez à celles qui correspondent à vos disponibilités."
          action={searchCta}
        />
      ) : (
        <Tabs
          defaultValue={
            (candidature &&
              TAB_FOR_STATUS[
                cards.find((c) => c.id === candidature)?.status ?? ""
              ]) ||
            "toutes"
          }
        >
          <div className="overflow-x-auto pb-1">
            <TabsList>
              {TABS.map((tab) => {
                const count = cards.filter((c) =>
                  tab.statuses.includes(c.status),
                ).length;
                return (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                    <span className="tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {TABS.map((tab) => {
            const filtered = cards.filter((c) =>
              tab.statuses.includes(c.status),
            );
            return (
              <TabsContent key={tab.value} value={tab.value} className="mt-2">
                {filtered.length === 0 ? (
                  <EmptyState
                    icon={Send}
                    title={`Aucune candidature « ${tab.label.toLowerCase()} »`}
                    description="Les candidatures correspondant à ce statut apparaîtront ici."
                    className="py-10"
                  />
                ) : (
                  <div className="space-y-4">
                    {filtered.map((card) => (
                      <div
                        key={card.id}
                        className={
                          card.id === candidature
                            ? "rounded-xl ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
                            : undefined
                        }
                      >
                        <ApplicationCard app={card} />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}
