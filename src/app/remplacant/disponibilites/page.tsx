import { CalendarDays, Info } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { AvailabilityForm } from "@/components/remplacant/availability-form";
import { AvailabilityDeleteButton } from "@/components/remplacant/availability-delete-button";
import { formatDateRange, labelFor } from "@/components/job-posts/format";
import { AVAILABILITY_TYPES, WORKING_DAYS } from "@/lib/data/reference";

export const metadata = { title: "Mes disponibilités" };

export default async function ReplacementAvailabilitiesPage() {
  const profile = await requireRole("replacement_dentist");
  const supabase = await createClient();

  const { data: availabilities, error } = await supabase
    .from("availabilities")
    .select("id, type, start_date, end_date, recurring_days, notes, created_at")
    .eq("user_id", profile.id)
    .order("start_date", { ascending: true, nullsFirst: false });

  if (error) {
    return <ErrorState />;
  }

  const items = availabilities ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Disponibilités"
        title="Mes disponibilités"
        description="Déclarez vos créneaux pour faciliter la mise en relation avec les cabinets."
      />

      <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-secondary px-4 py-3 text-sm text-secondary-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          Vos disponibilités sont des informations déclarées, visibles selon
          vos réglages de visibilité. Elles aident les cabinets à identifier
          les remplaçants disponibles sur leurs dates, sans engagement de votre
          part.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Ajouter une disponibilité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AvailabilityForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Créneaux déclarés ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Aucune disponibilité déclarée"
                description="Ajoutez une date, une plage ou des jours récurrents avec le formulaire ci-contre."
                className="py-10"
              />
            ) : (
              <ul className="divide-y">
                {items.map((a) => {
                  const typeLabel =
                    labelFor(AVAILABILITY_TYPES, a.type) ?? a.type;
                  const detail =
                    a.type === "recurrent"
                      ? a.recurring_days
                          .map((d) => labelFor(WORKING_DAYS, d) ?? d)
                          .join(", ")
                      : formatDateRange(a.start_date, a.end_date);
                  return (
                    <li
                      key={a.id}
                      className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{typeLabel}</Badge>
                          <span className="text-sm font-medium">
                            {detail || "Dates non précisées"}
                          </span>
                        </div>
                        {a.notes ? (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {a.notes}
                          </p>
                        ) : null}
                      </div>
                      <AvailabilityDeleteButton id={a.id} />
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
