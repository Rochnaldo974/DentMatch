import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import type { UserRole } from "@/lib/data/reference";

export type Profile = Tables<"profiles">;

/** Chemin du dashboard correspondant au rôle. */
export function dashboardPathForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "cabinet":
      return "/cabinet/dashboard";
    case "replacement_dentist":
      return "/remplacant/dashboard";
  }
}

/** Profil de l'utilisateur connecté (mis en cache par requête). */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
});

/** Exige un utilisateur connecté avec ce rôle, sinon redirige. */
export async function requireRole(role: UserRole): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion");
  if (profile.role !== role) redirect(dashboardPathForRole(profile.role));
  return profile;
}

/** Exige un utilisateur connecté (peu importe le rôle). */
export async function requireUser(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion");
  return profile;
}
