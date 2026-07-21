import type { Metadata } from "next";
import { ScrollText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Administration",
};

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: cabinetCount },
    { count: replacementCount },
    { count: adminCount },
    { count: pendingDocumentsCount },
    { count: publishedJobPostsCount },
    { count: applicationsCount },
    { data: auditEvents },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "cabinet"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "replacement_dentist"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin"),
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .in("status", ["uploaded", "pending"])
      .eq("is_simulated", false),
    supabase
      .from("job_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase
      .from("audit_events")
      .select("id, created_at, event_type, entity_type, actor_user_id")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const totalUsers =
    (cabinetCount ?? 0) + (replacementCount ?? 0) + (adminCount ?? 0);

  const stats = [
    {
      label: "Utilisateurs",
      value: totalUsers,
      detail: `${cabinetCount ?? 0} cabinets · ${replacementCount ?? 0} remplaçants · ${adminCount ?? 0} admins`,
    },
    {
      label: "Documents à vérifier",
      value: pendingDocumentsCount ?? 0,
      detail: "Téléversés ou en attente, non simulés",
    },
    {
      label: "Annonces publiées",
      value: publishedJobPostsCount ?? 0,
      detail: "Actuellement visibles",
    },
    {
      label: "Candidatures",
      value: applicationsCount ?? 0,
      detail: "Total depuis l'ouverture",
    },
  ];

  const events = auditEvents ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Vue d&apos;ensemble
        </h1>
        <p className="text-sm text-muted-foreground">
          Suivi de l&apos;activité de la plateforme.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Derniers événements d&apos;audit
        </h2>

        {events.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="Aucun événement"
            description="Les actions sensibles réalisées sur la plateforme apparaîtront ici."
          />
        ) : (
          <>
            {/* Desktop : table */}
            <div className="hidden rounded-xl border bg-card md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">Date</TableHead>
                    <TableHead>Événement</TableHead>
                    <TableHead>Entité</TableHead>
                    <TableHead className="px-4">Acteur</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="px-4 whitespace-nowrap text-muted-foreground">
                        {format(new Date(event.created_at), "d MMM yyyy HH:mm", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {event.event_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {event.entity_type}
                      </TableCell>
                      <TableCell className="px-4 font-mono text-xs text-muted-foreground">
                        {event.actor_user_id
                          ? event.actor_user_id.slice(0, 8)
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile : cartes */}
            <ul className="space-y-3 md:hidden">
              {events.map((event) => (
                <li key={event.id} className="rounded-xl border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {event.event_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(event.created_at), "d MMM yyyy HH:mm", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Entité : {event.entity_type}
                    {event.actor_user_id ? (
                      <>
                        {" · "}Acteur :{" "}
                        <span className="font-mono text-xs">
                          {event.actor_user_id.slice(0, 8)}
                        </span>
                      </>
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
