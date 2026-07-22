import Link from "next/link";
import {
  Building2,
  CalendarCheck,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PlacementStatusBadge } from "@/components/shared/status-badge";
import { PlacementChecklist } from "@/components/remplacant/placement-checklist";
import { OpenConversationButton } from "@/components/remplacant/open-conversation-button";
import { formatDateRange } from "@/components/job-posts/format";
import type { PlacementStatus } from "@/lib/data/reference";

export const metadata = { title: "Mes remplacements" };

type PlacementItem = {
  id: string;
  status: PlacementStatus;
  start_date: string | null;
  end_date: string | null;
  application_id: string;
  administrative_checklist: unknown;
  job_posts: { title: string } | null;
  cabinet_profiles: {
    name: string;
    city: string | null;
    phone: string | null;
    email: string | null;
  } | null;
};

function PlacementCard({ placement }: { placement: PlacementItem }) {
  const cabinet = placement.cabinet_profiles;
  const dates = formatDateRange(placement.start_date, placement.end_date);
  const checklist =
    placement.administrative_checklist &&
    typeof placement.administrative_checklist === "object" &&
    !Array.isArray(placement.administrative_checklist)
      ? (placement.administrative_checklist as Record<string, boolean>)
      : {};

  return (
    <article className="rounded-xl border bg-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-snug">
            {placement.job_posts?.title ?? "Remplacement"}
          </h3>
          <div className="mt-1.5 space-y-1 text-sm text-muted-foreground">
            {cabinet ? (
              <p className="flex items-center gap-1.5">
                <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
                {cabinet.name}
              </p>
            ) : null}
            {cabinet?.city ? (
              <p className="flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                {cabinet.city}
              </p>
            ) : null}
            {dates ? (
              <p className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
                {dates}
              </p>
            ) : null}
          </div>
        </div>
        <PlacementStatusBadge status={placement.status} className="shrink-0" />
      </div>

      {cabinet?.phone || cabinet?.email ? (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 rounded-lg bg-muted/50 p-3 text-sm">
          {cabinet.phone ? (
            <a
              href={`tel:${cabinet.phone}`}
              className="flex items-center gap-1.5 font-medium underline-offset-4 hover:underline"
            >
              <Phone className="size-3.5 text-muted-foreground" aria-hidden="true" />
              {cabinet.phone}
            </a>
          ) : null}
          {cabinet.email ? (
            <a
              href={`mailto:${cabinet.email}`}
              className="flex items-center gap-1.5 font-medium underline-offset-4 hover:underline"
            >
              <Mail className="size-3.5 text-muted-foreground" aria-hidden="true" />
              {cabinet.email}
            </a>
          ) : null}
        </div>
      ) : null}

      <Separator className="my-4" />

      <PlacementChecklist
        placementId={placement.id}
        checklist={checklist}
        readOnly={placement.status !== "confirmed"}
      />

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
        <OpenConversationButton applicationId={placement.application_id} />
      </div>
    </article>
  );
}

export default async function ReplacementPlacementsPage() {
  const profile = await requireRole("replacement_dentist");
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: placements, error } = await supabase
    .from("placements")
    .select(
      "id, status, start_date, end_date, application_id, administrative_checklist, job_posts(title), cabinet_profiles(name, city, phone, email)",
    )
    .eq("replacement_user_id", profile.id)
    .order("start_date", { ascending: true, nullsFirst: false });

  if (error) {
    return <ErrorState />;
  }

  const all = (placements ?? []) as PlacementItem[];
  const tabs: { value: string; label: string; items: PlacementItem[] }[] = [
    {
      value: "a-venir",
      label: "À venir",
      items: all.filter(
        (p) =>
          p.status === "confirmed" && (!p.start_date || p.start_date > today),
      ),
    },
    {
      value: "en-cours",
      label: "En cours",
      items: all.filter(
        (p) => p.status === "confirmed" && p.start_date && p.start_date <= today,
      ),
    },
    {
      value: "termines",
      label: "Terminés",
      items: all.filter((p) => p.status === "completed"),
    },
    {
      value: "annules",
      label: "Annulés",
      items: all.filter((p) => p.status === "cancelled"),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Remplacements"
        title="Mes remplacements"
        description="Retrouvez vos remplacements confirmés et leur checklist administrative indicative."
      />

      {all.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Aucun remplacement pour le moment"
          description="Vos remplacements confirmés apparaîtront ici après acceptation d'une candidature."
          action={
            <Link
              href="/remplacant/annonces"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Rechercher une annonce
            </Link>
          }
        />
      ) : (
        <Tabs defaultValue="a-venir">
          <div className="overflow-x-auto pb-1">
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                  <span className="tabular-nums text-muted-foreground">
                    {tab.items.length}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-2">
              {tab.items.length === 0 ? (
                <EmptyState
                  icon={CalendarCheck}
                  title={`Aucun remplacement « ${tab.label.toLowerCase()} »`}
                  className="py-10"
                />
              ) : (
                <div className="space-y-4">
                  {tab.items.map((placement) => (
                    <PlacementCard key={placement.id} placement={placement} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
