import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
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
import { VerificationBadge } from "@/components/shared/verification-badge";
import { UserVerificationActions } from "@/components/admin/user-verification-actions";
import { USER_ROLES, type UserRole } from "@/lib/data/reference";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Utilisateurs",
};

const ROLE_LABELS: Record<UserRole, string> = {
  cabinet: "Cabinet",
  replacement_dentist: "Remplaçant",
  admin: "Admin",
};

const ROLE_FILTERS: { value: UserRole | null; label: string }[] = [
  { value: null, label: "Tous" },
  { value: "cabinet", label: "Cabinets" },
  { value: "replacement_dentist", label: "Remplaçants" },
  { value: "admin", label: "Admins" },
];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const activeRole = USER_ROLES.includes(role as UserRole)
    ? (role as UserRole)
    : null;

  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, role, onboarding_completed, verification_status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (activeRole) query = query.eq("role", activeRole);

  const { data: profiles } = await query;
  const users = profiles ?? [];
  const userIds = users.map((u) => u.id);

  // Complétion : deux requêtes puis merge JS.
  const completionByUser = new Map<string, number>();
  if (userIds.length > 0) {
    const [{ data: cabinetProfiles }, { data: replacementProfiles }] =
      await Promise.all([
        supabase
          .from("cabinet_profiles")
          .select("user_id, profile_completion")
          .in("user_id", userIds),
        supabase
          .from("replacement_profiles")
          .select("user_id, profile_completion")
          .in("user_id", userIds),
      ]);
    for (const row of [
      ...(cabinetProfiles ?? []),
      ...(replacementProfiles ?? []),
    ]) {
      completionByUser.set(row.user_id, row.profile_completion);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground">
          Gérez les comptes et la vérification des profils.
        </p>
      </div>

      {/* Filtres par rôle (liens) */}
      <nav
        aria-label="Filtrer par rôle"
        className="inline-flex flex-wrap gap-1 rounded-lg bg-muted p-1"
      >
        {ROLE_FILTERS.map((filter) => {
          const isActive = filter.value === activeRole;
          return (
            <Link
              key={filter.label}
              href={
                filter.value
                  ? `/admin/utilisateurs?role=${filter.value}`
                  : "/admin/utilisateurs"
              }
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                isActive
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun utilisateur"
          description="Aucun compte ne correspond à ce filtre."
        />
      ) : (
        <>
          {/* Desktop : table */}
          <div className="hidden rounded-xl border bg-card lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Nom</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Onboarding</TableHead>
                  <TableHead>Vérification</TableHead>
                  <TableHead>Complétion</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead className="px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const name =
                    `${user.first_name} ${user.last_name}`.trim() || "—";
                  const completion = completionByUser.get(user.id);
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="px-4 font-medium">{name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.onboarding_completed ? (
                          <Badge
                            variant="outline"
                            className="border-verified/25 bg-verified-soft text-accent-foreground"
                          >
                            Terminé
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-warning/40 bg-warning-soft text-warning-foreground"
                          >
                            En cours
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <VerificationBadge
                          status={user.verification_status}
                          short
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {completion !== undefined ? `${completion} %` : "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {format(new Date(user.created_at), "d MMM yyyy", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <UserVerificationActions
                          userId={user.id}
                          userName={name}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile : cartes */}
          <ul className="space-y-3 lg:hidden">
            {users.map((user) => {
              const name = `${user.first_name} ${user.last_name}`.trim() || "—";
              const completion = completionByUser.get(user.id);
              return (
                <li key={user.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Inscription :{" "}
                        {format(new Date(user.created_at), "d MMM yyyy", {
                          locale: fr,
                        })}
                        {completion !== undefined
                          ? ` · Complétion : ${completion} %`
                          : ""}
                      </p>
                    </div>
                    <UserVerificationActions userId={user.id} userName={name} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
                    {user.onboarding_completed ? (
                      <Badge
                        variant="outline"
                        className="border-verified/25 bg-verified-soft text-accent-foreground"
                      >
                        Terminé
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-warning/40 bg-warning-soft text-warning-foreground"
                      >
                        En cours
                      </Badge>
                    )}
                    <VerificationBadge status={user.verification_status} short />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
