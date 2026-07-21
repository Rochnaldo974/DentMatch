import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ErrorState } from "@/components/shared/error-state";
import {
  PlacementList,
  type PlacementGroup,
} from "@/components/cabinet/placement-list";
import type { CabinetPlacementItem } from "@/components/cabinet/placement-card";
import type { PlacementStatus } from "@/lib/data/reference";

export const metadata = { title: "Remplacements" };

function groupFor(
  status: PlacementStatus,
  startDate: string | null,
  today: string,
): PlacementGroup {
  if (status === "completed") return "termines";
  if (status === "cancelled") return "annules";
  if (startDate && startDate > today) return "a-venir";
  return "en-cours";
}

export default async function CabinetPlacementsPage() {
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
        description="Terminez votre onboarding pour suivre vos remplacements."
      />
    );
  }

  const { data: rows, error } = await supabase
    .from("placements")
    .select(
      `id, status, start_date, end_date, application_id, administrative_checklist,
       job_posts(title),
       replacement:profiles!placements_replacement_user_id_fkey(first_name, last_name, phone, avatar_url)`,
    )
    .eq("cabinet_id", cabinet.id)
    .order("start_date", { ascending: true, nullsFirst: false });

  if (error) {
    return <ErrorState />;
  }

  const today = new Date().toISOString().slice(0, 10);

  const placements: (CabinetPlacementItem & { group: PlacementGroup })[] = (
    rows ?? []
  ).map((row) => ({
    id: row.id,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    applicationId: row.application_id,
    checklist:
      row.administrative_checklist &&
      typeof row.administrative_checklist === "object" &&
      !Array.isArray(row.administrative_checklist)
        ? (row.administrative_checklist as Record<string, boolean>)
        : {},
    jobTitle: row.job_posts?.title ?? "Remplacement",
    replacement: {
      firstName: row.replacement?.first_name ?? "",
      lastName: row.replacement?.last_name ?? "",
      phone: row.replacement?.phone ?? null,
      avatarUrl: row.replacement?.avatar_url ?? null,
    },
    group: groupFor(row.status, row.start_date, today),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Remplacements
        </h1>
        <p className="text-sm text-muted-foreground">
          Suivez vos remplacements confirmés et leur checklist administrative.
        </p>
      </div>

      <PlacementList placements={placements} />
    </div>
  );
}
