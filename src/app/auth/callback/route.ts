import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback d'authentification Supabase (confirmation d'email, lien de
 * récupération de mot de passe) : échange le code contre une session
 * puis redirige vers la destination demandée.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  // Uniquement des chemins internes (évite les redirections ouvertes).
  const destination =
    next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/onboarding";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(destination, origin));
    }
  }

  return NextResponse.redirect(new URL("/connexion?erreur=callback", origin));
}
